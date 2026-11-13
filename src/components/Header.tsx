import { Volume2, VolumeX, ArrowLeft, Trophy } from 'lucide-react';

interface HeaderProps {
  canGoHome: boolean;
  isInGame: boolean;
  onGoHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function Header({
  canGoHome,
  isInGame,
  onGoHome,
  soundEnabled,
  onToggleSound,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onGoHome}
          disabled={!canGoHome}
          className={`flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            canGoHome ? 'cursor-pointer hover:opacity-85 transition-opacity' : 'cursor-default'
          }`}
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Daily Quiz Arena
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {canGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{isInGame ? 'Quit Quiz' : 'Home'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
