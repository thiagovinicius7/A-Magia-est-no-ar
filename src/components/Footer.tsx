import React from 'react';
import { Sparkles, Instagram, ExternalLink, MapPin, Calendar, FolderOpen, Heart, ArrowUp } from 'lucide-react';
import { ShowInfo } from '../types';

interface FooterProps {
  showInfo: ShowInfo;
  onOpenSyncModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ showInfo, onOpenSyncModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-950 border-t border-amber-500/20 pt-12 pb-16 text-slate-400 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Studio & Show info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-theatre text-xl font-bold text-slate-100">
                {showInfo.title}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Espetáculo de sapateado do <strong className="text-amber-200">{showInfo.studioName}</strong>.
              Celebrando a arte do ritmo, da musicalidade e da dança no palco de Brasília.
            </p>
            <div className="pt-2">
              <a
                href={showInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-950/80 to-pink-950/80 text-pink-200 border border-pink-500/30 hover:border-pink-400 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Seguir {showInfo.instagramHandle}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Col 2: Season Dates & Theater */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Temporada & Local
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{showInfo.dates} • às {showInfo.time}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{showInfo.venue} ({showInfo.city})</span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-500 pt-1">
              Classificação Livre • Espetáculo para toda a família e amantes da dança.
            </p>
          </div>

          {/* Col 3: Quick Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Recursos de Direção & Nuvem
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenSyncModal}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                  <span>Google Drive & Backup JSON</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={scrollToTop}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-amber-400" />
                  <span>Voltar ao topo do espetáculo</span>
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Studio Sá Pateia • Sem Fronteiras. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-1">
            <span>Criado com ritmo e</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" />
            <span>para a arte do sapateado</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
