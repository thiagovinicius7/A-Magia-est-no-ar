import React from 'react';
import { Play, Clock, Users, AlertTriangle, Printer, Sparkles, ExternalLink, Music, CheckCircle2 } from 'lucide-react';
import { Choreography, ShowInfo } from '../types';

interface StageOrderViewProps {
  choreographies: Choreography[];
  showInfo: ShowInfo;
  onPlayChoreography: (ch: Choreography) => void;
  onSelectDancer: (dancer: string) => void;
}

export const StageOrderView: React.FC<StageOrderViewProps> = ({
  choreographies,
  showInfo,
  onPlayChoreography,
  onSelectDancer,
}) => {
  // Sort choreographies strictly by order
  const sorted = [...choreographies].sort((a, b) => a.order - b.order);

  // Group by acts
  const actsOrder = ['Abertura', 'Ato 1', 'Ato 2', 'Gran Finale', 'Extra'];
  
  // Calculate running times assuming 20:00 start
  let currentMinutesFromStart = 0;
  const startHour = 20;
  const startMinute = 0;

  const parseMinutes = (durationStr: string) => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
    return 3.5;
  };

  const formatClockTime = (totalMin: number) => {
    const totalMinutes = startMinute + totalMin;
    const hour = startHour + Math.floor(totalMinutes / 60);
    const minute = Math.floor(totalMinutes % 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Detect quick costume changes: dancers that appear in choreography N and N+1
  const getQuickChanges = (currentIdx: number) => {
    if (currentIdx === 0) return [];
    const prevCh = sorted[currentIdx - 1];
    const currentCh = sorted[currentIdx];

    const prevDancers = new Set(prevCh.dancers || []);
    const overlap = (currentCh.dancers || []).filter((d) => prevDancers.has(d));
    return overlap;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl border border-amber-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-cinzel tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roteiro Oficial de Palco • {showInfo.dates} • {showInfo.time}</span>
          </div>
          <h2 className="font-theatre text-2xl sm:text-3xl font-bold text-slate-100">
            Ordem de Entrada & Cronograma
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {showInfo.venue} • {sorted.length} apresentações ordenadas para a montagem do espetáculo, iluminação e camarim.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-md"
          title="Imprimir roteiro para o camarim"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimir Roteiro</span>
        </button>
      </div>

      {/* Timeline of Choreographies */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-300">Nenhuma coreografia cadastrada na ordem de palco.</p>
          <p className="text-xs text-slate-500">Adicione números ao espetáculo para visualizar o cronograma.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((ch, idx) => {
          const quickChanges = getQuickChanges(idx);
          const chMin = parseMinutes(ch.duration);
          const estimatedClock = formatClockTime(currentMinutesFromStart);
          currentMinutesFromStart += chMin + 0.5; // add 30s transition

          const isActBreak = idx > 0 && sorted[idx - 1].act === 'Ato 1' && ch.act === 'Ato 2';

          return (
            <React.Fragment key={ch.id}>
              
              {/* Intermission banner if transitioning between Act 1 and Act 2 */}
              {isActBreak && (
                <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-amber-500/20 border border-amber-500/40 text-center flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                  <span className="font-theatre font-bold text-amber-200 text-sm tracking-wide uppercase">
                    • Intervalo / Intermissão (15 minutos) •
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
                </div>
              )}

              {/* Choreography Row Card */}
              <div className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Time & Order Badge */}
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/40 shrink-0">
                    <span className="font-cinzel text-xs font-bold text-amber-300">
                      #{String(ch.order).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{estimatedClock}</span>
                  </div>

                  {/* Title and details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {ch.act}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {ch.level}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {ch.duration}
                      </span>
                    </div>

                    <h3 className="font-theatre text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                      {ch.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Music className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="truncate max-w-xs">{ch.musicTitle}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{ch.choreographer}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Dancers & Quick Actions */}
                <div className="flex flex-col sm:items-end justify-between gap-2.5">
                  
                  {/* Dancers snippet */}
                  <div className="flex flex-wrap sm:justify-end gap-1 max-w-sm">
                    {ch.dancers.slice(0, 5).map((dancer) => (
                      <button
                        key={dancer}
                        onClick={() => onSelectDancer(dancer)}
                        className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-800 text-[11px] transition-colors cursor-pointer"
                        title={`Filtrar ${dancer}`}
                      >
                        {dancer}
                      </button>
                    ))}
                    {ch.dancers.length > 5 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                        +{ch.dancers.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Quick Change Alert */}
                  {quickChanges.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Troca rápida de figurino:{' '}
                        <strong>{quickChanges.join(', ')}</strong>
                      </span>
                    </div>
                  )}

                  {/* Play Video Button */}
                  <button
                    onClick={() => onPlayChoreography(ch)}
                    className="self-start sm:self-end flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Ver Vídeo</span>
                  </button>

                </div>

              </div>
            </React.Fragment>
          );
        })}
      </div>
      )}

    </div>
  );
};
