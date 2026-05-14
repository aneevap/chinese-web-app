import type { VocabItem } from '../core/types';
import { canAccessCourse } from '../profile/profileBridge';

type RawWord = {
  word_id: string;
  ch: string;
  py: string;
  en: string;
  th: string;
  theme?: string;
};

type CourseData = { course: string; words: RawWord[] };
type CoursesFile = {
  courses: Array<{ id: string; data_file: string }>;
};

async function loadJson<T>(path: string): Promise<T> {
  // #region agent log
  fetch('http://127.0.0.1:7679/ingest/3a44f98e-842e-4749-8a27-de831fbc7d57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'813308'},body:JSON.stringify({sessionId:'813308',runId:'pre-fix-1',hypothesisId:'H1',location:'vocab.ts:19',message:'loadJson request start',data:{path,resolvedUrl:new URL(path,window.location.href).href,pageUrl:window.location.href},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const response = await fetch(path);
  // #region agent log
  fetch('http://127.0.0.1:7679/ingest/3a44f98e-842e-4749-8a27-de831fbc7d57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'813308'},body:JSON.stringify({sessionId:'813308',runId:'pre-fix-1',hypothesisId:'H2',location:'vocab.ts:22',message:'loadJson response received',data:{path,status:response.status,ok:response.ok,finalUrl:response.url},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return (await response.json()) as T;
}

export async function loadPlayableWords(): Promise<VocabItem[]> {
  const courses = await loadJson<CoursesFile>('/courses.json');
  const allowed = courses.courses.filter((course) => canAccessCourse(course.id));
  // #region agent log
  fetch('http://127.0.0.1:7679/ingest/3a44f98e-842e-4749-8a27-de831fbc7d57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'813308'},body:JSON.stringify({sessionId:'813308',runId:'pre-fix-1',hypothesisId:'H3',location:'vocab.ts:34',message:'courses parsed and filtered',data:{courseCount:courses.courses.length,allowedCount:allowed.length,allowedIds:allowed.map((c)=>c.id)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const all = await Promise.all(
    allowed.map(async (course) => {
      const courseData = await loadJson<CourseData>(`/${course.data_file}`);
      return courseData.words.map((word) => ({
        id: word.word_id,
        hanzi: word.ch,
        pinyin: word.py,
        meaningEn: word.en,
        meaningTh: word.th,
        course: course.id,
        category: word.theme || 'misc',
      }));
    }),
  );
  return all.flat();
}
