import React, { useState } from 'react';
import { X, Users, Search, Play, Award, Film, Download, Check } from 'lucide-react';
import { Choreography } from '../types';

interface CastDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  choreographies: Choreography[];
  onSelectDancerAndFilter: (dancerName: string) => void;
  onPlayChoreography: (choreography: Choreography) => void;
}

export const CastDirectoryModal: React.FC<CastDirectoryModalProps> = ({
  isOpen,
  onClose,
  choreographies,
  onSelectDancerAndFilter,
  onPlayChoreography,
}) => {
  const [searchDancer, setSearchDancer] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build map of dancer -> choreographies
  const dancerMap = new Map<string, Choreography[]>();
  choreographies.forEach((ch) => {
    (ch.dancers || []).forEach((dancer) => {
      const trimmed = dancer.trim();
      if (!trimmed) return;
      if (!dancerMap.has(trimmed)) {
        dancerMap.set(trimmed, []);
      }
      dancerMap.get(trimmed)!.push(ch);
    });
  });

  const sortedDancers = Array.from(dancerMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], 'pt-BR')
  );

  const filteredDancers = sortedDancers.filter(([name]) =>
    name.toLowerCase().includes(searchDancer.toLowerCase())
  );

  const copyCastList = () => {
    const text = sortedDancers
      .map(([name, dances]) => `${name} (${dances.length} coreografias): ${dances.map((d) => d.title).join(', ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-theatre text-xl font-bold text-slate-100">
                Elenco • A Magia está no Ar
              </h2>
              <p className="text-xs text-slate-400">
                {sortedDancers.length} sapateadores participantes no Studio Sá Pateia Sem Fronteiras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCastList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Copiar lista completa do elenco"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copiado!' : 'Copiar Elenco'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 pb-2 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Buscar sapateador(a) pelo nome..."
              value={searchDancer}
              onChange={(e) => setSearchDancer(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dancers Directory List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-800/80">
          {filteredDancers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhum sapateador encontrado para &ldquo;{searchDancer}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDancers.map(([name, dances]) => (
                <div
                  key={name}
                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30 shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 font-theatre">
                          {name}
                        </h4>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                        {dances.length} {dances.length === 1 ? 'coreografia' : 'coreografias'}
                      </span>
                    </div>

                    {/* Choreography pills for this dancer */}
                    <div className="space-y-1.5 mt-3">
                      {dances.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 group"
                        >
                          <div className="flex items-center gap-1.5 truncate mr-2">
                            <span className="text-[10px] font-mono text-amber-400 font-bold">#{d.order}</span>
                            <span className="text-slate-200 group-hover:text-amber-200 truncate">{d.title}</span>
                            <span className="text-[10px] text-slate-500">({d.act})</span>
                          </div>

                          <button
                            onClick={() => {
                              onPlayChoreography(d);
                              onClose();
                            }}
                            className="p-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shrink-0 transition-colors"
                            title="Assistir esta coreografia"
                          >
                            <Play className="w-3 h-3 fill-amber-300" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filter by this dancer button */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onSelectDancerAndFilter(name);
                        onClose();
                      }}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 border border-purple-500/20 transition-colors cursor-pointer text-center"
                    >
                      Filtrar painel apenas para {name} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
