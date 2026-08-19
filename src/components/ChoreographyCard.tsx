import React from 'react';
import { Play, Star, Music, Clock, Users, ExternalLink, Edit3, Trash2, Video, Bookmark, Sparkles, Folder } from 'lucide-react';
import { Choreography } from '../types';
import { parseVideoUrl } from '../utils/driveHelper';

interface ChoreographyCardProps {
  choreography: Choreography;
  onPlay: (choreography: Choreography) => void;
  onEdit: (choreography: Choreography) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectDancer: (dancerName: string) => void;
  selectedDancer?: string;
  isAdmin?: boolean;
  onRequireAdmin?: (actionName: string, action: () => void) => void;
}

export const ChoreographyCard: React.FC<ChoreographyCardProps> = ({
  choreography,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectDancer,
  selectedDancer,
  isAdmin = false,
  onRequireAdmin,
}) => {
  const parsed = parseVideoUrl(choreography.driveUrl);

  const handleEditClick = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin(`Editar "${choreography.title}"`, () => onEdit(choreography));
    } else {
      onEdit(choreography);
    }
  };

  const handleDeleteClick = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin(`Excluir "${choreography.title}"`, () => onDelete(choreography.id));
    } else {
      onDelete(choreography.id);
    }
  };

  const getActColor = (act: string) => {
    switch (act) {
      case 'Abertura':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Ato 1':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'Ato 2':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'Gran Finale':
        return 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-200 border-amber-400/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pronta para Palco':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Ajustes Finais':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Em Ensaio':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
      
      {/* Top Banner & Header */}
      <div>
        {/* Top bar with Order and Actions */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            
            {/* Order & Act Pill */}
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 font-cinzel font-bold text-xs border border-amber-500/30">
                #{String(choreography.order).padStart(2, '0')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActColor(choreography.act)}`}>
                {choreography.act}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
                {choreography.level}
              </span>
            </div>

            {/* Quick Actions (Favorite, Edit, Delete) */}
            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleFavorite(choreography.id)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  choreography.isFavorite
                    ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                    : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
                }`}
                title={choreography.isFavorite ? 'Remover dos favoritos' : 'Favoritar coreografia'}
              >
                <Star className={`w-4 h-4 ${choreography.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={handleEditClick}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isAdmin
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
                }`}
                title={isAdmin ? 'Editar coreografia' : 'Editar coreografia (Requer senha de Direção)'}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title={isAdmin ? 'Excluir coreografia' : 'Excluir coreografia (Requer senha de Direção)'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Choreography Title */}
          <h3 className="font-theatre text-xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors line-clamp-1">
            {choreography.title}
          </h3>

          {/* Music and Duration metadata */}
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={choreography.musicTitle}>
              <Music className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span className="truncate">{choreography.musicTitle}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{choreography.duration}</span>
            </div>
          </div>
        </div>

        {/* Video Preview Thumbnail / Stage Viewport */}
        <div
          onClick={() => onPlay(choreography)}
          className="relative mx-4 sm:mx-5 aspect-video rounded-xl bg-slate-950 border border-slate-800 group/thumb overflow-hidden cursor-pointer flex items-center justify-center shadow-inner"
        >
          {/* Subtle stage spotlight background */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-amber-950/20" />
          <div className="absolute inset-0 bg-[radial-gradient(#f5c542_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          {/* Center Play Button with glowing aura */}
          <div className="relative z-10 flex flex-col items-center gap-2 transform group-hover/thumb:scale-110 transition-transform duration-300">
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover/thumb:shadow-amber-500/50">
              <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-200/90 tracking-wide bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Assistir Vídeo
            </span>
          </div>

          {/* Drive status badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/90 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
            <Video className="w-3 h-3 text-blue-400" />
            <span>Google Drive</span>
          </div>

          {/* Cue points badge */}
          {choreography.cuePoints && choreography.cuePoints.length > 0 && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>{choreography.cuePoints.length} marcações</span>
            </div>
          )}
        </div>

        {/* Participants / Dancers List */}
        <div className="p-4 sm:p-5 pt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Elenco / Sapateadores ({choreography.dancers.length})</span>
            </span>
          </div>

          {/* Dancers pills */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {choreography.dancers.map((dancer) => {
              const isSelected = selectedDancer === dancer;
              return (
                <button
                  key={dancer}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDancer(dancer);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500 text-white font-semibold shadow-xs'
                      : 'bg-slate-950/70 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-500/40'
                  }`}
                  title={`Filtrar todas as coreografias de ${dancer}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{dancer}</span>
                </button>
              );
            })}
          </div>

          {/* Costume note snippet */}
          {choreography.costume && (
            <div className="text-xs text-slate-400 line-clamp-1 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
              <strong className="text-slate-300 font-medium">Figurino:</strong> {choreography.costume}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with Status & Direct Drive Action */}
      <div className="px-4 sm:px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Status Pill */}
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(choreography.rehearsalStatus)}`}>
          {choreography.rehearsalStatus}
        </span>

        {/* Direct Drive link / Folder Link */}
        <div className="flex items-center gap-2">
          {choreography.driveFolderUrl && (
            <a
              href={choreography.driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 hover:underline p-1"
              title="Abrir pasta de ensaios no Google Drive"
            >
              <Folder className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">Pasta</span>
            </a>
          )}

          {parsed.directUrl && (
            <a
              href={parsed.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-blue-200 hover:underline p-1"
              title="Abrir diretamente no Google Drive"
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>Abrir no Drive</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
