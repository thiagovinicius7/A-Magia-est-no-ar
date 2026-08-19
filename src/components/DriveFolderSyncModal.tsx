import React, { useState } from 'react';
import { X, FolderOpen, ExternalLink, Download, Upload, RefreshCw, Check, Sparkles, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { Choreography, ShowInfo } from '../types';
import { parseBatchChoreographies } from '../utils/driveHelper';

interface DriveFolderSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  showInfo: ShowInfo;
  onUpdateShowInfo: (info: ShowInfo) => void;
  choreographies: Choreography[];
  onImportChoreographies: (newChoreographies: Choreography[]) => void;
  onResetToDefault: () => void;
  isAdmin?: boolean;
  onRequireAdmin?: (actionName: string, action: () => void) => void;
}

export const DriveFolderSyncModal: React.FC<DriveFolderSyncModalProps> = ({
  isOpen,
  onClose,
  showInfo,
  onUpdateShowInfo,
  choreographies,
  onImportChoreographies,
  onResetToDefault,
  isAdmin = false,
  onRequireAdmin,
}) => {
  const [masterFolderUrl, setMasterFolderUrl] = useState(showInfo.masterDriveFolderUrl);
  const [batchText, setBatchText] = useState('');
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'folder' | 'batch' | 'backup' | 'guide'>('folder');

  if (!isOpen) return null;

  const handleSaveMasterFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin('Salvar pasta master do Google Drive', () => {
        onUpdateShowInfo({
          ...showInfo,
          masterDriveFolderUrl: masterFolderUrl.trim(),
        });
      });
      return;
    }
    onUpdateShowInfo({
      ...showInfo,
      masterDriveFolderUrl: masterFolderUrl.trim(),
    });
  };

  const handleBatchImport = () => {
    if (!batchText.trim()) return;

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin('Importar coreografias em lote', () => {
        executeBatchImport();
      });
      return;
    }
    executeBatchImport();
  };

  const executeBatchImport = () => {
    const parsedItems = parseBatchChoreographies(batchText);
    if (parsedItems.length === 0) {
      alert('Nenhuma coreografia reconhecida. Verifique o formato do texto.');
      return;
    }

    const created: Choreography[] = parsedItems.map((item, idx) => ({
      id: `ch-batch-${Date.now()}-${idx}`,
      order: item.order || choreographies.length + idx + 1,
      title: item.title,
      act: (item.act as any) || 'Ato 1',
      level: 'Intermediário',
      dancers: item.dancers.length > 0 ? item.dancers : ['Elenco Sá Pateia'],
      choreographer: 'Studio Sá Pateia',
      musicTitle: 'Trilha do Espetáculo',
      duration: '03:30',
      driveUrl: item.driveUrl || '',
      costume: 'Figurino padrão Sá Pateia',
      rehearsalStatus: 'Em Ensaio',
      isFavorite: false,
    }));

    onImportChoreographies([...choreographies, ...created]);
    setBatchText('');
    alert(`${created.length} coreografias importadas com sucesso!`);
    onClose();
  };

  const handleExportJSON = () => {
    const exportData = {
      showInfo,
      choreographies,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `A_Magia_Esta_No_Ar_Sapateia_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin('Restaurar backup JSON do espetáculo', () => {
        readAndApplyJSON(file);
      });
      return;
    }
    readAndApplyJSON(file);
  };

  const readAndApplyJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.choreographies && Array.isArray(json.choreographies)) {
          if (json.showInfo) {
            onUpdateShowInfo(json.showInfo);
          }
          onImportChoreographies(json.choreographies);
          alert('Dados do espetáculo importados com sucesso!');
          onClose();
        } else {
          alert('Arquivo JSON inválido. Formato não compatível.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-theatre text-xl font-bold text-slate-100">
                Integração com Google Drive
              </h2>
              <p className="text-xs text-slate-400">
                Central de vídeos, pastas na nuvem e importação em lote
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('folder')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'folder'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pasta Master do Espetáculo
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importar Vários Links em Lote
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Guia de Compartilhamento
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Exportação
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab 1: Master Folder */}
          {activeTab === 'folder' && (
            <div className="space-y-5">
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-blue-200 mb-1 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                  <span>Pasta Geral no Google Drive</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Coloque todos os vídeos das coreografias em uma pasta principal do Google Drive.
                  Ao cadastrar o link abaixo, todo o elenco e a equipe técnica poderão acessar o diretório master de vídeos com um clique.
                </p>

                <form onSubmit={handleSaveMasterFolder} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    URL da Pasta no Google Drive
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={masterFolderUrl}
                      onChange={(e) => setMasterFolderUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </form>

                {showInfo.masterDriveFolderUrl && (
                  <div className="mt-4 pt-3 border-t border-blue-500/20 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pasta conectada atualmente:</span>
                    <a
                      href={showInfo.masterDriveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:text-blue-200 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Pasta no Google Drive</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Batch Text Importer */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-amber-200 mb-1">
                  Importação Rápida de Coreografias e Links
                </h3>
                <p className="text-xs text-slate-400">
                  Cole uma lista de coreografias com os participantes e links do Google Drive (uma por linha).
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
                <div className="text-amber-400 font-sans font-semibold">Exemplos de formato aceito:</div>
                <div>1. O Livro Encantado | Dancers: Thiago, Marina, Camila | https://drive.google.com/file/d/abc/view</div>
                <div>Castelo nas Nuvens - Sofia, Beatriz, Alice - https://drive.google.com/file/d/xyz/view</div>
              </div>

              <textarea
                rows={7}
                placeholder="Cole as linhas aqui..."
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-mono"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleBatchImport}
                  disabled={!batchText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Processar e Adicionar</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Como liberar os vídeos do Google Drive para reprodução:</span>
                </h4>
                
                <ol className="space-y-2.5 list-decimal list-inside text-slate-300">
                  <li className="leading-relaxed">
                    <strong className="text-slate-100">Abra o Google Drive</strong> no navegador ou celular e localize o vídeo gravado do ensaio ou apresentação.
                  </li>
                  <li className="leading-relaxed">
                    Clique com o botão direito no vídeo (ou toque nos três pontinhos no celular) e selecione <strong className="text-amber-200">Compartilhar &gt; Compartilhar</strong>.
                  </li>
                  <li className="leading-relaxed">
                    Em &ldquo;Acesso geral&rdquo;, altere de <em>Restrito</em> para <strong className="text-emerald-300">&ldquo;Qualquer pessoa com o link&rdquo;</strong> (função Leitor).
                  </li>
                  <li className="leading-relaxed">
                    Clique em <strong className="text-slate-100">&ldquo;Copiar link&rdquo;</strong> e cole diretamente no campo de vídeo da coreografia aqui no aplicativo!
                  </li>
                </ol>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] leading-relaxed mt-2">
                  ✨ <strong>Dica do Studio Sá Pateia:</strong> O app converte automaticamente qualquer link do Google Drive (<code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">/view</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">/open</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">id=...</code>) para o player de teatro integrado!
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Backup & Reset */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Export Card */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Exportar Catálogo</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Baixe um arquivo JSON com todas as {choreographies.length} coreografias, elenco e links para backup ou para enviar aos professores.
                    </p>
                  </div>

                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Baixar Backup (.json)
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Restaurar Backup</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Carregue um arquivo JSON exportado anteriormente para atualizar todo o catálogo instantaneamente.
                    </p>
                  </div>

                  <label className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer text-center block">
                    <span>Selecionar Arquivo</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Reset to Default Data */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Restaurar Coreografias Padrão</span>
                  <span className="text-[11px] text-slate-500">Recarrega o espetáculo oficial &ldquo;A Magia está no Ar&rdquo;</span>
                </div>

                <button
                  onClick={() => {
                    const doReset = () => {
                      if (confirm('Deseja restaurar as 12 coreografias oficiais pré-carregadas do espetáculo?')) {
                        onResetToDefault();
                        onClose();
                      }
                    };
                    if (!isAdmin && onRequireAdmin) {
                      onRequireAdmin('Restaurar dados padrão do espetáculo', doReset);
                    } else {
                      doReset();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-400 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
