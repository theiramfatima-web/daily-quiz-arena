import { CATEGORIES, Category, QuizQuestion } from '../types/quiz';
import { GENERAL_KNOWLEDGE_QUESTIONS, HISTORY_QUESTIONS } from './questions/generalAndHistory';
import {
  CAPITALS_QUESTIONS,
  LANDMARKS_QUESTIONS,
  WORLD_GEOGRAPHY_QUESTIONS,
} from './questions/geographyAndLandmarks';
import { CURRENCIES_QUESTIONS, MONEY_FINANCE_QUESTIONS } from './questions/moneyAndCurrencies';
import { ANIMALS_QUESTIONS, MATHS_QUESTIONS, SPORTS_QUESTIONS } from './questions/mathsAnimalsSports';
import { SCIENCE_QUESTIONS, TECHNOLOGY_QUESTIONS } from './questions/scienceAndTech';

export const QUESTION_BANK: QuizQuestion[] = [
  ...GENERAL_KNOWLEDGE_QUESTIONS,
  ...MONEY_FINANCE_QUESTIONS,
  ...SCIENCE_QUESTIONS,
  ...WORLD_GEOGRAPHY_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...CAPITALS_QUESTIONS,
  ...CURRENCIES_QUESTIONS,
  ...LANDMARKS_QUESTIONS,
  ...MATHS_QUESTIONS,
  ...ANIMALS_QUESTIONS,
  ...TECHNOLOGY_QUESTIONS,
  ...SPORTS_QUESTIONS,
];

export const CATEGORY_META: Record<
  Category,
  { color: string; bg: string; border: string; text: string; shortDesc: string }
> = {
  'General Knowledge': {
    color: 'bg-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    shortDesc: 'Everyday facts, culture, and classics',
  },
  'Money & Finance': {
    color: 'bg-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    shortDesc: 'Investing, markets, and personal finance',
  },
  Science: {
    color: 'bg-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    shortDesc: 'Physics, chemistry, biology, and space',
  },
  'World & Geography': {
    color: 'bg-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    shortDesc: 'Oceans, rivers, borders, and continents',
  },
  History: {
    color: 'bg-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    shortDesc: 'Civilizations, treaties, and turning points',
  },
  Capitals: {
    color: 'bg-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    shortDesc: 'Capital cities around the globe',
  },
  Currencies: {
    color: 'bg-lime-600',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-700',
    shortDesc: 'Banknotes, coins, and ISO codes',
  },
  Landmarks: {
    color: 'bg-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    shortDesc: 'Monuments, wonders, and skylines',
  },
  Maths: {
    color: 'bg-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    shortDesc: 'Arithmetic, geometry, algebra, and logic',
  },
  Animals: {
    color: 'bg-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    shortDesc: 'Wildlife, habitats, and adaptations',
  },
  Technology: {
    color: 'bg-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    shortDesc: 'Computing, web protocols, and inventions',
  },
  Sports: {
    color: 'bg-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-700',
    shortDesc: 'Rules, records, and global tournaments',
  },
};

export function getCategoryCounts(): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const cat of CATEGORIES) {
    counts[cat] = 0;
  }
  for (const item of QUESTION_BANK) {
    counts[item.category] += 1;
  }
  return counts;
}

// Deterministic FNV-1a string hash -> 32-bit integer seed
function hashDateKey(seedStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Mulberry32 PRNG for deterministic daily shuffle
function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Shuffle the 4 options of a question while updating correctIndex accurately
function shuffleQuestionOptions(question: QuizQuestion, rng: () => number): QuizQuestion {
  const indexed = question.options.map((opt, idx) => ({
    opt,
    isCorrect: idx === question.correctIndex,
  }));
  const shuffled = shuffleWithRng(indexed, rng);
  const nextCorrect = shuffled.findIndex((entry) => entry.isCorrect) as 0 | 1 | 2 | 3;
  return {
    ...question,
    options: [
      shuffled[0].opt,
      shuffled[1].opt,
      shuffled[2].opt,
      shuffled[3].opt,
    ],
    correctIndex: nextCorrect,
  };
}

export function getDailyQuestions(dateKey: string, count = 10): QuizQuestion[] {
  const rng = createSeededRng(hashDateKey(`daily-quiz-arena:${dateKey}`));
  const shuffled = shuffleWithRng(QUESTION_BANK, rng);
  return shuffled.slice(0, count).map((item) => shuffleQuestionOptions(item, rng));
}

export function getQuickPlayQuestions(count = 10): QuizQuestion[] {
  const shuffled = shuffleWithRng(QUESTION_BANK, Math.random);
  return shuffled.slice(0, count).map((item) => shuffleQuestionOptions(item, Math.random));
}

export function getCategoryQuestions(category: Category, count = 10): QuizQuestion[] {
  const pool = QUESTION_BANK.filter((item) => item.category === category);
  const shuffled = shuffleWithRng(pool, Math.random);
  return shuffled.slice(0, count).map((item) => shuffleQuestionOptions(item, Math.random));
}

export function getStreakDeck(): QuizQuestion[] {
  const shuffled = shuffleWithRng(QUESTION_BANK, Math.random);
  return shuffled.map((item) => shuffleQuestionOptions(item, Math.random));
}
