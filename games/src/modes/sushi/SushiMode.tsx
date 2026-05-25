import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useGameDispatch, useGameState } from '../../core/state/gameState';
import type { CustomerOrder, DisplayLanguage, VocabItem } from '../../core/types';
import { speakChinese } from '../../core/systems/audio';
import { addStudyStars, getActiveProfile } from '../../profile/profileBridge';
import type { CourseMeta } from '../../data/vocab';
import { saveSessionResult, getGameLeaderboard } from '../../core/systems/hallOfFame';
import type { HallOfFameEntry } from '../../core/types';
import { getSpawnInterval } from '../../core/systems/scoring';

const MAX_CUSTOMERS = 3;
const SPAWN_SECONDS = 6;
const ROUND_SECONDS = 75;
const BELT_ITEMS_COUNT = 20;
const FIRST_SPAWN_DELAY = 3000; // 3 seconds for first customer
const MAX_WORD_APPEARANCES = 2; // Max times a word can appear per session
const MOBILE_BREAKPOINT = 480;

function buildShuffledDeck<T>(items: T[], copies: number): T[] {
  // Per-round shuffle: each "round" contains every item exactly once.
  // This guarantees every word appears in the first `items.length` customers.
  const deck: T[] = [];
  for (let c = 0; c < copies; c++) {
    const round = [...items];
    for (let i = round.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [round[i], round[j]] = [round[j], round[i]];
    }
    deck.push(...round);
  }
  return deck;
}

const rid = () => Math.random().toString(36).slice(2, 9);

type Props = {
  words: VocabItem[];
  courseThemes: Record<string, CourseMeta>;
  language: DisplayLanguage;
  onGameActiveChange?: (active: boolean) => void;
};

// Customer animation phase
type CustomerAnimPhase = 'entering' | 'seated' | 'exiting' | 'exiting-wrong';

interface CustomerWithAnim extends CustomerOrder {
  animPhase: CustomerAnimPhase;
  slotIndex: number;
}

// 🎊 Confetti particles
interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

// 💰 Coin animation
interface CoinAnim {
  id: string;
  x: number;
  y: number;
  value: number;
}

