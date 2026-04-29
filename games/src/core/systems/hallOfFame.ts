import type { HallOfFameEntry } from '../types';

const KEY = 'xhz_dojo_hall_of_fame';

function loadEntries(): HallOfFameEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as HallOfFameEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: HallOfFameEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function saveSessionResult(result: HallOfFameEntry) {
  console.log('[HallOfFame] saveSessionResult called with:', JSON.stringify(result));
  const entries = loadEntries();
  console.log('[HallOfFame] current entries count:', entries.length);
  // Always push a new entry so every game session creates a new record
  entries.push(result);
  console.log('[HallOfFame] pushed new entry');
  saveEntries(entries);
  console.log('[HallOfFame] saved entries count:', loadEntries().length);
  window.dispatchEvent(new CustomEvent('xhz:dojo-hof-updated'));
}


export function getLeaderboard(): HallOfFameEntry[] {
  return loadEntries().sort((a, b) => {
    if (b.bestStars !== a.bestStars) return b.bestStars - a.bestStars;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return b.updatedAt - a.updatedAt;
  });
}
