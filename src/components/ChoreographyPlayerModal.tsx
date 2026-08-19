import React, { useState } from 'react';
import { X, ExternalLink, Download, ChevronLeft, ChevronRight, Bookmark, Music, Users, Sparkles, Folder, CheckCircle, Info, Maximize2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Choreography } from '../types';
import { parseVideoUrl } from '../utils/driveHelper';

interface ChoreographyPlayerModalProps {
  choreography: Choreography;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onSelectDancer: (dancer: string) => void;
  onUpdateStatus?: (id: string, newStatus: Choreography['rehearsalStatus']) => void;
}

export const ChoreographyPlayerModal: React.FC<ChoreographyPlayerModalProps> = ({
  choreography,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onSelectDancer,
  onUpdateStatus,
}) => {
  const [activeCuePointId, setActiveCuePointId] = useState<string | null>(null);
  const parsed = parseVideoUrl(choreography.driveUrl);

  const triggerBravo = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#F5C542', '#FFD700', '#FFA500', '#9370DB', '#FFFFFF'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 font-cinzel font-bold text-xs border border-amber-500/30">
              #{String(choreography.order).padStart(2, '0')}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{choreography.act}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{choreography.level}</span>
              </div>
              <h2 className="font-theatre text-lg sm:text-xl font-bold text-slate-100 line-clamp-1">
                {choreography.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Bravo button */}
            <button
              onClick={triggerBravo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-200 border border-amber-500/40 transition-all cursor-pointer shadow-xs"
              title="Palmas e aplausos para a coreografia!"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline">Bravo!</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Theater Arena */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Video Frame */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {parsed.isValid ? (
              <iframe
                src={parsed.embedUrl}
                title={choreography.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                <AlertCircle className="w-12 h-12 text-amber-400/80 mb-3" />
                <h4 className="font-theatre text-lg font-bold text-slate-200 mb-1">Vídeo do Google Drive Não Configurado</h4>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Insira o link de compartilhamento do Google Drive desta coreografia (definido como &ldquo;Qualquer pessoa com o link pode ver&rdquo;).
                </p>
                {choreography.driveUrl && (
                  <a
                    href={choreography.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Tentar abrir link original</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Player Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            
            {/* Prev / Next choreo controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Google Drive Actions */}
            <div className="flex items-center gap-2">
              {choreography.driveFolderUrl && (
                <a
                  href={choreography.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 transition-colors"
                  title="Abrir pasta de ensaios e fotos no Drive"
                >
                  <Folder className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pasta de Ensaios</span>
                </a>
              )}

              {parsed.directUrl && (
                <a
                  href={parsed.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Abrir no Google Drive</span>
                </a>
              )}
            </div>

          </div>

          {/* Details Grid (Cast, Music, Cue Points, Notes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Column 1 & 2: Cast & Rehearsal Cue Points */}
            <div className="md:col-span-2 space-y-5">
              
              {/* Cast / Dancers section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Elenco & Participantes ({choreography.dancers.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Clique para filtrar</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {choreography.dancers.map((dancer) => (
                    <button
                      key={dancer}
                      onClick={() => {
                        onSelectDancer(dancer);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-purple-950/80 text-slate-200 hover:text-purple-200 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-xs"
                      title={`Ver todas as coreografias de ${dancer}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{dancer}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rehearsal Cue Points / Timestamps */}
              {choreography.cuePoints && choreography.cuePoints.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Marcações de Palco & Timestamps de Ensaio</span>
                  </h3>

                  <div className="space-y-2">
                    {choreography.cuePoints.map((cp) => {
                      const isActive = activeCuePointId === cp.id;
                      return (
                        <div
                          key={cp.id}
                          onClick={() => setActiveCuePointId(isActive ? null : cp.id)}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${
                            isActive
                              ? 'bg-amber-500/15 border-amber-400 text-amber-100'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] shrink-0 border border-amber-500/30">
                            {cp.time}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-100">{cp.label}</div>
                            {cp.notes && <div className="text-[11px] text-slate-400 mt-0.5">{cp.notes}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stage Notes / Iluminação */}
              {choreography.notes && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Observações Cênicas, Áudio & Iluminação</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    {choreography.notes}
                  </p>
                </div>
              )}

            </div>

            {/* Column 3: Technical Rider & Costume */}
            <div className="space-y-5">
              
              {/* Music & Choreographer Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Ficha Técnica</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Música:</span>
                    <strong className="text-slate-200 font-semibold">{choreography.musicTitle}</strong>
                    {choreography.artistOrComposer && (
                      <span className="text-slate-400 block text-[11px]">{choreography.artistOrComposer}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Duração:</span>
                    <strong className="text-slate-200 font-semibold">{choreography.duration}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Coreografia / Direção:</span>
                    <strong className="text-amber-200 font-semibold">{choreography.choreographer}</strong>
                  </div>

                  {/* Status changer */}
                  {onUpdateStatus && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 text-[11px] block mb-1.5">Status do Ensaio:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['Pronta para Palco', 'Ajustes Finais', 'Em Ensaio'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => onUpdateStatus(choreography.id, st)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer border ${
                              choreography.rehearsalStatus === st
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Costume / Figurino Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Figurino do Espetáculo</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {choreography.costume || 'Sem descrição de figurino informada.'}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
