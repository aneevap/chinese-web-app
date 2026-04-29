export interface ScoreState {
  score: number;
  combo: number;
  stage: number;
  stars: number;
}

const STAGE_STEP = 15;

export function applyCorrect(prev: ScoreState, attempts: number): ScoreState {
  const stars = attempts === 1 ? 3 : 1;
  const combo = prev.combo + 1;
  const gained = stars + Math.min(combo, 5);
  const score = prev.score + gained;
  return {
    score,
    combo,
    stars: prev.stars + stars,
    stage: computeStage(score),
  };
}

export function applyWrong(prev: ScoreState): ScoreState {
  return { ...prev, combo: 0 };
}

export function computeStage(score: number): number {
  return Math.max(1, Math.floor(score / STAGE_STEP) + 1);
}

/**
 * Stage-based difficulty modifiers
 * 
 * Stage increases by 1 every 15 points (STAGE_STEP).
 * Higher stages make the game harder:
 * - Stage 1-2: Normal (spawn every 6s)
 * - Stage 3-4: Faster (spawn every 5s)
 * - Stage 5+: Expert (spawn every 4s)
 */
export function getSpawnInterval(stage: number): number {
  if (stage >= 5) return 4;
  if (stage >= 3) return 5;
  return 6;
}

/**
 * Get a description of what changes at each stage
 */
export function getStageDescription(stage: number): string {
  if (stage === 1) return 'Normal pace';
  if (stage === 2) return 'Getting warmer';
  if (stage === 3) return 'Faster spawns!';
  if (stage === 4) return 'Speed increasing';
  if (stage >= 5) return 'Expert mode!';
  return '';
}
