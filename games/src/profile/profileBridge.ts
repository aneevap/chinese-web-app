type Profile = {
  id: string;
  nickname: string;
  avatar: string;
};

declare global {
  interface Window {
    XHZ?: {
      getActiveProfile?: () => Profile | null;
      getCourseSeenPercent?: (courseId: string) => number;
      addScore?: (source: 'study' | 'write', points: number, wordIds?: string[]) => unknown;
      awardGameCoin?: (gameId: string) => number;
      addCoins?: (profileId: string, amount: number, source: string) => number;
      spendCoins?: (profileId: string, amount: number) => boolean;
      getCoins?: (profileId: string) => number;
    };
    getNavLang?: () => 'en' | 'th';
    closeGame?: () => void;
  }
}

export function getActiveProfile(): Profile | null {
  return window.XHZ?.getActiveProfile?.() || null;
}

export function getDisplayLang(): 'en' | 'th' {
  return window.getNavLang?.() || (localStorage.getItem('xhz_lang') as 'en' | 'th') || 'en';
}

export function canAccessCourse(courseId: string): boolean {
  if (courseId === '1A') return true;
  if (courseId === '1B') return (window.XHZ?.getCourseSeenPercent?.('1A') || 0) >= 100;
  return false;
}

export function awardGameCoin(gameId: string): number {
  return window.XHZ?.awardGameCoin?.(gameId) || 0;
}

