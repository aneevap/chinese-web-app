import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useGameDispatch, useGameState } from '../../core/state/gameState';
import type { CustomerOrder, DisplayLanguage, VocabItem } from '../../core/types';
import { speakChinese } from '../../core/systems/audio';
import { addStudyStars, getActiveProfile } from '../../profile/profileBridge';
import { saveSessionResult } from '../../core/systems/hallOfFame';
import { getSpawnInterval } from '../../core/systems/scoring';

const MAX_CUSTOMERS = 3;
const SPAWN_SECONDS = 6;
const ROUND_SECONDS = 75;
const BELT_ITEMS_COUNT = 12;
const FIRST_SPAWN_DELAY = 3000; // 3 seconds for first customer
const MAX_WORD_APPEARANCES = 2; // Max times a word can appear per session

const rid = () => Math.random().toString(36).slice(2, 9);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Props = {
  words: VocabItem[];
  language: DisplayLanguage;
};

// Customer animation phase
type CustomerAnimPhase = 'entering' | 'seated' | 'exiting' | 'exiting-wrong';

interface CustomerWithAnim extends CustomerOrder {
  animPhase: CustomerAnimPhase;
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

export function SushiMode({ words, language }: Props) {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [customers, setCustomers] = useState<CustomerWithAnim[]>([]);
  const [spawnTick, setSpawnTick] = useState(SPAWN_SECONDS);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [ended, setEnded] = useState(false);
  const [beltItems, setBeltItems] = useState<VocabItem[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [coins, setCoins] = useState<CoinAnim[]>([]);
  const [dragOverCustomer, setDragOverCustomer] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [firstSpawned, setFirstSpawned] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [correctCustomerId, setCorrectCustomerId] = useState<string | null>(null);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [scorePopup, setScorePopup] = useState<{ value: number; x: number; y: number } | null>(null);
  // Word frequency tracking: map wordId -> count of appearances this session
  const [wordUsageCount, setWordUsageCount] = useState<Map<string, number>>(new Map());

  const belt = useMemo(() => [...beltItems], [beltItems]);
  const selectedWord = words.find((word) => word.id === selectedWordId) || null;
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);

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

  // ✅ FIXED: Real-time clock using Date.now() delta
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
    }, 100); // Check every 100ms for accuracy
    
    return () => clearInterval(timer);
  }, [dispatch, gameStarted, ended, showStartScreen, countdown]);

  // Helper to create a new customer with entrance animation
  const createCustomer = useCallback((wordPool: VocabItem[]): CustomerWithAnim => {
    return { id: rid(), target: pick(wordPool), attempts: 0, animPhase: 'entering' };
  }, []);

  // Handle animation end for a customer (entering -> seated)
  const handleAnimEnd = useCallback((customerId: string) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId && c.animPhase === 'entering' ? { ...c, animPhase: 'seated' } : c
    ));
  }, []);

  // ✅ FIXED: First customer spawns after exactly 3 seconds
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0 || firstSpawned) return;
    
    const firstSpawnTimer = setTimeout(() => {
      setFirstSpawned(true);
      setSpawnTick(SPAWN_SECONDS);
      if (beltItems.length > 0) {
        const newCustomer = createCustomer(beltItems);
        setWordUsageCount(prevMap => {
          const next = new Map(prevMap);
          next.set(newCustomer.target.id, (next.get(newCustomer.target.id) || 0) + 1);
          return next;
        });
        setCustomers(prev => {
          if (prev.length >= MAX_CUSTOMERS) return prev;
          return [...prev, newCustomer];
        });
      }
    }, FIRST_SPAWN_DELAY);
    
    return () => clearTimeout(firstSpawnTimer);
  }, [gameStarted, ended, showStartScreen, countdown, firstSpawned, beltItems, createCustomer]);


  // ✅ FIXED: Customer spawn timer - uses Date.now() delta, stage-based interval
  useEffect(() => {
    if (!gameStarted || ended || showStartScreen || countdown > 0 || !firstSpawned) return;
    
    const currentInterval = getSpawnInterval(state.stage);
    
    const timer = setInterval(() => {
      setSpawnTick(prev => {
        if (prev <= 1) {
          // Time to spawn new customer
          setCustomers(c => {
            if (c.length >= MAX_CUSTOMERS || beltItems.length === 0) return c;
            // Pick a word that hasn't been used too many times
            const availableWords = beltItems.filter(w => {
              const count = wordUsageCount.get(w.id) || 0;
              return count < MAX_WORD_APPEARANCES;
            });
            const pool = availableWords.length > 0 ? availableWords : beltItems;
            const newCustomer: CustomerWithAnim = { id: rid(), target: pick(pool), attempts: 0, animPhase: 'entering' };
            // Track word usage
            setWordUsageCount(prevMap => {
              const next = new Map(prevMap);
              next.set(newCustomer.target.id, (next.get(newCustomer.target.id) || 0) + 1);
              return next;
            });
            // Entrance animation handled by onAnimationEnd on the customer-slot div
            return [...c, newCustomer];

          });
          return currentInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, ended, beltItems, showStartScreen, countdown, firstSpawned, wordUsageCount, state.stage]);

  useEffect(() => {
    if (words.length > 0 && !showStartScreen && countdown === 0) {
      // Prioritize learned words for belt items
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
      
      // Sort: learned words first, then shuffle within each group
      const learned = words.filter(w => learnedWordIds.has(w.id));
      const unlearned = words.filter(w => !learnedWordIds.has(w.id));
      const shuffledLearned = [...learned].sort(() => Math.random() - 0.5);
      const shuffledUnlearned = [...unlearned].sort(() => Math.random() - 0.5);
      const combined = [...shuffledLearned, ...shuffledUnlearned];
      
      setBeltItems(combined.slice(0, BELT_ITEMS_COUNT));
      setWordUsageCount(new Map());
    }
  }, [words, showStartScreen, countdown]);

  useEffect(() => {
    console.log('[SushiMode] save effect check - secondsLeft:', state.secondsLeft, 'ended:', ended, 'score:', state.score, 'stars:', state.stars, 'stage:', state.stage);
    if (state.secondsLeft <= 0 && !ended) {
      console.log('[SushiMode] Game ended! Saving result...');
      setEnded(true);
      const profile = getActiveProfile();
      console.log('[SushiMode] Active profile:', profile ? JSON.stringify({id: profile.id, nickname: profile.nickname}) : 'null');
      if (profile) {
      saveSessionResult({
          profileId: profile.id,
          gameId: 'sushi',
          nickname: profile.nickname,
          avatar: profile.avatar,
          bestStars: state.stars,
          bestScore: state.score,
          bestStage: state.stage,
          updatedAt: Date.now(),
        });
      }
    }
  }, [ended, state.score, state.secondsLeft, state.stage, state.stars]);

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

  function resolveAttempt(customerId: string) {
    if (!selectedWord || state.secondsLeft <= 0 || showStartScreen || countdown > 0) return;
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const attempts = customer.attempts + 1;
    const correct = selectedWord.id === customer.target.id;

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
      
      // Start exit animation for correct answer
      setCustomers((prev) => prev.map(c => 
        c.id === customerId ? { ...c, animPhase: 'exiting' } : c
      ));
      
      // Remove after animation completes
      setTimeout(() => {
        setCustomers((prev) => prev.filter(c => c.id !== customerId));
      }, 600);
      
      return;
    }

    dispatch({ type: 'WRONG' });
    playWrongSound();
    setShakeEffect(true);
    
    if (attempts >= 3) {
      setResolvedCount((count) => count + 1);
      // Start exit animation for wrong answer (sad slouch)
      setCustomers((prev) => prev.map(c => 
        c.id === customerId ? { ...c, animPhase: 'exiting-wrong' } : c
      ));
      // Remove after animation completes
      setTimeout(() => {
        setCustomers((prev) => prev.filter(c => c.id !== customerId));
      }, 700);
      return;
    }
    
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, attempts } : c))
    );
  }

  // Handle start button click
  const handleStartClick = () => {
    setShowStartScreen(false);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          dispatch({ type: 'RESET', seconds: ROUND_SECONDS });
          setGameStarted(true);
          return 0;
        }
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
    setWordUsageCount(new Map());
  };

  // 🖱️ Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, wordId: string) => {
    if (showStartScreen || countdown > 0 || ended) return;
    e.dataTransfer.setData('text/plain', wordId);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setSelectedWordId(wordId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverCustomer(null);
  };

  const handleDragOver = (e: React.DragEvent, customerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCustomer(customerId);
  };

  const handleDragLeave = () => {
    setDragOverCustomer(null);
  };

  const handleDrop = (e: React.DragEvent, customerId: string) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverCustomer(null);
    resolveAttempt(customerId);
  };

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
    <div className={`sushi-mode ${shakeEffect ? 'shake' : ''}`} ref={gameAreaRef}>
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
          <div className="start-screen">
            <div className="start-sushi-icon">🍣</div>
            <h2>Sushi Match</h2>
            <p>Drag the correct sushi plate to the waiting customer!</p>
            <button className="start-button" onClick={handleStartClick}>
              Start Playing
            </button>
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

      {/* 👤 CUSTOMER AREA - With doors and entrance/exit animations */}
      <div className="customer-area">
        <div className="door-area">
          {/* Entrance Door (upper-left) */}
          <div className="door entrance">
            <div className="door-label">ENTRANCE</div>
          </div>

          {/* Customer Slots */}
          <div className="customer-row">
            {Array.from({ length: MAX_CUSTOMERS }).map((_, index) => {
              const customer = customers[index];
              if (!customer) return (
                <div key={index} className="customer-slot empty">
                  <div className="empty-customer-icon">🪑</div>
                  <div className="empty-customer-text">Waiting...</div>
                </div>
              );
              const isCorrectEffect = showCorrectEffect && correctCustomerId === customer.id;
              const animClass = getAnimClass(customer);
              return (
                <div
                  key={customer.id}
                  id={`customer-${customer.id}`}
                  className={`customer-slot ${animClass} ${dragOverCustomer === customer.id ? 'drag-over' : ''} ${isCorrectEffect ? 'correct-flash' : ''}`}
                  onDragOver={(e) => handleDragOver(e, customer.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, customer.id)}
                  onAnimationEnd={() => handleAnimEnd(customer.id)}
                >

                  {/* 🗨️ Speech balloon ABOVE the customer, tail points DOWN at them */}
                  <div className="bubble">
                    {language === 'th' ? customer.target.meaningTh : customer.target.meaningEn}
                  </div>
                  <div className="avatar">{['😊', '😄', '🤓', '😎', '🙂'][index % 5]}</div>
                  <div className="attempt-indicator">
                    {[0, 1, 2].map(i => (
                      <span key={i} className={`attempt-dot ${i < customer.attempts ? 'used' : ''}`} />
                    ))}
                  </div>
                  {isCorrectEffect && <div className="correct-check">✓</div>}
                </div>
              );
            })}
          </div>

          {/* Exit Door (upper-right) */}
          <div className="door exit">
            <div className="door-label">EXIT</div>
          </div>
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
              draggable
              onDragStart={(e) => handleDragStart(e, selectedWord.id)}
              onDragEnd={handleDragEnd}
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
            <span>Click a sushi plate to pick it up</span>
          </div>
        )}
      </div>

      {/* 🍣 SUSHI CONVEYOR BELT - Bottom */}
      <div className="belt">
        <div className="belt-fade-left" />
        <div className="belt-track">
          {[...belt, ...belt].map((word, index) => (
            <div
              key={`${word.id}-${index}`}
              className={`plate ${selectedWordId === word.id ? 'active hidden' : ''} ${isDragging ? 'belt-dragging' : ''}`}
              onClick={() => {
                if (!showStartScreen && countdown === 0 && !ended) {
                  setSelectedWordId(word.id);
                }
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, word.id)}
              onDragEnd={handleDragEnd}
            >
              <span className="hanzi">{word.hanzi}</span>
              <span className="pinyin">{word.pinyin}</span>
            </div>
          ))}
        </div>
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
          <div className="result-card">
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
          </div>
        </div>
      )}
    </div>
  );
}
