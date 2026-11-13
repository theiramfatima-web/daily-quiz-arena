import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  SkipForward,
  Scissors,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { CATEGORY_META } from '../data/questionBank';
import { Category, GameMode, QuestionResult, QuizQuestion } from '../types/quiz';
import {
  QUESTION_TIME_SECONDS,
  calculatePoints,
  formatModeTitle,
} from '../utils/scoring';
import {
  playCorrectSound,
  playFinishSound,
  playLifelineSound,
  playWrongSound,
} from '../utils/sound';

interface QuizScreenProps {
  mode: GameMode;
  category?: Category;
  questions: QuizQuestion[];
  onComplete: (payload: {
    results: QuestionResult[];
    totalScore: number;
    correctCount: number;
    maxStreak: number;
  }) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function QuizScreen({
  mode,
  category,
  questions,
  onComplete,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedSkip, setUsedSkip] = useState(false);

  const [results, setResults] = useState<QuestionResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastPoints, setLastPoints] = useState<{
    basePoints: number;
    speedBonus: number;
    streakBonus: number;
    totalPoints: number;
  } | null>(null);

  const deadlineRef = useRef<number>(0);
  const resolvedRef = useRef(false);

  const question = questions[currentIndex];
  const isAnswered = selectedIndex !== null || isTimeout;
  const isStreakRunEnded = mode === 'streak' && isAnswered && selectedIndex !== question.correctIndex;
  const isLastQuestion = currentIndex + 1 >= questions.length || isStreakRunEnded;

  const finishGame = useCallback(
    (
      finalResults: QuestionResult[],
      finalScore: number,
      finalMaxStreak: number
    ) => {
      playFinishSound();
      const correctCount = finalResults.filter((r) => r.isCorrect).length;
      onComplete({
        results: finalResults,
        totalScore: finalScore,
        correctCount,
        maxStreak: finalMaxStreak,
      });
    },
    [onComplete]
  );

