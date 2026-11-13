export const CATEGORIES = [
  'General Knowledge',
  'Money & Finance',
  'Science',
  'World & Geography',
  'History',
  'Capitals',
  'Currencies',
  'Landmarks',
  'Maths',
  'Animals',
  'Technology',
  'Sports',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type GameMode = 'daily' | 'quick' | 'streak' | 'category';

export interface QuizQuestion {
  id: string;
  category: Category;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  fact: string;
}

export interface QuestionResult {
  question: QuizQuestion;
  selectedIndex: number | null;
  isCorrect: boolean;
  isSkipped: boolean;
  isTimeout: boolean;
  timeRemaining: number;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
}

export interface BestScores {
  dailyBestScore: number;
  dailyCompletedDate: string | null;
  dailyTodayScore: number | null;
  dailyTodayCorrect: number | null;
  dailyPlayStreak: number;
  quickBestScore: number;
  streakBestRun: number;
  streakBestScore: number;
  categoryBestScores: Partial<Record<Category, number>>;
  totalGamesPlayed: number;
}

export interface GameSummary {
  mode: GameMode;
  category?: Category;
  dateKey?: string;
  totalScore: number;
  correctCount: number;
  answeredCount: number;
  maxStreak: number;
  results: QuestionResult[];
  isNewBest: boolean;
}
