import { useEffect, useState } from 'react';
import { GameStateProvider } from '../core/state/gameState';
import { initVoices } from '../core/systems/audio';
import { loadPlayableWords } from '../data/vocab';
import type { DisplayLanguage, VocabItem } from '../core/types';
import { getDisplayLang } from '../profile/profileBridge';
import { SushiMode } from '../modes/sushi/SushiMode';
import { MatchingPlaceholder } from '../modes/matching/MatchingPlaceholder';

export function App() {
  const [words, setWords] = useState<VocabItem[]>([]);
  const [language, setLanguage] = useState<DisplayLanguage>(getDisplayLang());
  const [mode, setMode] = useState<'sushi' | 'matching'>('sushi');
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    initVoices();
    loadPlayableWords()
      .then(setWords)
      .catch((err: Error) => {
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
        <div className="mode-tabs">
          <button className={mode === 'sushi' ? 'active' : ''} onClick={() => setMode('sushi')}>
            Sushi
          </button>
          <button className={mode === 'matching' ? 'active' : ''} onClick={() => setMode('matching')}>
            Matching
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {!error && words.length === 0 && <div className="loading">Loading words...</div>}
        {!error && words.length > 0 && mode === 'sushi' && <SushiMode words={words} language={language} />}
        {!error && mode === 'matching' && <MatchingPlaceholder />}
      </div>
    </GameStateProvider>
  );
}


