import { useMemo, useState } from 'react';
import { CategoryPicker } from './components/CategoryPicker';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import {
  QUESTION_BANK,
  getCategoryCounts,
  getCategoryQuestions,
  getDailyQuestions,
  getQuickPlayQuestions,
  getStreakDeck,
} from './data/questionBank';
import {
  BestScores,
  Category,
  GameMode,
  GameSummary,
  QuestionResult,
  QuizQuestion,
} from './types/quiz';
import { setSoundEnabledState } from './utils/sound';
import {
  getTodayDateKey,
  loadBestScores,
  loadSoundEnabled,
  recordGameScore,
  saveSoundEnabled,
} from './utils/storage';

type ScreenState = 'HOME' | 'CATEGORY_PICK' | 'PLAYING' | 'RESULTS';

interface ActiveSession {
  runId: number;
  mode: GameMode;
  category?: Category;
  dateKey?: string;
  questions: QuizQuestion[];
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [scores, setScores] = useState<BestScores>(() => loadBestScores());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const initial = loadSoundEnabled();
    setSoundEnabledState(initial);
    return initial;
  });
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [summary, setSummary] = useState<GameSummary | null>(null);

  const todayKey = getTodayDateKey();
  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundEnabledState(next);
    saveSoundEnabled(next);
  };

  const startDaily = () => {
    const currentDateKey = getTodayDateKey();
    setSession({
      runId: Date.now(),
      mode: 'daily',
      dateKey: currentDateKey,
      questions: getDailyQuestions(currentDateKey, 10),
    });
    setSummary(null);
    setScreen('PLAYING');
  };

  const startQuick = () => {
    setSession({
      runId: Date.now(),
      mode: 'quick',
      questions: getQuickPlayQuestions(10),
    });
    setSummary(null);
    setScreen('PLAYING');
  };

  const startStreak = () => {
    setSession({
      runId: Date.now(),
      mode: 'streak',
      questions: getStreakDeck(),
    });
    setSummary(null);
    setScreen('PLAYING');
  };

  const startCategory = (category: Category) => {
    setSession({
      runId: Date.now(),
      mode: 'category',
      category,
      questions: getCategoryQuestions(category, 10),
    });
    setSummary(null);
    setScreen('PLAYING');
  };

  const handleGameComplete = (payload: {
    results: QuestionResult[];
    totalScore: number;
    correctCount: number;
    maxStreak: number;
  }) => {
    if (!session) return;

    const { updated, isNewBest } = recordGameScore({
      mode: session.mode,
      category: session.category,
      score: payload.totalScore,
      correctCount: payload.correctCount,
    });

    setScores(updated);
    setSummary({
      mode: session.mode,
      category: session.category,
      dateKey: session.dateKey,
      totalScore: payload.totalScore,
      correctCount: payload.correctCount,
      answeredCount: payload.results.length,
      maxStreak: payload.maxStreak,
      results: payload.results,
      isNewBest,
    });
    setScreen('RESULTS');
  };

  const handlePlayAgain = () => {
    if (!session) {
      setScreen('HOME');
      return;
    }
    if (session.mode === 'daily') startDaily();
    else if (session.mode === 'quick') startQuick();
    else if (session.mode === 'streak') startStreak();
    else if (session.mode === 'category' && session.category) {
      startCategory(session.category);
    }
  };

  const handleGoHome = () => {
    setSession(null);
    setSummary(null);
    setScreen('HOME');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        canGoHome={screen !== 'HOME'}
        isInGame={screen === 'PLAYING'}
        onGoHome={handleGoHome}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <div className="flex-1">
        {screen === 'HOME' && (
          <HomeScreen
            todayKey={todayKey}
            totalQuestions={QUESTION_BANK.length}
            scores={scores}
            onStartDaily={startDaily}
            onStartQuick={startQuick}
            onStartStreak={startStreak}
            onOpenCategories={() => setScreen('CATEGORY_PICK')}
          />
        )}

        {screen === 'CATEGORY_PICK' && (
          <CategoryPicker
            categoryCounts={categoryCounts}
            categoryBestScores={scores.categoryBestScores}
            onSelectCategory={startCategory}
            onBack={handleGoHome}
          />
        )}

        {screen === 'PLAYING' && session && (
          <QuizScreen
            key={session.runId}
            mode={session.mode}
            category={session.category}
            questions={session.questions}
            onComplete={handleGameComplete}
          />
        )}

        {screen === 'RESULTS' && summary && (
          <ResultsScreen
            summary={summary}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        Daily Quiz Arena · {QUESTION_BANK.length} built-in trivia questions · Scores saved locally in your browser
      </footer>
    </div>
  );
}
