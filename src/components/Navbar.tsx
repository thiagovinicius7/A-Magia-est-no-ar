import React from 'react';
import { Sparkles, Video, Users, ListOrdered, Plus, FolderSync, Instagram, ExternalLink, ShieldCheck, Lock, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShowInfo, ViewMode } from '../types';

interface NavbarProps {
  showInfo: ShowInfo;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenNewModal: () => void;
  onOpenSyncModal: () => void;
  onOpenCastModal: () => void;
  onOpenAdminModal: () => void;
  isAdmin: boolean;
  choreographiesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  showInfo,
  currentView,
  onViewChange,
  onOpenNewModal,
  onOpenSyncModal,
  onOpenCastModal,
  onOpenAdminModal,
  isAdmin,
  choreographiesCount,
}) => {
  const triggerMagicConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#F5C542', '#E5A93C', '#FFF3C4', '#8A2BE2', '#FFFFFF'],
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={triggerMagicConfetti}
              className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-md shrink-0"
              title="Studio Sá Pateia"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-theatre text-lg sm:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 truncate">
                  {showInfo.title}
                </h1>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                {showInfo.studioName} • {showInfo.dates}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => onViewChange('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vídeos ({choreographiesCount})</span>
            </button>

            <button
              onClick={() => onViewChange('lineup')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'lineup'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Ordem de Palco</span>
            </button>

            <button
              onClick={() => onViewChange('stageManager')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'stageManager'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Montagem do Espetáculo</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Drive & Backup Sync (Single Entry Point) */}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer"
              title="Google Drive, Importar em Lote e Backup"
            >
              <FolderSync className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>

            {/* Cast Directory */}
            <button
              onClick={onOpenCastModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/40 transition-colors cursor-pointer"
              title="Elenco de Sapateadores"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Elenco</span>
            </button>

            {/* Admin Lock/Unlock Status */}
            <button
              onClick={onOpenAdminModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
              }`}
              title={isAdmin ? 'Modo Direção Ativo' : 'Clique para entrar com a senha da Direção'}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Direção</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Acesso</span>
                </>
              )}
            </button>

            {/* Add Choreography Primary Button */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nova Coreografia</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>

        {/* Mobile View Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 gap-1 text-xs">
          <button
            onClick={() => onViewChange('grid')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors ${
              currentView === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vídeos ({choreographiesCount})
          </button>
          <button
            onClick={() => onViewChange('lineup')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors ${
              currentView === 'lineup' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ordem de Palco
          </button>
          <button
            onClick={() => onViewChange('stageManager')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors ${
              currentView === 'stageManager' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Montagem
          </button>
        </div>
      </div>
    </header>
  );
};