  // Start / reset 15s timer whenever question index changes
  useEffect(() => {
    resolvedRef.current = false;
    setSelectedIndex(null);
    setIsTimeout(false);
    setHiddenIndices([]);
    setLastPoints(null);
    setTimeLeft(QUESTION_TIME_SECONDS);

    deadlineRef.current = performance.now() + QUESTION_TIME_SECONDS * 1000;

    const intervalId = window.setInterval(() => {
      if (resolvedRef.current) return;
      const remainingMs = deadlineRef.current - performance.now();
      const remainingSec = Math.max(0, remainingMs / 1000);
      setTimeLeft(remainingSec);

      if (remainingMs <= 0) {
        resolvedRef.current = true;
        window.clearInterval(intervalId);
        setIsTimeout(true);
        setCurrentStreak(0);
        setLastPoints({
          basePoints: 0,
          speedBonus: 0,
          streakBonus: 0,
          totalPoints: 0,
        });
        playWrongSound();

        const timeoutResult: QuestionResult = {
          question: questions[currentIndex],
          selectedIndex: null,
          isCorrect: false,
          isSkipped: false,
          isTimeout: true,
          timeRemaining: 0,
          basePoints: 0,
          speedBonus: 0,
          streakBonus: 0,
          totalPoints: 0,
        };
        setResults((prev) => [...prev, timeoutResult]);
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [currentIndex, questions]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (resolvedRef.current || hiddenIndices.includes(index)) return;
      resolvedRef.current = true;

      const remainingSec = Math.max(
        0,
        (deadlineRef.current - performance.now()) / 1000
      );
      setTimeLeft(remainingSec);
      setSelectedIndex(index);

      const isCorrect = index === question.correctIndex;
      const nextStreak = isCorrect ? currentStreak + 1 : 0;
      const nextMaxStreak = Math.max(maxStreak, nextStreak);
      const breakdown = calculatePoints(isCorrect, remainingSec, nextStreak);

      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      setCurrentStreak(nextStreak);
      setMaxStreak(nextMaxStreak);
      setTotalScore((prev) => prev + breakdown.totalPoints);
      setLastPoints(breakdown);

      const entry: QuestionResult = {
        question,
        selectedIndex: index,
        isCorrect,
        isSkipped: false,
        isTimeout: false,
        timeRemaining: remainingSec,
        ...breakdown,
      };
      setResults((prev) => [...prev, entry]);
    },
    [currentStreak, hiddenIndices, maxStreak, question]
  );

  const handleUseFiftyFifty = useCallback(() => {
    if (usedFiftyFifty || resolvedRef.current) return;
    const wrongIndices = [0, 1, 2, 3].filter(
      (idx) => idx !== question.correctIndex
    );
    // Pick two wrong indices randomly
    for (let i = wrongIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
    }
    setHiddenIndices(wrongIndices.slice(0, 2));
    setUsedFiftyFifty(true);
    playLifelineSound();
  }, [question.correctIndex, usedFiftyFifty]);

  const handleUseSkip = useCallback(() => {
    if (usedSkip || resolvedRef.current) return;
    resolvedRef.current = true;
    setUsedSkip(true);
    playLifelineSound();

    const skipEntry: QuestionResult = {
      question,
      selectedIndex: null,
      isCorrect: false,
      isSkipped: true,
      isTimeout: false,
      timeRemaining: timeLeft,
      basePoints: 0,
      speedBonus: 0,
      streakBonus: 0,
      totalPoints: 0,
    };

    const nextResults = [...results, skipEntry];
    if (currentIndex + 1 >= questions.length) {
      finishGame(nextResults, totalScore, maxStreak);
    } else {
      setResults(nextResults);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentIndex,
    finishGame,
    maxStreak,
    question,
    questions.length,
    results,
    timeLeft,
    totalScore,
    usedSkip,
  ]);

  const handleNext = useCallback(() => {
    if (!isAnswered) return;
    if (isLastQuestion) {
      finishGame(results, totalScore, maxStreak);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [finishGame, isAnswered, isLastQuestion, maxStreak, results, totalScore]);

  // Keyboard shortcuts: 1-4 / A-D to pick option, Enter/Space to continue
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (!isAnswered) {
        const keyMap: Record<string, number> = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          a: 0,
          A: 0,
          b: 1,
          B: 1,
          c: 2,
          C: 2,
          d: 3,
          D: 3,
        };
        if (e.key in keyMap) {
          e.preventDefault();
          handleSelectOption(keyMap[e.key]);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handleSelectOption, isAnswered]);

  const timerRatio = Math.max(0, Math.min(1, timeLeft / QUESTION_TIME_SECONDS));
  const timerBarColor =
    timeLeft > 7
      ? 'bg-blue-600'
      : timeLeft > 4
      ? 'bg-amber-500'
      : 'bg-rose-600';

  const catMeta = CATEGORY_META[question.category];
  const progressText =
    mode === 'streak'
      ? `Question ${currentIndex + 1}`
      : `Question ${currentIndex + 1} of ${questions.length}`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
      {/* HUD Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {formatModeTitle(mode, category)}
          </span>
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">{progressText}</span>
          <span aria-hidden="true"> · </span>
          <span className={`font-semibold ${catMeta.text}`}>
            {question.category}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 font-display font-bold text-orange-600 tabular-nums">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span>{currentStreak} streak</span>
            </div>
          )}
          <div className="font-display font-bold text-slate-900 tabular-nums">
            {totalScore.toLocaleString()} pts
          </div>
          <div
            className={`flex items-center gap-1 font-display font-bold tabular-nums min-w-[3.5rem] justify-end ${
              timeLeft <= 4 && !isAnswered ? 'text-rose-600' : 'text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{Math.ceil(timeLeft)}s</span>
          </div>
        </div>
      </div>

      {/* 15-Second Countdown Bar */}
      <div
        className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Question timer"
        aria-valuemin={0}
        aria-valuemax={QUESTION_TIME_SECONDS}
        aria-valuenow={Math.ceil(timeLeft)}
      >
        <div
          className={`h-full origin-left transition-colors duration-200 ${timerBarColor}`}
          style={{ transform: `scaleX(${timerRatio})` }}
        />
      </div>

      {/* Question Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug text-balance">
          {question.question}
        </h1>

        {/* 4 Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {question.options.map((option, idx) => {
            const isHiddenByFifty = hiddenIndices.includes(idx);
            const isCorrectOption = idx === question.correctIndex;
            const isSelected = idx === selectedIndex;

            let cardClasses =
              'bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-400 text-slate-900 cursor-pointer';
            let letterClasses =
              'bg-white border border-slate-200 text-slate-700';

            if (isHiddenByFifty && !isAnswered) {
              cardClasses =
                'bg-slate-50 border-slate-200 text-slate-400 opacity-30 pointer-events-none line-through';
              letterClasses = 'bg-slate-100 border border-slate-200 text-slate-400';
            } else if (isAnswered) {
              if (isCorrectOption) {
                cardClasses =
                  'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500';
                letterClasses = 'bg-emerald-600 border-emerald-600 text-white';
              } else if (isSelected && !isCorrectOption) {
                cardClasses =
                  'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
                letterClasses = 'bg-rose-600 border-rose-600 text-white';
              } else {
                cardClasses =
                  'bg-slate-50/60 border-slate-200 text-slate-500 opacity-70';
                letterClasses = 'bg-white border border-slate-200 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered || isHiddenByFifty}
                aria-hidden={isHiddenByFifty && !isAnswered ? true : undefined}
                onClick={() => handleSelectOption(idx)}
                className={`min-h-[64px] w-full text-left rounded-xl border p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${cardClasses}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-lg font-display font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${letterClasses}`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="font-medium text-base leading-snug">
                    {option}
                  </span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 shrink-0"
                    aria-label="Correct answer"
                  />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle
                    className="w-5 h-5 text-rose-600 shrink-0"
                    aria-label="Incorrect selection"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Lifelines Bar (while active) */}
        {!isAnswered && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Lifelines (1 use each per game)
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={usedFiftyFifty}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  usedFiftyFifty
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <Scissors className="w-4 h-4 text-violet-600" aria-hidden="true" />
                <span>50:50</span>
                <span className="text-xs font-normal text-slate-500">
                  ({usedFiftyFifty ? 'Used' : '1 left'})
                </span>
              </button>

              <button
                type="button"
                onClick={handleUseSkip}
                disabled={usedSkip}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  usedSkip
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <SkipForward className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span>Skip</span>
                <span className="text-xs font-normal text-slate-500">
                  ({usedSkip ? 'Used' : '1 left'})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Answer Feedback & Fact Banner */}
        {isAnswered && (
          <div
            className={`rounded-xl border p-4 sm:p-5 space-y-3 ${
              selectedIndex === question.correctIndex
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-rose-50/80 border-rose-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedIndex === question.correctIndex ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
                )}
                <span
                  className={`font-display font-bold text-base ${
                    selectedIndex === question.correctIndex
                      ? 'text-emerald-900'
                      : 'text-rose-900'
                  }`}
                >
                  {selectedIndex === question.correctIndex
                    ? `Correct! +${lastPoints?.totalPoints ?? 0} pts`
                    : isTimeout
                    ? "Time's Up!"
                    : 'Incorrect'}
                </span>
              </div>

              {selectedIndex === question.correctIndex && lastPoints && (
                <div className="text-xs font-medium text-emerald-800 tabular-nums">
                  +{lastPoints.basePoints} base · +{lastPoints.speedBonus} speed
                  {lastPoints.streakBonus > 0
                    ? ` · +${lastPoints.streakBonus} streak`
                    : ''}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 text-sm text-slate-800 leading-relaxed">
              <Lightbulb
                className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p>{question.fact}</p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <span>
                  {isLastQuestion ? 'See Final Results' : 'Next Question'}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
