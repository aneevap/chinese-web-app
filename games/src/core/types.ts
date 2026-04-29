export type DisplayLanguage = 'en' | 'th';

export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningEn: string;
  meaningTh: string;
  course: string;
  category: string;
}

export interface CustomerOrder {
  id: string;
  target: VocabItem;
  attempts: number;
}

export interface HallOfFameEntry {
  profileId: string;
  gameId: string;
  nickname: string;
  avatar: string;
  bestStars: number;
  bestScore: number;
  bestStage: number;
  updatedAt: number;
}
