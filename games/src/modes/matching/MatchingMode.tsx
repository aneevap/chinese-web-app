import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useGameDispatch, useGameState } from '../../core/state/gameState';
import type { DisplayLanguage, VocabItem, HallOfFameEntry } from '../../core/types';
import { getActiveProfile, awardGameCoin } from '../../profile/profileBridge';
import type { CourseMeta } from '../../data/vocab';
import { saveSessionResult, getGameLeaderboard } from '../../core/systems/hallOfFame';
import { speakChinese } from '../../core/systems/audio';

const ROUND_SECONDS = 45;
const POINTS_PER_MATCH = 10;
const COMBO_BONUS = 5;

const rid = () => Math.random().toString(36).slice(2, 9);

function getGridConfig(stage: number): { cols: number; rows: number; pairCount: number } {
  const clamped = Math.min(stage, 5);
  const configs: { cols: number; rows: number }[] = [
    { cols: 3, rows: 3 },  // Stage 1: 9 tiles (4 pairs, 1 empty cell)
    { cols: 3, rows: 4 },  // Stage 2: 12 tiles (6 pairs)
    { cols: 3, rows: 4 },  // Stage 3: 12 tiles (6 pairs)
    { cols: 4, rows: 4 },  // Stage 4: 16 tiles (8 pairs)
    { cols: 4, rows: 5 },  // Stage 5: 20 tiles (10 pairs)
  ];
  const { cols, rows } = configs[clamped - 1];
  const totalCells = cols * rows;
  const pairCount = Math.floor(totalCells / 2);
  return { cols, rows, pairCount };
}

interface MatchTile {
  id: string;
  wordId: string;
  type: 'char' | 'meaning';
  content: string;
  status: 'default' | 'selected' | 'matched' | 'wrong';
}

type Props = {
  words: VocabItem[];
  courseThemes: Record<string, CourseMeta>;
  language: DisplayLanguage;
  onGameActiveChange?: (active: boolean) => void;
};

