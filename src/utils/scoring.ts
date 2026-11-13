import { Category, GameSummary } from '../types/quiz';

export const QUESTION_TIME_SECONDS = 15;
export const BASE_CORRECT_POINTS = 100;
export const MAX_SPEED_BONUS = 100;
export const STREAK_STEP_BONUS = 25;

export interface PointsBreakdown {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
}

export function calculatePoints(
  isCorrect: boolean,
  timeRemaining: number,
  newStreak: number
): PointsBreakdown {
  if (!isCorrect) {
    return {
      basePoints: 0,
      speedBonus: 0,
      streakBonus: 0,
      totalPoints: 0,
    };
  }

  const clampedTime = Math.max(0, Math.min(QUESTION_TIME_SECONDS, timeRemaining));
  const speedBonus = Math.round((clampedTime / QUESTION_TIME_SECONDS) * MAX_SPEED_BONUS);
  const streakBonus = newStreak >= 2 ? (newStreak - 1) * STREAK_STEP_BONUS : 0;

  return {
    basePoints: BASE_CORRECT_POINTS,
    speedBonus,
    streakBonus,
    totalPoints: BASE_CORRECT_POINTS + speedBonus + streakBonus,
  };
}

export function formatModeTitle(mode: GameSummary['mode'], category?: Category): string {
  switch (mode) {
    case 'daily':
      return 'Daily Quiz';
    case 'quick':
      return 'Quick Play';
    case 'streak':
      return 'Streak Mode';
    case 'category':
      return category ? `Category: ${category}` : 'Category Play';
  }
}

export function formatShareText(summary: GameSummary): string {
  const modeLabel = formatModeTitle(summary.mode, summary.category);
  const total = summary.results.length;
  const accuracy = total > 0 ? Math.round((summary.correctCount / total) * 100) : 0;

  const grid = summary.results
    .map((r) => {
      if (r.isSkipped) return '🟨';
      if (r.isCorrect) return '🟩';
      return '🟥';
    })
    .join('');

  const dateLine =
    summary.mode === 'daily' && summary.dateKey
      ? ` (${summary.dateKey})`
      : '';

  const statsLine =
    summary.mode === 'streak'
      ? `Streak: ${summary.correctCount} · Score: ${summary.totalScore.toLocaleString()} pts`
      : `Score: ${summary.totalScore.toLocaleString()} pts · ${summary.correctCount}/${total} (${accuracy}%)`;

  return [
    `Daily Quiz Arena — ${modeLabel}${dateLine}`,
    statsLine,
    grid,
  ].join('\n');
}
