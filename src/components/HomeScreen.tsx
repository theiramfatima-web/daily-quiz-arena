import {
  Calendar,
  Zap,
  Flame,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
  Timer,
  LifeBuoy,
} from 'lucide-react';
import { BestScores, CATEGORIES } from '../types/quiz';
import { formatReadableDate } from '../utils/storage';

interface HomeScreenProps {
  todayKey: string;
  totalQuestions: number;
  scores: BestScores;
  onStartDaily: () => void;
  onStartQuick: () => void;
  onStartStreak: () => void;
  onOpenCategories: () => void;
}

export function HomeScreen({
  todayKey,
  totalQuestions,
  scores,
  onStartDaily,
  onStartQuick,
  onStartStreak,
  onOpenCategories,
}: HomeScreenProps) {
  const playedDailyToday = scores.dailyCompletedDate === todayKey;

  const categoryEntries = Object.values(scores.categoryBestScores).filter(
    (v): v is number => typeof v === 'number' && v > 0
  );
  const topCategoryScore =
    categoryEntries.length > 0 ? Math.max(...categoryEntries) : 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero Intro */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-medium text-blue-600">
            {formatReadableDate(todayKey)}
            <span aria-hidden="true"> · </span>
            {totalQuestions} Questions
            <span aria-hidden="true"> · </span>
            {CATEGORIES.length} Categories
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
            Sharpen your mind in 15 seconds a question.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Pick a mode below to test your speed, protect your streak, or challenge friends with today&apos;s identical Daily Quiz.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
          <div>
            <p className="text-xs text-slate-500">Games Played</p>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {scores.totalGamesPlayed}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Daily Streak</p>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {scores.dailyPlayStreak} {scores.dailyPlayStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Best Streak Run</p>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {scores.streakBestRun}
            </p>
          </div>
        </div>
      </section>

      {/* 4 Game Modes Grid */}
      <section aria-label="Game Modes" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Daily Quiz */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-blue-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Best Daily Score</p>
                <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                  {scores.dailyBestScore.toLocaleString()} pts
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Daily Quiz
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                10 seeded questions shared by every player on {formatReadableDate(todayKey)}. Come back tomorrow for a brand-new set.
              </p>
            </div>

            {playedDailyToday && scores.dailyTodayScore !== null && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  Completed today: {scores.dailyTodayScore.toLocaleString()} pts ({scores.dailyTodayCorrect ?? 0}/10)
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onStartDaily}
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:translate-y-px text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>{playedDailyToday ? "Replay Today's Quiz" : "Play Today's Quiz"}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 2. Quick Play */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-emerald-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Best Quick Score</p>
                <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                  {scores.quickBestScore.toLocaleString()} pts
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Quick Play
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                10 freshly shuffled questions spanning all 12 trivia categories. Fast rounds whenever you want a quick challenge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartQuick}
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:translate-y-px text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <span>Start Quick Play</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 3. Streak Mode */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-orange-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Best Run / Score</p>
                <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                  {scores.streakBestRun} · {scores.streakBestScore.toLocaleString()} pts
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Streak Mode
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Endless non-repeating questions until your first wrong answer or timeout. Build massive streak multipliers as you survive.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartStreak}
            className="w-full py-3.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 active:translate-y-px text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
          >
            <span>Start Streak Run</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 4. Category Play */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6 hover:border-violet-300 transition-colors">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Top Category Score</p>
                <p className="font-display text-lg font-bold text-slate-900 tabular-nums">
                  {topCategoryScore.toLocaleString()} pts
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Category Play
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Pick any of our 12 specialized subjects—from Science and Maths to Capitals, Currencies, and Landmarks—for 10 focused questions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCategories}
            className="w-full py-3.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 active:translate-y-px text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            <span>Choose Category</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Rules Summary Strip */}
      <section className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div className="flex items-start gap-3">
          <Timer className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-slate-900">15-Second Speed Bonus</h3>
            <p className="text-slate-600 mt-0.5">
              Earn 100 base points per right answer plus up to 100 speed points for quick responses.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-slate-900">Consecutive Streak Bonus</h3>
            <p className="text-slate-600 mt-0.5">
              Chain right answers to add +25 bonus points per streak step (+25, +50, +75, and up).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <LifeBuoy className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-slate-900">Two Tactical Lifelines</h3>
            <p className="text-slate-600 mt-0.5">
              Once per game, use 50:50 to eliminate two wrong answers or Skip to advance without penalty.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