export function MatchingMode({ words, courseThemes, language, onGameActiveChange }: Props) {
  const state = useGameState();
  const dispatch = useGameDispatch();

  // UI state
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(getGridConfig(1).pairCount);
  const [scorePopup, setScorePopup] = useState<{ value: number; x: number; y: number } | null>(null);
  const [comboPopup, setComboPopup] = useState<{ combo: number; x: number; y: number } | null>(null);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [round, setRound] = useState(1);
  const [totalMatched, setTotalMatched] = useState(0);
  const [newSetFlash, setNewSetFlash] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [etymologyImage, setEtymologyImage] = useState<string | null>(null);
  const [timePopup, setTimePopup] = useState<{ text: string; key: number } | null>(null);
  const [matchStage, setMatchStage] = useState(1);
  const [victory, setVictory] = useState(false);
  const [stageTransition, setStageTransition] = useState<number | null>(null);
  const gridConfig = getGridConfig(matchStage);
  const matchStageRef = useRef(matchStage);
  matchStageRef.current = matchStage;

  // Course/theme selection
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<{ rank: number; top: HallOfFameEntry[] } | null>(null);

  const sessionSavedRef = useRef(false);
  const lastMatchTimeRef = useRef(Date.now());
  const usedWordIdsRef = useRef<Set<string>>(new Set());
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Filter words by course & themes
  const activeWords = useMemo(() => {
    if (!selectedCourse) return words;
    const byCourse = words.filter(w => w.course === selectedCourse);
    if (selectedThemes.length === 0) return byCourse;
    return byCourse.filter(w => selectedThemes.includes(w.category));
  }, [words, selectedCourse, selectedThemes]);

  const metaForCourse = selectedCourse ? courseThemes[selectedCourse] : null;
  const themesForCourse = metaForCourse?.themes || [];

  // Pick random words for the grid
  const pickGridWords = useCallback((pool: VocabItem[], count: number): VocabItem[] => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  // Build tiles from selected words
  const buildTiles = useCallback((wordPool: VocabItem[], pairCount: number) => {
    const picked = wordPool.length >= pairCount
      ? pickGridWords(wordPool, pairCount)
      : [...wordPool];
    // If not enough words, duplicate some
    while (picked.length < pairCount) {
      picked.push(wordPool[picked.length % wordPool.length]);
    }

    const newTiles: MatchTile[] = [];
    picked.forEach((word) => {
      newTiles.push({
        id: rid(),
        wordId: word.id,
        type: 'char',
        content: word.hanzi,
        status: 'default',
      });
      newTiles.push({
        id: rid(),
        wordId: word.id,
        type: 'meaning',
        content: language === 'th' ? word.meaningTh : word.meaningEn,
        status: 'default',
      });
    });

    // Shuffle
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    return newTiles;
  }, [language, pickGridWords]);

  // ✅ Real-time clock
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0) return;

    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, gameStarted, ended, showStartScreen, countdown]);

  // ✅ Build grid when game starts
  useEffect(() => {
    if (activeWords.length > 0 && !showStartScreen && countdown === 0 && gameStarted) {
      const cfg = getGridConfig(1);
      const built = buildTiles(activeWords, cfg.pairCount);
      // Track first round's words so they don't repeat in round 2
      built.forEach(tile => usedWordIdsRef.current.add(tile.wordId));
      setTiles(built);
      setTotalPairs(cfg.pairCount);
    }
  }, [activeWords, showStartScreen, countdown, gameStarted, buildTiles]);

  // Start a new round when all pairs matched
  const startNewRound = useCallback(() => {
    const used = usedWordIdsRef.current;
    const prevStage = matchStageRef.current;
    const newStage = prevStage + 1;
    const cfg = getGridConfig(newStage);
    let available = activeWords.filter(w => !used.has(w.id));
    if (available.length < cfg.pairCount) {
      used.clear();
      available = activeWords;
    }
    const built = buildTiles(available, cfg.pairCount);
    built.forEach(tile => used.add(tile.wordId));
    setTiles(built);
    setTotalPairs(cfg.pairCount);
    setMatchedPairs(0);
    setSelectedIds([]);
    setRound(prev => prev + 1);
    setMatchStage(newStage);
    setStageTransition(newStage);
    // ⏱️ Stage bonus: +5 seconds for reaching a new stage
    dispatch({ type: 'ADJUST_TIME', seconds: 5 });
    setTimePopup({ text: '+5s ⏱️', key: Date.now() });
    setNewSetFlash(true);
    setTimeout(() => setNewSetFlash(false), 800);
  }, [activeWords, buildTiles, dispatch]);

  // ✅ Start new round or victory when all pairs matched (before time runs out)
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0 || state.secondsLeft <= 0) return;
    if (matchedPairs > 0 && matchedPairs >= totalPairs) {
      if (matchStage >= 5) {
        // 🎉 Victory! All 5 stages completed
        const timer = setTimeout(() => {
          setVictory(true);
          // Save session on victory too
          if (!sessionSavedRef.current) {
            sessionSavedRef.current = true;
            const profile = getActiveProfile();
            if (profile) {
              const now = Date.now();
              if (state.score > 30) awardGameCoin('matching');
              saveSessionResult({
                profileId: profile.id,
                gameId: 'matching',
                nickname: profile.nickname,
                avatar: profile.avatar,
                bestScore: state.score,
                bestStage: 5,
                updatedAt: now,
              });
              const matchingEntries = getGameLeaderboard('matching');
              const matchingIdx = matchingEntries.findIndex(e => e.updatedAt === now);
              setLeaderboard({
                rank: matchingIdx >= 0 ? matchingIdx + 1 : matchingEntries.length,
                top: matchingEntries.slice(0, 5),
              });
            }
          }
        }, 600);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => startNewRound(), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [matchedPairs, totalPairs, matchStage, gameStarted, ended, showStartScreen, countdown, state.secondsLeft, startNewRound, state.score]);

  // ✅ Check for game end (only on time up)
  useEffect(() => {
    if (gameStarted && !ended && !sessionSavedRef.current) {
      if (state.secondsLeft <= 0) {
        sessionSavedRef.current = true;
        const profile = getActiveProfile();
        if (profile) {
          if (state.score > 30) awardGameCoin('matching');
          const now = Date.now();
          saveSessionResult({
            profileId: profile.id,
            gameId: 'matching',
            nickname: profile.nickname,
            avatar: profile.avatar,
            bestScore: state.score,
            bestStage: matchStageRef.current,
            updatedAt: now,
          });

          const matchingEntries = getGameLeaderboard('matching');
          const matchingIdx = matchingEntries.findIndex(e => e.updatedAt === now);
          setLeaderboard({
            rank: matchingIdx >= 0 ? matchingIdx + 1 : matchingEntries.length,
            top: matchingEntries.slice(0, 5),
          });
        }
        setEnded(true);
      }
    }
  }, [state.secondsLeft, gameStarted, ended, matchedPairs, totalPairs, state.score, state.stage]);

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

  // ✅ New set flash cleanup
  useEffect(() => {
    if (!newSetFlash) return;
    const timer = setTimeout(() => setNewSetFlash(false), 800);
    return () => clearTimeout(timer);
  }, [newSetFlash]);

  // ✅ Shake cleanup
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

  // ✅ Combo popup cleanup
  useEffect(() => {
    if (!comboPopup) return;
    const timer = setTimeout(() => setComboPopup(null), 1200);
    return () => clearTimeout(timer);
  }, [comboPopup]);

  // ✅ Etymology image popup cleanup
  useEffect(() => {
    if (!etymologyImage) return;
    const timer = setTimeout(() => setEtymologyImage(null), 1200);
    return () => clearTimeout(timer);
  }, [etymologyImage]);

  // ✅ Flash effect cleanup
  useEffect(() => {
    if (!flashEffect) return;
    const timer = setTimeout(() => setFlashEffect(false), 1000);
    return () => clearTimeout(timer);
  }, [flashEffect]);

  // ✅ Time popup cleanup
  useEffect(() => {
    if (!timePopup) return;
    const timer = setTimeout(() => setTimePopup(null), 1800);
    return () => clearTimeout(timer);
  }, [timePopup]);

  // ✅ Stage transition cleanup
  useEffect(() => {
    if (stageTransition === null) return;
    const timer = setTimeout(() => setStageTransition(null), 1200);
    return () => clearTimeout(timer);
  }, [stageTransition]);

  // 🎊 Confetti generation on victory
  useEffect(() => {
    if (!victory) return;
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9FF3'];
    const pieces: HTMLDivElement[] = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + '%';
      el.style.width = (Math.random() * 8 + 4) + 'px';
      el.style.height = (Math.random() * 8 + 4) + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
      el.style.animationDelay = (Math.random() * 2) + 's';
      container.appendChild(el);
      pieces.push(el);
    }

    // Cleanup confetti after animation
    const timer = setTimeout(() => {
      pieces.forEach(p => p.remove());
    }, 5000);

    return () => {
      clearTimeout(timer);
      pieces.forEach(p => p.remove());
    };
  }, [victory]);

  // 🎵 Play success sound
  const playSuccessSound = useCallback(() => {
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
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (_) {}
  }, []);

  // 🎵 Play wrong sound
  const playWrongSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (_) {}
  }, []);

  // 🎵 Play click sound (tile tap)
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

  // 🎵 Play countdown beep
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

  // 🎵 Play go sound (countdown finished)
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

  // ⚡ Play celebratory power-up chime (reward, not punishment!)
  const playLightningSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Bright ascending sparkle — two quick ascending notes
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, audioCtx.currentTime);
      osc.frequency.setValueAtTime(988, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1245, audioCtx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1568, audioCtx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);

      // Add a shimmering high overtone
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, audioCtx.currentTime);
      osc2.frequency.linearRampToValueAtTime(2640, audioCtx.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime);
      osc2.stop(audioCtx.currentTime + 0.3);
    } catch (_) {}
  }, []);

  // 🎵 Play lightning passing-by whoosh
  const playLightningWhoosh = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.6;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t / 0.6);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3000, audioCtx.currentTime);
      bandpass.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.5);
      bandpass.Q.value = 1.5;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(audioCtx.currentTime);
      noise.stop(audioCtx.currentTime + 0.6);
    } catch (_) {}
  }, []);

  // 🎵 Play combo sound
  const playComboSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, audioCtx.currentTime);
      osc.frequency.setValueAtTime(988, audioCtx.currentTime + 0.06);
      osc.frequency.setValueAtTime(1175, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (_) {}
  }, []);

  // Handle tile tap
  const handleTileClick = (tileId: string) => {
    if (ended || selectedIds.length >= 2 || showStartScreen || countdown > 0 || !gameStarted) return;

    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.status !== 'default') return;

    // Play click sound on tile selection
    playClickSound();

    // Prevent selecting two tiles of the same type
    if (selectedIds.length === 1) {
      const firstTile = tiles.find(t => t.id === selectedIds[0]);
      if (firstTile && firstTile.type === tile.type) {
        // Deselect first tile, select this one instead
        setTiles(prev => prev.map(t =>
          t.id === selectedIds[0] ? { ...t, status: 'default' as const } : t
        ));
        setSelectedIds([tileId]);
        setTiles(prev => prev.map(t =>
          t.id === tileId ? { ...t, status: 'selected' as const } : t
        ));
        return;
      }
    }

    // Select the tile
    const newSelected = [...selectedIds, tileId];
    setSelectedIds(newSelected);
    setTiles(prev => prev.map(t =>
      t.id === tileId ? { ...t, status: 'selected' as const } : t
    ));

    // If two selected, check for match
    if (newSelected.length === 2) {
      const first = tiles.find(t => t.id === newSelected[0]);
      const second = tile;
      if (!first || !second) return;

      const isMatch = first.wordId === second.wordId && first.type !== second.type;

      if (isMatch) {
        // ✅ MATCH!
        const now = Date.now();
        const timeSinceLast = now - lastMatchTimeRef.current;
        lastMatchTimeRef.current = now;
        const isCombo = timeSinceLast < 3000; // combo if < 3s since last match

        setTimeout(() => {
          setTiles(prev => prev.map(t =>
            newSelected.includes(t.id) ? { ...t, status: 'matched' as const } : t
          ));
          setSelectedIds([]);
          setMatchedPairs(prev => prev + 1);
          setTotalMatched(prev => prev + 1);

          // Score
          const comboValue = isCombo ? state.combo + 1 : 0;
          dispatch({ type: 'CORRECT', attempts: 1, gameId: 'matching' });
          playSuccessSound();
          if (isCombo && comboValue >= 2) {
            playComboSound();
          }

          // 🗣️ Speak the matched character's Chinese pronunciation
          speakChinese(first.type === 'char' ? first.content : second.content);

          // 🖼️ Show character illustration from assets/characters/
          setEtymologyImage('assets/characters/' + first.wordId + '.png');

          // ⚡ Lightning reward every 5 combos (5, 10, 15…) + time bonus
          if (isCombo && comboValue >= 5 && comboValue % 5 === 0) {
            setFlashEffect(true);
            playLightningSound();
            playLightningWhoosh();
            // ⏱️ Combo bonus: +3 seconds for every 5 consecutive correct matches
            dispatch({ type: 'ADJUST_TIME', seconds: 3 });
            setTimePopup({ text: '+3s ⏱️', key: Date.now() });
          }

          // Popup effects
          const el = document.getElementById(`tile-${tileId}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            setScorePopup({
              value: POINTS_PER_MATCH + (isCombo ? Math.min(comboValue, 5) * COMBO_BONUS : 0),
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });
            if (isCombo && comboValue >= 2) {
              setComboPopup({
                combo: comboValue,
                x: rect.left + rect.width / 2,
                y: rect.top - 50,
              });
            }
          }
        }, 300);
      } else {
        // ❌ WRONG
        dispatch({ type: 'WRONG' });
        // ⏱️ Wrong penalty: -1 second
        dispatch({ type: 'ADJUST_TIME', seconds: -1 });
        setTimePopup({ text: '-1s ⏱️', key: Date.now() });
        playWrongSound();
        setShakeEffect(true);

        setTimeout(() => {
          setTiles(prev => prev.map(t =>
            newSelected.includes(t.id) ? { ...t, status: 'wrong' as const } : t
          ));
        }, 100);

        setTimeout(() => {
          setTiles(prev => prev.map(t =>
            newSelected.includes(t.id) ? { ...t, status: 'default' as const } : t
          ));
          setSelectedIds([]);
        }, 700);
      }
    }
  };

  // Handle start
  const handleStartClick = () => {
    if (!selectedCourse) return;
    setShowStartScreen(false);
    // Play first countdown beep immediately
    playCountdownBeep();
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          playGoSound();
          dispatch({ type: 'RESET', seconds: ROUND_SECONDS });
          setGameStarted(true);
          return 0;
        }
        // Play beep for next number
        playCountdownBeep();
        return prev - 1;
      });
    }, 1000);
  };

  // Handle play again
  const handlePlayAgain = () => {
    dispatch({ type: 'RESET', seconds: ROUND_SECONDS });
    setTiles([]);
    setSelectedIds([]);
    setMatchedPairs(0);
    setEnded(false);
    setGameStarted(false);
    setScorePopup(null);
    setComboPopup(null);
    setShakeEffect(false);
    setRound(1);
    setTotalMatched(0);
    setMatchStage(1);
    setNewSetFlash(false);
    setFlashEffect(false);
    setEtymologyImage(null);
    setTimePopup(null);
    setVictory(false);
    setStageTransition(null);
    setShowStartScreen(true);
    setCountdown(3);
    setLeaderboard(null);
    setSelectedCourse(null);
    setSelectedThemes([]);
    sessionSavedRef.current = false;
    lastMatchTimeRef.current = Date.now();
    usedWordIdsRef.current = new Set();
  };

  return (
    <div className={`matching-mode ${shakeEffect ? 'shake' : ''}`} ref={gameAreaRef}>
      {/* Start Screen */}
      {showStartScreen && (
        <div className="overlay">
          <button
            className="back-button"
            onClick={() => window.closeGame?.()}
          >
            ← Back to Arena
          </button>
          <div className="start-screen matching-start">
            <div className="flash-match-header">
              <h2 className="flash-match-title">Flash Match</h2>
              <div className="flash-match-thunder-img">⚡</div>
            </div>

            {/* Course selection */}
            <div className="selection-section">
              <div className="section-label">Select Course</div>
              <div className="course-list">
                {Array.from(new Set(words.map(w => w.course))).map(courseId => {
                  const meta = courseThemes[courseId];
                  return (
                    <button
                      key={courseId}
                      className={`course-btn${selectedCourse === courseId ? ' active' : ''}`}
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

            {/* Theme selection */}
            {selectedCourse && themesForCourse.length > 0 && (
              <div className="selection-section" style={{ marginTop: 6, marginBottom: 10 }}>
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
                    ? 'All themes \u2014 ' + activeWords.length + ' words'
                    : selectedThemes.length + ' theme' + (selectedThemes.length > 1 ? 's' : '') + ' \u2014 ' + activeWords.length + ' words'}
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

      {/* Countdown */}
      {!showStartScreen && countdown > 0 && (
        <div className="overlay">
          <div className="countdown-screen">
            <div className="countdown-number">{countdown}</div>
            <p>Get ready!</p>
          </div>
        </div>
      )}

      {/* Gameplay header — "Flash Match ⚡" above HUD */}
      <div className="matching-game-header">
        <span className="matching-game-title">Flash Match</span>
        <span className="matching-game-thunder">⚡</span>
      </div>

      {/* HUD — Score left, STAGE center, Timer right */}
      <div className="matching-hud-simple">
        <div className="matching-hud-item">
          <span className="matching-hud-icon">💰</span>
          <span className="matching-hud-value">{state.score}</span>
        </div>
        <div className="matching-hud-item matching-hud-item-center">
          <span className="matching-hud-value">STAGE {matchStage}</span>
        </div>
        <div className="matching-hud-item">
          <span className="matching-hud-icon">⏱️</span>
          <span className="matching-hud-value">{state.secondsLeft}s</span>
          {/* Time popup moved to center of screen */}
        </div>
      </div>

      {/* Grid */}
      <div className="matching-grid" style={{ gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)` }}>
        {tiles.map(tile => {
          const isChar = tile.type === 'char';
          return (
            <button
              key={tile.id}
              id={`tile-${tile.id}`}
              className={
                `matching-tile ${isChar ? 'tile-char' : 'tile-meaning'} ` +
                (tile.status === 'selected' ? 'tile-selected' : '') +
                (tile.status === 'matched' ? 'tile-matched' : '') +
                (tile.status === 'wrong' ? 'tile-wrong' : '')
              }
              onClick={() => handleTileClick(tile.id)}
              disabled={tile.status === 'matched' || ended}
              style={{
                visibility: tile.status === 'matched' ? 'hidden' : 'visible',
                pointerEvents: tile.status === 'matched' ? 'none' : 'auto',
              }}
            >
              <span className={isChar ? 'tile-content-char' : 'tile-content-meaning'}>
                {isChar ? tile.content : tile.content}
              </span>
            </button>
          );
        })}
        {/* Placeholder tiles to fill empty cells for a symmetrical layout */}
        {gameStarted && !ended && Array.from({ length: gridConfig.cols * gridConfig.rows - tiles.length }).map((_, i) => (
          <div key={'ph-' + i} className="matching-tile-placeholder">
            <span className="placeholder-emoji">🐼</span>
          </div>
        ))}
      </div>

      {/* ⏱️ Time popup — centered on screen, big animation */}
      {timePopup && (
        <div className="time-popup-center" key={timePopup.key}>
          <span className={`time-popup-text${timePopup.text.startsWith('-') ? ' time-popup--negative' : ''}`}>{timePopup.text}</span>
        </div>
      )}

      {/* 🏁 Stage transition — appears on advancing to next stage */}
      {stageTransition !== null && (
        <div className="stage-transition-overlay" key={stageTransition}>
          <div className="stage-transition-card">
            <div className="stage-transition-thunder">⚡</div>
            <div className="stage-transition-label">STAGE</div>
            <div className="stage-transition-number">{stageTransition}</div>
          </div>
        </div>
      )}

      {/* New Set flash */}
      {newSetFlash && (
        <div className="new-set-overlay">
          <div className="new-set-text">
            <span className="new-set-icon">🔄</span>
            New Set!
          </div>
        </div>
      )}

      {/* Score popup */}
      {scorePopup && (
        <div
          className="score-popup"
          style={{ left: scorePopup.x, top: scorePopup.y }}
        >
          +{scorePopup.value} 💰
        </div>
      )}

      {/* Combo popup */}
      {comboPopup && (
        <div
          className="combo-popup"
          style={{ left: comboPopup.x, top: comboPopup.y }}
        >
          🔥 {comboPopup.combo}x Combo!
        </div>
      )}

      {/* 🖼️ Etymology image popup — shows ancient script image on correct match */}
      {etymologyImage && (
        <div className="etymology-image-popup">
          <img src={etymologyImage} alt="" className="etymology-image-inner" aria-hidden="true" onError={() => setEtymologyImage(null)} />
        </div>
      )}

      {/* 🌩️ Lightning sweep — celebratory bolt passing through! */}
      {flashEffect && (
        <div className="lightning-overlay">
          <div className="lightning-glow"></div>
          <div className="lightning-sparkles"></div>
          <div className="lightning-bolt">⚡</div>
          <div className="lightning-text">⚡ FLASH COMBO! ⚡</div>
        </div>
      )}

      {/* 🚀 Mascot decoration — left bottom corner */}
      <img
        src="assets/mascot/pandarocket.png"
        className="mascot-panda"
        alt=""
        aria-hidden="true"
      />

      {/* 🎉 Victory Screen — All 5 stages cleared! */}
      {victory && (
        <div className="victory-overlay">
          {/* 🎊 Confetti particles */}
          <div className="confetti-container" id="confetti-container"></div>
          <div className="victory-card">
            {/* 🐼 Flash panda appears on victory! */}
            <img
              src="assets/mascot/panda_flash.png"
              className="victory-panda"
              alt=""
              aria-hidden="true"
            />
            <div className="victory-thunder-big">⚡</div>
            <h2 className="victory-title">You are the flash!</h2>
            <div className="victory-subtitle">All stages cleared!</div>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-icon">💰</span>
                <span className="result-stat-label">Score</span>
                <span className="result-stat-value">{state.score}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🎯</span>
                <span className="result-stat-label">Total Matched</span>
                <span className="result-stat-value">{totalMatched}</span>
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
              <button
                className="exit-button"
            onClick={() => window.closeGame?.()}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Screen */}
      {ended && !victory && (
        <div className="overlay">
          <div className="result-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="result-icon">⏰</div>
            <h2>Time's Up!</h2>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-icon">💰</span>
                <span className="result-stat-label">Score</span>
                <span className="result-stat-value">{state.score}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🎯</span>
                <span className="result-stat-label">Total Matched</span>
                <span className="result-stat-value">{totalMatched}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🔄</span>
                <span className="result-stat-label">Rounds</span>
                <span className="result-stat-value">{round - 1}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🔥</span>
                <span className="result-stat-label">Best Combo</span>
                <span className="result-stat-value">{state.combo}x</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-icon">🏁</span>
                <span className="result-stat-label">Stage</span>
                <span className="result-stat-value">{matchStage}</span>
              </div>
            </div>

            <div className="result-buttons">
              <button className="play-again-button" onClick={handlePlayAgain}>
                Play Again
              </button>
              <button
                className="exit-button"
            onClick={() => window.closeGame?.()}
              >
                Exit
              </button>
            </div>

            {/* 🏆 Top scores for this game */}
            {leaderboard && leaderboard.top.length > 0 && (
              <div className="leaderboard-divider">
                <div className="leaderboard-title">🏆 Top Matching Scores</div>
                <div className="leaderboard-list">
                  {leaderboard.top.map((entry, i) => {
                    const rank = i + 1;
                    const isYou = entry.profileId === getActiveProfile()?.id && entry.gameId === 'matching';
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
