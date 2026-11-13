import {
  ArrowLeft,
  BookOpen,
  Landmark,
  FlaskConical,
  Globe2,
  ScrollText,
  MapPin,
  Coins,
  Building2,
  Calculator,
  PawPrint,
  Cpu,
  Trophy,
} from 'lucide-react';
import { ComponentType } from 'react';
import { CATEGORY_META } from '../data/questionBank';
import { CATEGORIES, Category } from '../types/quiz';

interface CategoryPickerProps {
  categoryCounts: Record<Category, number>;
  categoryBestScores: Partial<Record<Category, number>>;
  onSelectCategory: (category: Category) => void;
  onBack: () => void;
}

const CATEGORY_ICONS: Record<Category, ComponentType<{ className?: string }>> = {
  'General Knowledge': BookOpen,
  'Money & Finance': Landmark,
  Science: FlaskConical,
  'World & Geography': Globe2,
  History: ScrollText,
  Capitals: MapPin,
  Currencies: Coins,
  Landmarks: Building2,
  Maths: Calculator,
  Animals: PawPrint,
  Technology: Cpu,
  Sports: Trophy,
};

export function CategoryPicker({
  categoryCounts,
  categoryBestScores,
  onSelectCategory,
  onBack,
}: CategoryPickerProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Modes</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Choose a Category
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Each round draws 10 fresh questions from your chosen subject.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category];
          const Icon = CATEGORY_ICONS[category];
          const best = categoryBestScores[category] ?? 0;
          const count = categoryCounts[category] ?? 0;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className="group text-left bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${meta.color} text-white flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {count} questions
                </span>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {category}
                </h2>
                <p className="text-xs text-slate-600 mt-1">{meta.shortDesc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Personal Best</span>
                <span className="font-display font-bold text-slate-900 tabular-nums">
                  {best > 0 ? `${best.toLocaleString()} pts` : 'Not played'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
