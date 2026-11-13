import { BestScores, Category, GameMode } from '../types/quiz';

const SCORES_KEY = 'daily_quiz_arena_scores_v1';
const SOUND_KEY = 'daily_quiz_arena_sound_v1';

const DEFAULT_SCORES: BestScores = {
  dailyBestScore: 0,
  dailyCompletedDate: null,
  dailyTodayScore: null,
  dailyTodayCorrect: null,
  dailyPlayStreak: 0,
  quickBestScore: 0,
  streakBestRun: 0,
  streakBestScore: 0,
  categoryBestScores: {},
  totalGamesPlayed: 0,
};

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateKey(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function loadBestScores(): BestScores {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return { ...DEFAULT_SCORES, categoryBestScores: {} };
    const parsed = JSON.parse(raw) as Partial<BestScores>;
    const today = getTodayDateKey();
    const yesterday = getYesterdayDateKey();

    const completedDate = parsed.dailyCompletedDate ?? null;
    const isToday = completedDate === today;
    const streakStillValid = completedDate === today || completedDate === yesterday;

    return {
      dailyBestScore: typeof parsed.dailyBestScore === 'number' ? parsed.dailyBestScore : 0,
      dailyCompletedDate: completedDate,
      dailyTodayScore: isToday && typeof parsed.dailyTodayScore === 'number' ? parsed.dailyTodayScore : null,
      dailyTodayCorrect: isToday && typeof parsed.dailyTodayCorrect === 'number' ? parsed.dailyTodayCorrect : null,
      dailyPlayStreak: streakStillValid && typeof parsed.dailyPlayStreak === 'number' ? parsed.dailyPlayStreak : 0,
      quickBestScore: typeof parsed.quickBestScore === 'number' ? parsed.quickBestScore : 0,
      streakBestRun: typeof parsed.streakBestRun === 'number' ? parsed.streakBestRun : 0,
      streakBestScore: typeof parsed.streakBestScore === 'number' ? parsed.streakBestScore : 0,
      categoryBestScores: parsed.categoryBestScores ?? {},
      totalGamesPlayed: typeof parsed.totalGamesPlayed === 'number' ? parsed.totalGamesPlayed : 0,
    };
  } catch {
    return { ...DEFAULT_SCORES, categoryBestScores: {} };
  }
}

export function recordGameScore(params: {
  mode: GameMode;
  category?: Category;
  score: number;
  correctCount: number;
}): { updated: BestScores; isNewBest: boolean } {
  const current = loadBestScores();
  const next: BestScores = {
    ...current,
    categoryBestScores: { ...current.categoryBestScores },
    totalGamesPlayed: current.totalGamesPlayed + 1,
  };

  let isNewBest = false;
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();

  if (params.mode === 'daily') {
    if (params.score > current.dailyBestScore) {
      next.dailyBestScore = params.score;
      isNewBest = true;
    }
    if (current.dailyCompletedDate !== today) {
      next.dailyPlayStreak =
        current.dailyCompletedDate === yesterday ? current.dailyPlayStreak + 1 : 1;
      next.dailyCompletedDate = today;
      next.dailyTodayScore = params.score;
      next.dailyTodayCorrect = params.correctCount;
    } else if (
      current.dailyTodayScore === null ||
      params.score > current.dailyTodayScore
    ) {
      next.dailyTodayScore = params.score;
      next.dailyTodayCorrect = params.correctCount;
    }
  } else if (params.mode === 'quick') {
    if (params.score > current.quickBestScore) {
      next.quickBestScore = params.score;
      isNewBest = true;
    }
  } else if (params.mode === 'streak') {
    if (params.correctCount > current.streakBestRun) {
      next.streakBestRun = params.correctCount;
      isNewBest = true;
    }
    if (params.score > current.streakBestScore) {
      next.streakBestScore = params.score;
      isNewBest = true;
    }
  } else if (params.mode === 'category' && params.category) {
    const prevCatBest = current.categoryBestScores[params.category] ?? 0;
    if (params.score > prevCatBest) {
      next.categoryBestScores[params.category] = params.score;
      isNewBest = true;
    }
  }

  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors cleanly
  }

  return { updated: next, isNewBest };
}

export function loadSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Ignore
  }
}
