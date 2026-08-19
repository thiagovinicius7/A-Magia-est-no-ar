import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Video, Music, Users, Sparkles, Folder, Bookmark, Info, Check, AlertCircle } from 'lucide-react';
import { Choreography, ActType, DanceLevel, RehearsalStatus, CuePoint } from '../types';
import { parseVideoUrl } from '../utils/driveHelper';

interface ChoreographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreography: Choreography) => void;
  initialData?: Choreography | null;
  existingDancers: string[];
  nextOrderNumber: number;
}

export const ChoreographyModal: React.FC<ChoreographyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingDancers,
  nextOrderNumber,
}) => {
  const [title, setTitle] = useState('');
  const [act, setAct] = useState<ActType>('Ato 1');
  const [level, setLevel] = useState<DanceLevel>('Intermediário');
  const [order, setOrder] = useState<number>(nextOrderNumber);
  const [dancers, setDancers] = useState<string[]>([]);
  const [newDancerInput, setNewDancerInput] = useState('');
  const [choreographer, setChoreographer] = useState('Studio Sá Pateia');
  const [musicTitle, setMusicTitle] = useState('');
  const [artistOrComposer, setArtistOrComposer] = useState('');
  const [duration, setDuration] = useState('03:30');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [costume, setCostume] = useState('');
  const [notes, setNotes] = useState('');
  const [rehearsalStatus, setRehearsalStatus] = useState<RehearsalStatus>('Em Ensaio');
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [newCueTime, setNewCueTime] = useState('');
  const [newCueLabel, setNewCueLabel] = useState('');

  // Reset or populate fields on modal open
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAct(initialData.act);
      setLevel(initialData.level);
      setOrder(initialData.order);
      setDancers(initialData.dancers || []);
      setChoreographer(initialData.choreographer || 'Studio Sá Pateia');
      setMusicTitle(initialData.musicTitle);
      setArtistOrComposer(initialData.artistOrComposer || '');
      setDuration(initialData.duration || '03:30');
      setDriveUrl(initialData.driveUrl || '');
      setDriveFolderUrl(initialData.driveFolderUrl || '');
      setCostume(initialData.costume || '');
      setNotes(initialData.notes || '');
      setRehearsalStatus(initialData.rehearsalStatus || 'Em Ensaio');
      setCuePoints(initialData.cuePoints || []);
    } else {
      setTitle('');
      setAct('Ato 1');
      setLevel('Intermediário');
      setOrder(nextOrderNumber);
      setDancers([]);
      setChoreographer('Studio Sá Pateia');
      setMusicTitle('');
      setArtistOrComposer('');
      setDuration('03:30');
      setDriveUrl('');
      setDriveFolderUrl('');
      setCostume('');
      setNotes('');
      setRehearsalStatus('Em Ensaio');
      setCuePoints([]);
    }
  }, [initialData, nextOrderNumber, isOpen]);

  if (!isOpen) return null;

  const handleAddDancer = (dancerName: string) => {
    const trimmed = dancerName.trim();
    if (trimmed && !dancers.includes(trimmed)) {
      setDancers([...dancers, trimmed]);
      setNewDancerInput('');
    }
  };

  const handleRemoveDancer = (indexToRemove: number) => {
    setDancers(dancers.filter((_, i) => i !== indexToRemove));
  };

  const handleAddCuePoint = () => {
    if (newCueTime.trim() && newCueLabel.trim()) {
      setCuePoints([
        ...cuePoints,
        {
          id: `cp-${Date.now()}`,
          time: newCueTime.trim(),
          label: newCueLabel.trim(),
        },
      ]);
      setNewCueTime('');
      setNewCueLabel('');
    }
  };

  const handleRemoveCuePoint = (id: string) => {
    setCuePoints(cuePoints.filter((cp) => cp.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Choreography = {
      id: initialData ? initialData.id : `ch-${Date.now()}`,
      title: title.trim(),
      act,
      level,
      order: Number(order) || 1,
      dancers,
      choreographer: choreographer.trim() || 'Studio Sá Pateia',
      musicTitle: musicTitle.trim() || 'Trilha Sem Título',
      artistOrComposer: artistOrComposer.trim(),
      duration: duration.trim() || '03:00',
      driveUrl: driveUrl.trim(),
      driveFolderUrl: driveFolderUrl.trim() || undefined,
      costume: costume.trim(),
      notes: notes.trim() || undefined,
      rehearsalStatus,
      cuePoints,
      isFavorite: initialData?.isFavorite || false,
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  const parsedVideo = parseVideoUrl(driveUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-theatre text-xl font-bold text-slate-100">
              {initialData ? 'Editar Coreografia' : 'Nova Coreografia'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Identificação do Número</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Coreografia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O Livro Encantado, Passos no Ar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ordem no Espetáculo
                </label>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-sm text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ato / Bloco</label>
                <select
                  value={act}
                  onChange={(e) => setAct(e.target.value as ActType)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Abertura">Abertura</option>
                  <option value="Ato 1">Ato 1</option>
                  <option value="Ato 2">Ato 2</option>
                  <option value="Gran Finale">Gran Finale</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nível / Turma</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DanceLevel)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Cia Sá Pateia">Cia Sá Pateia</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Geral">Geral (Todos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status de Ensaio</label>
                <select
                  value={rehearsalStatus}
                  onChange={(e) => setRehearsalStatus(e.target.value as RehearsalStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Pronta para Palco">Pronta para Palco</option>
                  <option value="Ajustes Finais">Ajustes Finais</option>
                  <option value="Em Ensaio">Em Ensaio</option>
                  <option value="Filmada">Filmada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Participants / Dancers */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Elenco & Participantes ({dancers.length})</span>
              </label>
              <span className="text-[11px] text-slate-400">Adicione os sapateadores</span>
            </div>

            {/* Input to add new dancer */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do(a) participante e pressione Enter ou clique em +"
                value={newDancerInput}
                onChange={(e) => setNewDancerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDancer(newDancerInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddDancer(newDancerInput)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Existing dancers quick picker pills */}
            {existingDancers.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">Sugestões do elenco atual:</span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {existingDancers
                    .filter((d) => !dancers.includes(d))
                    .slice(0, 15)
                    .map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleAddDancer(d)}
                        className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-800 text-[10px] transition-colors"
                      >
                        + {d}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Active dancers list */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {dancers.map((dancer, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/70 border border-purple-500/40 text-purple-200"
                >
                  <span>{dancer}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDancer(idx)}
                    className="text-purple-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {dancers.length === 0 && (
                <span className="text-xs text-slate-500 italic">Nenhum participante adicionado ainda.</span>
              )}
            </div>
          </div>

          {/* Section 3: Google Drive Video Links */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>Link do Google Drive / Vídeo</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link do Vídeo no Google Drive
              </label>
              <input
                type="url"
                placeholder="Cole o link do Google Drive (ex: https://drive.google.com/file/d/.../view) ou YouTube"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dica: Certifique-se de que o arquivo no Google Drive está com o compartilhamento configurado como{' '}
                <strong className="text-amber-300 font-medium">&ldquo;Qualquer pessoa com o link pode ver&rdquo;</strong>.
              </p>

              {/* URL Status feedback */}
              {driveUrl && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {parsedVideo.isValid ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      Link reconhecido com sucesso ({parsedVideo.type})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Link genérico (será aberto em nova guia se iframe bloquear)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pasta de Ensaios / Fotos no Google Drive (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Music & Technical Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>Música, Figurino e Coreografia</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Música / Trilha</label>
                <input
                  type="text"
                  placeholder="Nome da faixa"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Artista / Compositor</label>
                <input
                  type="text"
                  placeholder="Ex: Duke Ellington"
                  value={artistOrComposer}
                  onChange={(e) => setArtistOrComposer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duração (ex: 03:45)</label>
                <input
                  type="text"
                  placeholder="03:45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coreógrafo(a) / Direção</label>
                <input
                  type="text"
                  value={choreographer}
                  onChange={(e) => setChoreographer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Figurino</label>
                <input
                  type="text"
                  placeholder="Cores, acessórios, sapatos..."
                  value={costume}
                  onChange={(e) => setCostume(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Cênicas, Marcações e Iluminação
              </label>
              <textarea
                rows={2}
                placeholder="Entradas pela coxia, transições, iluminação de palco..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Rehearsal Timestamps / Cue Points */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Timestamps de Marcação / Cue Points</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tempo (ex: 01:20)"
                value={newCueTime}
                onChange={(e) => setNewCueTime(e.target.value)}
                className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
              <input
                type="text"
                placeholder="Descrição (ex: Entrada do Solo de Flaps)"
                value={newCueLabel}
                onChange={(e) => setNewCueLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddCuePoint}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                + Adicionar
              </button>
            </div>

            {/* List of cue points */}
            {cuePoints.map((cp) => (
              <div key={cp.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {cp.time}
                  </span>
                  <span className="text-slate-200">{cp.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCuePoint(cp.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {initialData ? 'Salvar Alterações' : 'Criar Coreografia'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
