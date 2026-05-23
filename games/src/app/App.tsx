import { useEffect, useState } from 'react';
import { GameStateProvider } from '../core/state/gameState';
import { initVoices } from '../core/systems/audio';
import { loadPlayableWords, loadCourseThemes } from '../data/vocab';
import type { CourseMeta } from '../data/vocab';
import type { DisplayLanguage, VocabItem } from '../core/types';
import { getDisplayLang } from '../profile/profileBridge';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { SushiMode } from '../modes/sushi/SushiMode';
import { MatchingMode } from '../modes/matching/MatchingMode';

export function App() {
  const [words, setWords] = useState<VocabItem[]>([]);
  const [courseThemes, setCourseThemes] = useState<Record<string, CourseMeta>>({});
  const [language, setLanguage] = useState<DisplayLanguage>(getDisplayLang());
  const [mode, setMode] = useState<'sushi' | 'matching'>('sushi');
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    initVoices();
    Promise.all([
      loadPlayableWords(),
      loadCourseThemes(),
    ]).then(([words, themes]) => {
      setWords(words);
      setCourseThemes(themes);
    }).catch((err: Error) => {
      setError(err.message);
    });
    const onLang = () => setLanguage(getDisplayLang());
    const onMount = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.gameId === 'sushi') setMode('sushi');
      if (detail?.gameId === 'matching') setMode('matching');
      setVisible(true);
    };
    const onUnmount = () => setVisible(false);
    window.addEventListener('xhz:lang-changed', onLang);
    window.addEventListener('xhz:mount-game', onMount);
    window.addEventListener('xhz:unmount-game', onUnmount);
    return () => {
      window.removeEventListener('xhz:lang-changed', onLang);
      window.removeEventListener('xhz:mount-game', onMount);
      window.removeEventListener('xhz:unmount-game', onUnmount);
    };
  }, []);

  if (!visible) return null;

  return (
    <GameStateProvider>
      <div className="app-shell">
        <div className="mode-tabs" style={{ display: gameActive ? 'none' : undefined }}>
          <button className={mode === 'sushi' ? 'active' : ''} onClick={() => setMode('sushi')}>
            Sushi
          </button>
          <button className={mode === 'matching' ? 'active' : ''} onClick={() => setMode('matching')}>
            Matching
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {!error && words.length === 0 && <div className="loading">Loading words...</div>}
        {!error && words.length > 0 && (
          <ErrorBoundary>
            {mode === 'sushi' && <SushiMode words={words} courseThemes={courseThemes} language={language} onGameActiveChange={setGameActive} />}
            {mode === 'matching' && <MatchingMode words={words} courseThemes={courseThemes} language={language} onGameActiveChange={setGameActive} />}
          </ErrorBoundary>
        )}
      </div>
    </GameStateProvider>
  );
}


