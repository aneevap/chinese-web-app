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
    };
    getNavLang?: () => 'en' | 'th';
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

export function addStudyStars(stars: number, wordIds: string[]) {
  window.XHZ?.addScore?.('study', stars, wordIds);
}
