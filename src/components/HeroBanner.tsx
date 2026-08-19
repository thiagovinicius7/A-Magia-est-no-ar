import React from 'react';
import { Search, Sparkles, Star, Clock, Users, Video, X, Layers } from 'lucide-react';
import { ActType, DanceLevel, ShowInfo } from '../types';

interface HeroBannerProps {
  showInfo: ShowInfo;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAct: string;
  onSelectAct: (act: string) => void;
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  selectedDancer: string;
  onSelectDancer: (dancer: string) => void;
  allDancers: string[];
  totalChoreographies: number;
  totalDancers: number;
  totalDurationMin: number;
  driveVideosCount: number;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  showInfo,
  searchTerm,
  onSearchChange,
  selectedAct,
  onSelectAct,
  selectedLevel,
  onSelectLevel,
  selectedDancer,
  onSelectDancer,
  allDancers,
  totalChoreographies,
  totalDancers,
  totalDurationMin,
  driveVideosCount,
  showOnlyFavorites,
  onToggleFavorites,
}) => {
  const acts: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'Todos os Atos' },
    { key: 'Abertura', label: 'Abertura' },
    { key: 'Ato 1', label: 'Ato 1' },
    { key: 'Ato 2', label: 'Ato 2' },
    { key: 'Gran Finale', label: 'Gran Finale' },
  ];

  const levels: DanceLevel[] = [
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Cia Sá Pateia',
    'Infantil',
    'Geral',
  ];

  const hasActiveFilters = searchTerm || selectedAct !== 'ALL' || selectedLevel !== 'ALL' || selectedDancer !== 'ALL' || showOnlyFavorites;

  const clearFilters = () => {
    onSearchChange('');
    onSelectAct('ALL');
    onSelectLevel('ALL');
    onSelectDancer('ALL');
    if (showOnlyFavorites) onToggleFavorites();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-amber-500/20 pt-6 pb-8">
      {/* Subtle stage lighting background */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Date & Location Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{showInfo.dates} • {showInfo.time} • {showInfo.venue}</span>
          </div>
        </div>

        {/* Theatrical Headline */}
        <div className="max-w-3xl">
          <div className="font-cinzel text-xs tracking-widest text-amber-400 uppercase font-semibold mb-1">
            Studio Sá Pateia Sem Fronteiras
          </div>
          <h2 className="font-theatre text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 drop-shadow-sm">
            {showInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 leading-relaxed">
            Painel oficial do espetáculo: vídeos de ensaio, ordem de palco, minutagem e marcações cênicas.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Coreografias</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">{totalChoreographies}</div>
            <div className="text-[11px] text-slate-400 font-medium">No roteiro</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Elenco</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">{totalDancers}</div>
            <div className="text-[11px] text-slate-400 font-medium">Sapateadores</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Duração Total</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">{totalDurationMin} min</div>
            <div className="text-[11px] text-slate-400 font-medium">Estimada</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Vídeos Drive</span>
              <Video className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">{driveVideosCount}</div>
            <div className="text-[11px] text-slate-400 font-medium">Vinculados</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
            <input
              type="text"
              placeholder="Buscar por coreografia, dançarino(a), música ou figurino..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-amber-400 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {acts.map((act) => (
                <button
                  key={act.key}
                  onClick={() => onSelectAct(act.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedAct === act.key
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Level & Dancer Dropdowns and Favorites */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => onSelectLevel(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Todos os Níveis</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>

              {allDancers.length > 0 && (
                <select
                  value={selectedDancer}
                  onChange={(e) => onSelectDancer(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-400 max-w-[140px]"
                >
                  <option value="ALL">Todo o Elenco</option>
                  {allDancers.map((dancer) => (
                    <option key={dancer} value={dancer}>
                      {dancer}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={onToggleFavorites}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  showOnlyFavorites
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Favoritas</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
