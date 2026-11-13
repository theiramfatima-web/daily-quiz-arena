import { useState } from 'react';
import {
  Check,
  Copy,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Award,
  Lightbulb,
} from 'lucide-react';
import { GameSummary } from '../types/quiz';
import { formatModeTitle, formatShareText } from '../utils/scoring';
import { formatReadableDate } from '../utils/storage';

interface ResultsScreenProps {
  summary: GameSummary;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

type ReviewFilter = 'all' | 'correct' | 'missed';

export function ResultsScreen({
  summary,
  onPlayAgain,
  onGoHome,
}: ResultsScreenProps) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const totalQuestions = summary.results.length;
  const accuracy =
    totalQuestions > 0
      ? Math.round((summary.correctCount / totalQuestions) * 100)
      : 0;

  const shareText = formatShareText(summary);

  const handleCopyScore = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy via temporary textarea
      const el = document.createElement('textarea');
      el.value = shareText;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  const filteredResults = summary.results
    .map((res, idx) => ({ res, index: idx + 1 }))
    .filter(({ res }) => {
      if (filter === 'correct') return res.isCorrect;
      if (filter === 'missed') return !res.isCorrect;
      return true;
    });

  const missedCount = totalQuestions - summary.correctCount;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Score Summary Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {formatModeTitle(summary.mode, summary.category)}
              {summary.mode === 'daily' && summary.dateKey
                ? ` · ${formatReadableDate(summary.dateKey)}`
                : ''}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              {summary.mode === 'streak'
                ? `${summary.correctCount} Question Streak`
                : accuracy >= 80
                ? 'Outstanding Run!'
                : accuracy >= 50
                ? 'Solid Finish!'
                : 'Round Complete'}
            </h1>
          </div>

          {summary.isNewBest && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm shrink-0">
              <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>New Personal Best</span>
            </div>
          )}
        </div>

        {/* 4 KPI Readout Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Total Score</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {summary.totalScore.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Correct</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums mt-0.5">
              {summary.correctCount}/{totalQuestions}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Accuracy</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {accuracy}%
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500">Best Streak</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-orange-600 tabular-nums mt-0.5">
              {summary.maxStreak}
            </p>
          </div>
        </div>

        {/* Share Preview & Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono whitespace-pre-line leading-relaxed">
            {shareText}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyScore}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm sm:text-base transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Score</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm sm:text-base transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Play Again</span>
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-display font-semibold text-sm sm:text-base transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>All Modes</span>
            </button>
          </div>
        </div>
      </section>

      {/* Question-by-Question Review */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Answer Review
          </h2>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'correct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({summary.correctCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('missed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'missed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missed ({missedCount})
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {filteredResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-600">
              No questions match this filter.
            </div>
          ) : (
            filteredResults.map(({ res, index }) => {
              const correctAnswer = res.question.options[res.question.correctIndex];
              const userAnswer =
                res.selectedIndex !== null
                  ? res.question.options[res.selectedIndex]
                  : null;

              return (
                <article
                  key={`${res.question.id}-${index}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-500">
                      Question {index} · {res.question.category}
                    </span>

                    {res.isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 tabular-nums">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Correct · +{res.totalPoints} pts</span>
                      </span>
                    ) : res.isSkipped ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                        <SkipForward className="w-4 h-4" aria-hidden="true" />
                        <span>Skipped</span>
                      </span>
                    ) : res.isTimeout ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span>Time&apos;s Up</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {res.question.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-emerald-950">
                      <span className="block text-xs font-medium text-emerald-700">
                        Correct Answer
                      </span>
                      <span className="font-semibold">{correctAnswer}</span>
                    </div>

                    {!res.isCorrect && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800">
                        <span className="block text-xs font-medium text-slate-500">
                          Your Response
                        </span>
                        <span className="font-semibold">
                          {res.isSkipped
                            ? 'Skipped with lifeline'
                            : res.isTimeout
                            ? 'No answer (timed out)'
                            : userAnswer}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 pt-1">
                    <Lightbulb
                      className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p>{res.question.fact}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