export function SushiMode({ words, courseThemes, language, onGameActiveChange }: Props) {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [customers, setCustomers] = useState<CustomerWithAnim[]>([]);
  const [spawnTick, setSpawnTick] = useState(SPAWN_SECONDS);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [ended, setEnded] = useState(false);
  const SUSHI_EMOJIS = ['🍣', '🍤', '🍙', '🍱', '🍜', '🍡', '🥟', '🍚'];

  function getSushiEmoji(wordId: string): string {
    // Deterministic assignment so each word keeps the same emoji during gameplay
    let hash = 0;
    for (let i = 0; i < wordId.length; i++) {
      hash = ((hash << 5) - hash) + wordId.charCodeAt(i);
      hash |= 0;
    }
    return SUSHI_EMOJIS[Math.abs(hash) % SUSHI_EMOJIS.length];
  }

  const [beltItems, setBeltItems] = useState<VocabItem[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [coins, setCoins] = useState<CoinAnim[]>([]);
  // Drag state is stored in native dataTransfer (no React state during drag to avoid re-render freeze)
  const [gameStarted, setGameStarted] = useState(false);
  const [firstSpawned, setFirstSpawned] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [correctCustomerId, setCorrectCustomerId] = useState<string | null>(null);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [scorePopup, setScorePopup] = useState<{ value: number; x: number; y: number } | null>(null);
  // Which course the user selected on the start screen
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  // Which themes within the course the user selected (empty = all themes)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  // Compute words filtered by selected course (and optionally themes)
  const activeWords = useMemo(() => {
    if (!selectedCourse) return words;
    const byCourse = words.filter(w => w.course === selectedCourse);
    if (selectedThemes.length === 0) return byCourse;
    return byCourse.filter(w => selectedThemes.includes(w.category));
  }, [words, selectedCourse, selectedThemes]);
  // Themes available for the selected course
  const metaForCourse = selectedCourse ? courseThemes[selectedCourse] : null;
  const themesForCourse = metaForCourse?.themes || [];
  // Shuffled deck of words for customer orders (guarantees maximum variety)
  const wordDeckRef = useRef<VocabItem[]>([]);
  // Leaderboard state for result screen
  const [leaderboard, setLeaderboard] = useState<{ rank: number; top: HallOfFameEntry[] } | null>(null);
  // Build category → color map from all course themes
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const meta of Object.values(courseThemes)) {
      for (const theme of meta.themes) {
        map[theme.id] = theme.color;
      }
    }
    return map;
  }, [courseThemes]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Tell App when game is active (hide mode tabs) + lock body scroll during gameplay
  useEffect(() => {
    const isActive = gameStarted && !ended && !showStartScreen && countdown === 0;
    if (onGameActiveChange) onGameActiveChange(isActive);
    const html = document.documentElement;
    const body = document.body;
    if (isActive) {
      html.classList.add('scroll-locked');
      body.classList.add('scroll-locked');
    } else {
      html.classList.remove('scroll-locked');
      body.classList.remove('scroll-locked');
    }
    return () => {
      html.classList.remove('scroll-locked');
      body.classList.remove('scroll-locked');
    };
  }, [gameStarted, ended, showStartScreen, countdown, onGameActiveChange]);

  const belt = useMemo(() => [...beltItems], [beltItems]);

  // On mobile, split belt into two rows (serpentine: top scrolls left, bottom scrolls right)
  const beltRows = useMemo(() => {
    if (!isMobile || belt.length === 0) return [belt];
    const half = Math.ceil(belt.length / 2);
    return [belt.slice(0, half), belt.slice(half)];
  }, [belt, isMobile]);
  const selectedWord = words.find((word) => word.id === selectedWordId) || null;
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  // Ref to track whether the current game session has been saved to Hall of Fame
  const sessionSavedRef = useRef(false);
  // Custom pointer-based drag (no HTML5 drag API)
  const dragStateRef = useRef<{
    wordId: string;
    startX: number;
    startY: number;
    active: boolean;
  } | null>(null);
  const dragGhostRef = useRef<HTMLDivElement | null>(null);

  // 🎊 Spawn confetti
  const spawnConfetti = useCallback((centerX: number, centerY: number) => {
    const colors = ['#e63946', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8fa3', '#c084fc', '#fb923c'];
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5;
      particles.push({
        id: rid(),
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }
    setConfetti(prev => [...prev, ...particles]);
  }, []);

  // 💰 Spawn coins
  const spawnCoins = useCallback((x: number, y: number, amount: number) => {
    const newCoins: CoinAnim[] = [];
    for (let i = 0; i < Math.min(amount, 5); i++) {
      newCoins.push({
        id: rid(),
        x: x + (Math.random() - 0.5) * 60,
        y: y - 20 - Math.random() * 40,
        value: amount,
      });
    }
    setCoins(prev => [...prev, ...newCoins]);
  }, []);

  // 🎵 Play success sound using Web Audio API
  const playSuccessSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio not available
    }
  }, []);

  // 🎵 Play coin sound
  const playCoinSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1318.5, audioCtx.currentTime); // E6
      oscillator.frequency.setValueAtTime(1568, audioCtx.currentTime + 0.08); // G6
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio not available
    }
  }, []);

  // 🎵 Play click sound (plate selection)
  const playClickSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (_) {}
  }, []);

  // 🎵 Play countdown beep (square wave, matching game style)
  const playCountdownBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (_) {}
  }, []);

  // 🎵 Play go sound (countdown finished — celebratory ascending chime)
  const playGoSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (_) {}
  }, []);

  // 🎵 Play round complete sound (triumphant fanfare)
  const playRoundCompleteSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Bright triumphant arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.35);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.35);
      });
    } catch (_) {}
  }, []);

  // 🎵 Play wrong sound
  const playWrongSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio not available
    }
  }, []);

  // ✅ Real-time clock using Date.now() delta
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0) return;
    
    lastTickRef.current = Date.now();
    accumulatedTimeRef.current = 0;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      accumulatedTimeRef.current += delta;
      
      // Dispatch TICK for each full second accumulated
      while (accumulatedTimeRef.current >= 1000) {
        accumulatedTimeRef.current -= 1000;
        dispatch({ type: 'TICK' });
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [dispatch, gameStarted, ended, showStartScreen, countdown]);

  // 🎵 Play round complete sound when game ends
  useEffect(() => {
    if (ended) {
      playRoundCompleteSound();
    }
  }, [ended]);

  // ✅ Save result to Hall of Fame when the game ends
  useEffect(() => {
    if (state.secondsLeft <= 0 && !ended && !sessionSavedRef.current) {
      sessionSavedRef.current = true;
      const profile = getActiveProfile();
      if (!profile) return;
      const now = Date.now();
      saveSessionResult({
        profileId: profile.id,
        gameId: 'sushi',
        nickname: profile.nickname,
        avatar: profile.avatar,
        bestStars: state.stars,
        bestScore: state.score,
        bestStage: state.stage,
        updatedAt: now,
      });
      // Load leaderboard for result screen — split by game
      const sushiEntries = getGameLeaderboard('sushi');
      const sushiIdx = sushiEntries.findIndex(e => e.updatedAt === now);
      setLeaderboard({
        rank: sushiIdx >= 0 ? sushiIdx + 1 : sushiEntries.length,
        top: sushiEntries.slice(0, 5),
      });
      setEnded(true);
    }
  }, [state.secondsLeft, ended, state.score, state.stars, state.stage]);

  // Handle animation end for a customer:
  //   entering -> seated
  //   exiting/exiting-wrong -> remove from DOM
  const handleAnimEnd = useCallback((customerId: string) => {
    setCustomers(prev => {
      const customer = prev.find(c => c.id === customerId);
      if (!customer) return prev;
      if (customer.animPhase === 'entering') {
        return prev.map(c => c.id === customerId ? { ...c, animPhase: 'seated' } : c);
      }
      if (customer.animPhase === 'exiting' || customer.animPhase === 'exiting-wrong') {
        return prev.filter(c => c.id !== customerId);
      }
      return prev;
    });
  }, []);

  // ⏰ Safari onAnimationEnd fallback — transition entering→seated after 1s
  // Safari sometimes fails to fire animationend on dynamically added elements,
  // leaving the customer permanently stuck in 'entering' phase and unclickable.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const customer of customers) {
      if (customer.animPhase === 'entering') {
        const timer = setTimeout(() => {
          setCustomers(prev => prev.map(c =>
            c.id === customer.id && c.animPhase === 'entering'
              ? { ...c, animPhase: 'seated' }
              : c
          ));
        }, 1000); // 850ms walkIn + 150ms buffer
        timers.push(timer);
      }
    }
    return () => { for (const t of timers) clearTimeout(t); };
  }, [customers]);

  // ✅ First customer spawns after exactly 3 seconds
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0 || firstSpawned) return;
    
    const firstSpawnTimer = setTimeout(() => {
      setFirstSpawned(true);
      setSpawnTick(SPAWN_SECONDS);
      // Draw from deck and find free slot
      const card = wordDeckRef.current.shift();
      if (card) {
        setCustomers(prev => {
          const usedSlots = new Set(prev.map(c => c.slotIndex));
          const freeSlot = [0, 1, 2].find(i => !usedSlots.has(i));
          if (freeSlot === undefined || prev.length >= MAX_CUSTOMERS) return prev;
          return [...prev, { id: rid(), target: card, attempts: 0, animPhase: 'entering', slotIndex: freeSlot }];
        });
      }
    }, FIRST_SPAWN_DELAY);
    
    return () => clearTimeout(firstSpawnTimer);
  }, [gameStarted, ended, showStartScreen, countdown, firstSpawned, beltItems]);


  // ✅ Customer spawn timer - stage-based interval
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0 || !firstSpawned) return;
    
    const currentInterval = getSpawnInterval(state.stage);
    
    const timer = setInterval(() => {
      setSpawnTick(prev => {
        if (prev <= 1) {
          // Time to spawn new customer — draw from shuffled deck
          const card = wordDeckRef.current.shift();
          if (card) {
            setCustomers(c => {
              const usedSlots = new Set(c.map(cust => cust.slotIndex));
              const freeSlot = [0, 1, 2].find(i => !usedSlots.has(i));
              if (freeSlot === undefined || c.length >= MAX_CUSTOMERS) return c;
              return [...c, { id: rid(), target: card, attempts: 0, animPhase: 'entering', slotIndex: freeSlot }];
            });
          }
          return currentInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, ended, showStartScreen, countdown, firstSpawned, state.stage]);

  // Populate belt items when activeWords changes (theme filter, course selection, or game start)
  useEffect(() => {
    if (activeWords.length === 0) return;
    if (showStartScreen || countdown === 0) {
      const profile = getActiveProfile();
      let learnedWordIds: Set<string> = new Set();
      if (profile) {
        try {
          const masteryKey = 'xhz_mastery_' + profile.id;
          const masteryData = JSON.parse(localStorage.getItem(masteryKey) || '{"words":{}}');
          learnedWordIds = new Set(
            Object.entries(masteryData.words)
              .filter(([, m]: any) => m.status === 'mastered' || m.status === 'practiced')
              .map(([id]) => id)
          );
        } catch (e) {
          // Ignore errors reading mastery
        }
      }
      
      const learned = activeWords.filter(w => learnedWordIds.has(w.id));
      const unlearned = activeWords.filter(w => !learnedWordIds.has(w.id));
      const shuffledLearned = [...learned].sort(() => Math.random() - 0.5);
      const shuffledUnlearned = [...unlearned].sort(() => Math.random() - 0.5);
      const combined = [...shuffledLearned, ...shuffledUnlearned];
      
      // Pad to BELT_ITEMS_COUNT if the deck is small — iOS Safari hit-testing on
      // CSS-animated composited layers is unreliable when items are sparse. With
      // fewer items the gap between plates is larger, so any hit-testing offset
      // error is more likely to land on the wrong plate. Padding to >= 20 items
      // keeps plates densely packed so the error stays within the target plate.
      let selected = combined.slice(0, BELT_ITEMS_COUNT);
      while (selected.length < BELT_ITEMS_COUNT) {
        // Fill remaining slots with random picks from the available words
        const filler = combined[Math.floor(Math.random() * combined.length)];
        selected = [...selected, filler];
      }
      setBeltItems(selected);
      wordDeckRef.current = buildShuffledDeck(selected, MAX_WORD_APPEARANCES);
    }
  }, [activeWords]);

  // 🏃 Belt auto-scroll via CSS @keyframes + transform (GPU-composited, no layout thrash)
  // Belt track animation is handled entirely by CSS `transform: translateX()` with
  // @keyframes beltScrollLeft / beltScrollRight. Items are duplicated in the track
  // so the seamless loop works (at 50%, the visual is identical to the start).
  // This avoids the lag from the previous JS-driven `position: relative + left` approach
  // which triggered layout recalculations every frame.

  // 🎊 Confetti animation loop
  useEffect(() => {
    if (confetti.length === 0) return;
    
    const animate = () => {
      setConfetti(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            rotation: p.rotation + p.rotationSpeed,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
        return updated;
      });
      confettiRef.current = requestAnimationFrame(animate);
    };
    
    confettiRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(confettiRef.current);
  }, [confetti.length > 0]);

  // 💰 Coin animation cleanup
  useEffect(() => {
    if (coins.length === 0) return;
    const timer = setTimeout(() => {
      setCoins([]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [coins]);

  // ✅ Correct effect cleanup
  useEffect(() => {
    if (!showCorrectEffect) return;
    const timer = setTimeout(() => {
      setShowCorrectEffect(false);
      setCorrectCustomerId(null);
    }, 800);
    return () => clearTimeout(timer);
  }, [showCorrectEffect]);

  // ✅ Shake effect cleanup
  useEffect(() => {
    if (!shakeEffect) return;
    const timer = setTimeout(() => setShakeEffect(false), 500);
    return () => clearTimeout(timer);
  }, [shakeEffect]);

  // ✅ Score popup cleanup
  useEffect(() => {
    if (!scorePopup) return;
    const timer = setTimeout(() => setScorePopup(null), 1000);
    return () => clearTimeout(timer);
  }, [scorePopup]);

  function resolveAttempt(customerId: string, wordOverride?: VocabItem) {
    const word = wordOverride || selectedWord;
    if (!word || state.secondsLeft <= 0 || showStartScreen || countdown > 0) return;
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    // Prevent double-processing if both onDrop and onPointerUp fire for the same gesture
    if (customer.animPhase === 'exiting' || customer.animPhase === 'exiting-wrong') return;
    
    const attempts = customer.attempts + 1;
    const correct = word.id === customer.target.id;

    if (correct) {
      dispatch({ type: 'CORRECT', attempts });
      speakChinese(customer.target.hanzi);
      const stars = attempts === 1 ? 3 : 1;
      addStudyStars(stars, [customer.target.id]);
      setResolvedCount((count) => count + 1);
      
      // 🎊 Show success effects
      playSuccessSound();
      playCoinSound();
      
      // Get position for effects
      const customerEl = document.getElementById(`customer-${customerId}`);
      if (customerEl) {
        const rect = customerEl.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        spawnCoins(rect.left + rect.width / 2, rect.top, 10);
        setScorePopup({ value: state.score, x: rect.left + rect.width / 2, y: rect.top });
      }
      
      setShowCorrectEffect(true);
      setCorrectCustomerId(customerId);
      
      // Clear selected plate after successful delivery
      setSelectedWordId(null);
      
      // Start exit animation for correct answer (removed via onAnimationEnd)
      setCustomers((prev) => prev.map(c => 
        c.id === customerId ? { ...c, animPhase: 'exiting' } : c
      ));
      
      return;
    }

    dispatch({ type: 'WRONG' });
    playWrongSound();
    setShakeEffect(true);
    
    if (attempts >= 3) {
      setResolvedCount((count) => count + 1);
      // Start exit animation for wrong answer (sad slouch) — removed via onAnimationEnd
      setCustomers((prev) => prev.map(c => 
        c.id === customerId ? { ...c, animPhase: 'exiting-wrong' } : c
      ));
      return;
    }
    
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, attempts } : c))
    );
  }

  // Handle start button click
  const handleStartClick = () => {
    if (!selectedCourse) return;
    setShowStartScreen(false);
    playCountdownBeep();
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          playGoSound();
          dispatch({ type: 'RESET', seconds: ROUND_SECONDS });
          setGameStarted(true);
          return 0;
        }
        playCountdownBeep();
        return prev - 1;
      });
    }, 1000);
  };

  // Reset game
  const handlePlayAgain = () => {
    dispatch({ type: 'RESET', seconds: ROUND_SECONDS });
    setCustomers([]);
    setSpawnTick(SPAWN_SECONDS);
    setResolvedCount(0);
    setEnded(false);
    setSelectedWordId(null);
    setGameStarted(false);
    setFirstSpawned(false);
    setConfetti([]);
    setCoins([]);
    setShowCorrectEffect(false);
    setCorrectCustomerId(null);
    setShakeEffect(false);
    setScorePopup(null);
    setShowStartScreen(true);
    setCountdown(3);
    setLeaderboard(null);
    setSelectedCourse(null);
    setSelectedThemes([]);
    sessionSavedRef.current = false;
  };

  // 🖱️ Custom pointer-based drag (no HTML5 drag API — avoids browser freeze on animated elements)
  const createDragGhost = useCallback((wordId: string, x: number, y: number) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML =
      '<span class="ghost-emoji">' + getSushiEmoji(wordId) + '</span>' +
      '<span class="ghost-hanzi">' + word.hanzi + '</span>';
    ghost.style.cssText = 'left:' + (x - 48) + 'px;top:' + (y - 48) + 'px;';
    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
  }, [words, getSushiEmoji]);

  const removeDragGhost = useCallback(() => {
    if (dragGhostRef.current) {
      dragGhostRef.current.remove();
      dragGhostRef.current = null;
    }
  }, []);

  // Get the animation class for a customer based on their phase
  const getAnimClass = (customer: CustomerWithAnim): string => {
    switch (customer.animPhase) {
      case 'entering': return 'entering';
      case 'exiting': return 'exiting';
      case 'exiting-wrong': return 'exiting-wrong';
      default: return '';
    }
  };

  return (
    <div className={`sushi-mode ${shakeEffect ? 'shake' : ''}`} ref={gameAreaRef}
      onPointerMove={(e) => {
        const drag = dragStateRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (!drag.active && Math.hypot(dx, dy) > 5) {
          drag.active = true;
          setSelectedWordId(drag.wordId);
          createDragGhost(drag.wordId, e.clientX, e.clientY);
        }
        if (drag.active && dragGhostRef.current) {
          dragGhostRef.current.style.left = (e.clientX - 48) + 'px';
          dragGhostRef.current.style.top = (e.clientY - 48) + 'px';
        }
      }}
      onPointerUp={() => {
        if (dragStateRef.current?.active) {
          removeDragGhost();
        }
      }}
    >
      {/* 🎊 Confetti overlay */}
      {confetti.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            width: p.size,
            height: p.size * 0.6,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.life,
          }}
        />
      ))}

      {/* 💰 Coin animations */}
      {coins.map(c => (
        <div key={c.id} className="coin-anim">
          <span>🪙</span>
          <span className="coin-value">+{c.value}</span>
        </div>
      ))}

      {/* ✅ Score popup */}
      {scorePopup && (
        <div
          className="score-popup"
          style={{ left: scorePopup.x, top: scorePopup.y }}
        >
          ⭐ {scorePopup.value}
        </div>
      )}

      {/* Start Screen Overlay */}
      {showStartScreen && (
        <div className="overlay">
          <button
            className="back-button"
            onClick={() => {
              const root = document.getElementById('dojo-game-root');
              if (root) root.classList.remove('visible');
              window.location.href = 'dojo.html';
            }}
          >
            ← Back to Dojo
          </button>
          <div className="start-screen matching-start">
            <div className="start-sushi-icon">🍣</div>
            <h2>Sushi Match</h2>
            <p>Drag the correct sushi plate to the waiting customer!</p>

            {/* Course selection */}
            <div className="selection-section">
              <div className="section-label">Select Course</div>
              <div className="course-list">
                {Array.from(new Set(words.map(w => w.course))).map(courseId => {
                  const meta = courseThemes[courseId];
                  const active = selectedCourse === courseId;
                  return (
                    <button
                      key={courseId}
                      className={`course-btn${active ? ' active' : ''}`}
                      onClick={() => {
                        setSelectedCourse(courseId);
                        setSelectedThemes([]);
                      }}
                    >
                      <span>{meta?.name || courseId}</span>
                      <span className="course-count">
                        {words.filter(w => w.course === courseId).length} words
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme selection (multi-select) */}
            {selectedCourse && themesForCourse.length > 0 && (
              <div className="selection-section">
                <div className="section-label">Pick Themes</div>
                <div className="theme-list">
                  <button
                    className={`theme-chip${selectedThemes.length === 0 ? ' active' : ''}`}
                    onClick={() => setSelectedThemes([])}
                  >
                    🌐 All
                  </button>
                  {themesForCourse.map(theme => {
                    const selected = selectedThemes.includes(theme.id);
                    return (
                      <button
                        key={theme.id}
                        className={`theme-chip${selected ? ' active' : ''}`}
                        onClick={() => {
                          setSelectedThemes(prev =>
                            prev.includes(theme.id)
                              ? prev.filter(t => t !== theme.id)
                              : [...prev, theme.id]
                          );
                        }}
                      >
                        {theme.emoji} {theme.name}
                      </button>
                    );
                  })}
                </div>
                <div className="theme-count">
                  {selectedThemes.length === 0
                    ? `All themes — ${activeWords.length} words`
                    : `${selectedThemes.length} theme${selectedThemes.length > 1 ? 's' : ''} — ${activeWords.length} words`}
                </div>
              </div>
            )}

            <button
              className="start-button"
              onClick={handleStartClick}
              disabled={!selectedCourse}
            >
              Start Playing
            </button>
            {!selectedCourse && (
              <div className="hint-text">
                Select a course above to begin
              </div>
            )}
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {!showStartScreen && countdown > 0 && (
        <div className="overlay">
          <div className="countdown-screen">
            <div className="countdown-number">{countdown}</div>
            <p>Get ready!</p>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="hud">
        <div className="hud-item">
          <span className="hud-icon">⭐</span>
          <span className="hud-value">{state.stars}</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{state.score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon">🔥</span>
          <span className="hud-value">{state.combo}x</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon">🏆</span>
          <span className="hud-value">Stage {state.stage}</span>
        </div>
        <div className="hud-item">
          <span className="hud-icon">⏱️</span>
          <span className="hud-value">{state.secondsLeft}s</span>
        </div>
      </div>


      {/* 👤 CUSTOMER AREA — Doors above, customers below */}
      <div className="customer-area">
        {/* Door row — side by side */}
        <div className="door-row">
          <div className="door entrance">
            <div className="door-label">入口</div>
          </div>
          <div className="door exit">
            <div className="door-label">出口</div>
          </div>
        </div>

        {/* Customer Slots — below the doors */}
        <div className="customer-row">
          {Array.from({ length: MAX_CUSTOMERS }).map((_, index) => {
            const customer = customers.find(c => c.slotIndex === index);
            if (!customer) return (
              <div
                key={index}
                className="customer-slot empty"
                data-slot={index}
              >
                <div className="stool" />
              </div>
            );
            const isCorrectEffect = showCorrectEffect && correctCustomerId === customer.id;
            const animClass = getAnimClass(customer);
            return (
              <div
                key={customer.id}
                id={`customer-${customer.id}`}
                data-slot={customer.slotIndex}
                className={`customer-slot ${animClass} ${isCorrectEffect ? 'correct-flash' : ''}`}
                onPointerUp={() => {
                  if (dragStateRef.current?.active) {
                    const dw = words.find(w => w.id === dragStateRef.current!.wordId);
                    if (dw) resolveAttempt(customer.id, dw);
                  } else if (selectedWordId) {
                    resolveAttempt(customer.id);
                  }
                }}
                onAnimationEnd={() => handleAnimEnd(customer.id)}
              >

                {/* 🗨️ Comic speech balloon — Thai word only, no giving away the answer */}
                <div className="bubble">
                  <span className="bubble-thai">{customer.target.meaningTh}</span>
                </div>
                <div className={`avatar${isCorrectEffect ? ' correct-bounce' : ''}`}>{['🐱', '🐻', '🥷', '🐼', '🦊'][index % 5]}</div>
                <div className="stool" />
                {isCorrectEffect && <div className="correct-check">✓</div>}
              </div>
            );
          })}
        </div>

        {/* Noren curtain divider */}
        <div className="noren" />
      </div>

      {/* 📦 DROP ZONE - Middle (Selected Plate) */}
      <div className={`drop-zone ${selectedWord ? 'has-selection' : ''}`}>
        {selectedWord ? (
          <div className="selected-plate-wrapper">
            <div
              className="plate selected-plate"
              style={{ borderColor: categoryColorMap[selectedWord.category] || undefined }}
            >
              <span className="hanzi">{selectedWord.hanzi}</span>
              <span className="pinyin">{selectedWord.pinyin}</span>
            </div>
            <button
              className="cancel-selection"
              onClick={() => setSelectedWordId(null)}
              title="Cancel selection"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-zone-empty">
            <span className="drop-zone-icon">👇</span>
            <span>Tap a plate to pick it up, then tap or drag it to a customer</span>
          </div>
        )}
      </div>

      {/* 🍣 SUSHI CONVEYOR BELT - Bottom */}
      <div className="belt">
        <div className="belt-fade-left" />
        {beltRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`belt-track${isMobile ? (rowIndex === 0 ? ' top-row' : ' bottom-row') : ''}`}
          >
            {[...row, ...row].map((word, index) => (
              <div
                key={`${word.id}-${rowIndex}-${index}`}
                data-word-id={word.id}
                className={`plate ${selectedWordId === word.id ? 'active hidden' : ''}`}
                style={{ borderColor: categoryColorMap[word.category] || undefined }}
                onPointerDown={(e) => {
                  if (!showStartScreen && countdown === 0 && !ended) {
                    dragStateRef.current = {
                      wordId: word.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      active: false,
                    };
                    // Capture pointer so onPointerMove/onPointerUp fire even
                    // when the cursor leaves the game area (no ghost leak)
                    gameAreaRef.current?.setPointerCapture(e.pointerId);
                  }
                }}
                onClick={(e) => {
                  // If pointer moved enough to activate drag, skip the tap
                  if (dragStateRef.current?.active) {
                    dragStateRef.current = null;
                    return;
                  }
                  if (!showStartScreen && countdown === 0 && !ended) {
                    playClickSound();
                    // Use finger coordinates to find the closest plate via
                    // getBoundingClientRect, bypassing Safari's unreliable
                    // hit-testing on CSS-animated composited layers.
                    let closest: Element | null = null;
                    let minDist = Infinity;
                    const cx = e.clientX;
                    const cy = e.clientY;
                    document.querySelectorAll('.belt-track .plate:not(.hidden)').forEach(p => {
                      const r = p.getBoundingClientRect();
                      const pcx = r.left + r.width / 2;
                      const pcy = r.top + r.height / 2;
                      const d = Math.hypot(cx - pcx, cy - pcy);
                      if (d < minDist) { minDist = d; closest = p; }
                    });
                    if (closest) {
                      const id = (closest as Element).getAttribute('data-word-id');
                      if (id) setSelectedWordId(id);
                    }
                  }
                }}
              >
                <span className="plate-emoji">{getSushiEmoji(word.id)}</span>
                <span className="plate-flag">
                  <span className="flag-hanzi">{word.hanzi}</span>
                  <span className="flag-pinyin">{word.pinyin}</span>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Spawn timer */}
      {gameStarted && !ended && firstSpawned && (
        <div className="spawn-tip">
          Next customer in {spawnTick}s
        </div>
      )}

      {/* Result Screen */}
      {ended && (
        <div className="overlay">
          <div className="result-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="result-icon">🏆</div>
            <h2>Round Complete!</h2>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-icon">⭐</span>
                <span className="result-stat-label">Stars</span>
                <span className="result-stat-value">{state.stars}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">💰</span>
                <span className="result-stat-label">Score</span>
                <span className="result-stat-value">{state.score}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🍣</span>
                <span className="result-stat-label">Orders</span>
                <span className="result-stat-value">{resolvedCount}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🔥</span>
                <span className="result-stat-label">Best Combo</span>
                <span className="result-stat-value">{state.combo}x</span>
              </div>
            </div>

                  <div className="result-buttons">
              <button className="play-again-button" onClick={handlePlayAgain}>
                Play Again
              </button>
              <button className="exit-button" onClick={() => {
                // Hide the game container if on dojo page
                const root = document.getElementById('dojo-game-root');
                if (root) root.classList.remove('visible');
                // Navigate back to Dojo page
                window.location.href = 'dojo.html';
              }}>
                Exit
              </button>
            </div>

            {/* 🏆 Top scores for this game */}
            {leaderboard && leaderboard.top.length > 0 && (
              <div className="leaderboard-divider">
                <div className="leaderboard-title">🏆 Top Sushi Scores</div>
                <div className="leaderboard-list">
                  {leaderboard.top.map((entry, i) => {
                    const rank = i + 1;
                    const isYou = entry.profileId === getActiveProfile()?.id && entry.gameId === 'sushi';
                    let rankEmoji = '#' + rank;
                    if (rank === 1) rankEmoji = '🥇';
                    else if (rank === 2) rankEmoji = '🥈';
                    else if (rank === 3) rankEmoji = '🥉';
                    return (
                      <div key={entry.profileId + '-' + i} className={`leaderboard-item${isYou ? ' you' : ''}`}>
                        <span className="leaderboard-rank">{rankEmoji}</span>
                        <span className="leaderboard-avatar">{entry.avatar || '🐼'}</span>
                        <span className={`leaderboard-name${isYou ? ' you' : ''}`}>
                          {entry.nickname}{isYou ? ' (you)' : ''}
                        </span>
                        <span className="leaderboard-score">{entry.bestScore}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
