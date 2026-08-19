import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, Video, Sparkles, Music, Shield, Play } from 'lucide-react';
import { Choreography, RehearsalStatus } from '../types';

interface RehearsalChecklistViewProps {
  choreographies: Choreography[];
  onUpdateStatus: (id: string, newStatus: RehearsalStatus) => void;
  onPlayChoreography: (ch: Choreography) => void;
  isAdmin?: boolean;
  onRequireAdmin?: (actionName: string, action: () => void) => void;
}

export const RehearsalChecklistView: React.FC<RehearsalChecklistViewProps> = ({
  choreographies,
  onUpdateStatus,
  onPlayChoreography,
  isAdmin = false,
  onRequireAdmin,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const handleStatusChange = (id: string, newStatus: RehearsalStatus, choreoTitle: string) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin(`Alterar status de "${choreoTitle}" para ${newStatus}`, () => {
        onUpdateStatus(id, newStatus);
      });
    } else {
      onUpdateStatus(id, newStatus);
    }
  };

  const readyCount = choreographies.filter((c) => c.rehearsalStatus === 'Pronta para Palco').length;
  const adjustingCount = choreographies.filter((c) => c.rehearsalStatus === 'Ajustes Finais').length;
  const rehearsalCount = choreographies.filter((c) => c.rehearsalStatus === 'Em Ensaio').length;

  const filtered = choreographies.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.rehearsalStatus === filterStatus;
  });

  const getStatusColor = (status: RehearsalStatus) => {
    switch (status) {
      case 'Pronta para Palco':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
      case 'Ajustes Finais':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      case 'Em Ensaio':
        return 'border-blue-500/40 bg-blue-950/20 text-blue-300';
      default:
        return 'border-slate-800 bg-slate-900 text-slate-300';
    }
  };

  const progressPercentage = Math.round((readyCount / Math.max(choreographies.length, 1)) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Top Readiness Progress Bar */}
      <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-cinzel text-amber-300 tracking-wider uppercase mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Painel de Produção & Ensaios</span>
            </div>
            <h2 className="font-theatre text-2xl font-bold text-slate-100">
              Montagem das coreografias do espetáculo
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-400">{progressPercentage}%</span>
            <span className="text-xs text-slate-400 block font-medium">Coreografias Prontas</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
          <div
            style={{ width: `${(readyCount / choreographies.length) * 100}%` }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-500"
            title={`${readyCount} Prontas para Palco`}
          />
          <div
            style={{ width: `${(adjustingCount / choreographies.length) * 100}%` }}
            className="bg-amber-400 h-full transition-all duration-500"
            title={`${adjustingCount} em Ajustes Finais`}
          />
          <div
            style={{ width: `${(rehearsalCount / choreographies.length) * 100}%` }}
            className="bg-blue-500 h-full transition-all duration-500"
            title={`${rehearsalCount} em Ensaio`}
          />
        </div>

        {/* Status Counters & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            Todas ({choreographies.length})
          </button>

          <button
            onClick={() => setFilterStatus('Pronta para Palco')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'Pronta para Palco'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            ✓ Prontas ({readyCount})
          </button>

          <button
            onClick={() => setFilterStatus('Ajustes Finais')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'Ajustes Finais'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-950 text-amber-300 border border-amber-500/30'
            }`}
          >
            ⚙ Ajustes Finais ({adjustingCount})
          </button>

          <button
            onClick={() => setFilterStatus('Em Ensaio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'Em Ensaio'
                ? 'bg-blue-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-blue-300 border border-blue-500/30'
            }`}
          >
            ⌛ Em Ensaio ({rehearsalCount})
          </button>
        </div>
      </div>

      {/* Checklist Cards */}
      {choreographies.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-300">Nenhuma coreografia cadastrada para acompanhamento de ensaios.</p>
          <p className="text-xs text-slate-500">Adicione as coreografias para gerenciar o status de montagem de cada número.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ch) => (
            <div
              key={ch.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xs font-bold text-amber-400">
                    #{String(ch.order).padStart(2, '0')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {ch.act}
                  </span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${getStatusColor(ch.rehearsalStatus)}`}>
                    {ch.rehearsalStatus}
                  </span>
                </div>

                <h3 className="font-theatre text-lg font-bold text-slate-100">{ch.title}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>{ch.dancers.length} sapateadores</span>
                  <span>•</span>
                  <span className="truncate max-w-xs">{ch.musicTitle}</span>
                </div>
              </div>

              {/* Right: Quick Status Switcher & Video action */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['Em Ensaio', 'Ajustes Finais', 'Pronta para Palco'] as RehearsalStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(ch.id, st, ch.title)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        ch.rehearsalStatus === st
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={isAdmin ? `Mudar status para ${st}` : `Requer senha de Direção para alterar`}
                    >
                      {st === 'Pronta para Palco' ? 'Pronta' : st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onPlayChoreography(ch)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
                  title="Assistir vídeo do ensaio"
                >
                  <Play className="w-4 h-4 fill-amber-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
