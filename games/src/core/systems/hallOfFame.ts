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

/** Build a unique session ID from profile + game + timestamp */
function makeSessionId(entry: HallOfFameEntry): string {
  return entry.profileId + '_' + entry.gameId + '_' + entry.updatedAt;
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

  // Push to Supabase so other players can see it
  pushToSupabase(result);
}

/**
 * Push a single hall of fame entry to Supabase via the sync bridge.
 * If sync is not ready yet, the entry is queued and will be picked up
 * by pushAll() when the user signs in.
 */
function pushToSupabase(entry: HallOfFameEntry) {
  const sync = (window as any).__SUPABASE_SYNC;
  if (sync && sync.ready) {
    // Attach sessionId for upsert dedup
    const toPush = { ...entry, sessionId: makeSessionId(entry) };
    sync.pushHallOfFameEntry(toPush);
    console.log('[HallOfFame] pushed to Supabase');
  }
}


export function getLeaderboard(): HallOfFameEntry[] {
  return loadEntries().sort((a, b) => {
    if (b.bestStars !== a.bestStars) return b.bestStars - a.bestStars;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return b.updatedAt - a.updatedAt;
  });
}

export function getGameLeaderboard(gameId: string): HallOfFameEntry[] {
  return loadEntries()
    .filter(e => e.gameId === gameId)
    .sort((a, b) => {
      if (b.bestStars !== a.bestStars) return b.bestStars - a.bestStars;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return b.updatedAt - a.updatedAt;
    });
}

/**
 * Get the personal best score for a given profile and game.
 * Returns the highest `bestScore` across all entries, or 0 if no entries exist.
 */
export function getPersonalBest(profileId: string, gameId: string): number {
  const entries = loadEntries();
  let best = 0;
  for (const entry of entries) {
    if (entry.profileId === profileId && entry.gameId === gameId) {
      if (entry.bestScore > best) {
        best = entry.bestScore;
      }
    }
  }
  return best;
}
