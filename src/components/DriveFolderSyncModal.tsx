import React, { useState } from 'react';
import { X, FolderOpen, ExternalLink, Download, Upload, RefreshCw, Check, Sparkles, FileSpreadsheet, Layers, Table, AlertCircle, ClipboardCopy } from 'lucide-react';
import { Choreography, ShowInfo } from '../types';
import { parseBatchChoreographies } from '../utils/driveHelper';
import {
  fetchGoogleSheetCsv,
  parseChoreographiesFromCsv,
  downloadGoogleSheetsTemplate,
} from '../utils/googleSheetsSync';

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
  const [activeTab, setActiveTab] = useState<'sheets' | 'paste' | 'folder' | 'backup'>('sheets');
  const [sheetUrlInput, setSheetUrlInput] = useState(showInfo.googleSheetUrl || '');
  const [pastedCsvText, setPastedCsvText] = useState('');
  const [masterFolderUrl, setMasterFolderUrl] = useState(showInfo.masterDriveFolderUrl);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSuccessMessage, setSheetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-Time Google Sheets Live Sync via URL
  const handleSyncGoogleSheet = async () => {
    if (!sheetUrlInput.trim()) {
      setSheetError('Por favor, cole o link da sua planilha do Google Sheets.');
      return;
    }

    setIsLoadingSheet(true);
    setSheetError(null);
    setSheetSuccessMessage(null);

    try {
      const csvText = await fetchGoogleSheetCsv(sheetUrlInput.trim());
      const parsedItems = parseChoreographiesFromCsv(csvText);

      if (parsedItems.length === 0) {
        throw new Error(
          'Nenhuma coreografia reconhecida. Verifique se a planilha possui os títulos das colunas na primeira linha.'
        );
      }

      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const updatedInfo: ShowInfo = {
        ...showInfo,
        googleSheetUrl: sheetUrlInput.trim(),
        lastSyncedAt: nowStr,
      };

      onUpdateShowInfo(updatedInfo);
      onImportChoreographies(parsedItems);
      setSheetSuccessMessage(`Sucesso! ${parsedItems.length} coreografias sincronizadas em tempo real.`);
    } catch (err: any) {
      setSheetError(err.message || 'Erro ao conectar à planilha.');
    } finally {
      setIsLoadingSheet(false);
    }
  };

  // Import from local CSV File (Offline / Direct upload)
  const handleImportCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseChoreographiesFromCsv(text);
        if (parsed.length === 0) {
          alert('Não foi possível identificar as coreografias no arquivo CSV selecionado.');
          return;
        }
        onImportChoreographies(parsed);
        alert(`Sucesso! ${parsed.length} coreografias carregadas do arquivo CSV.`);
        onClose();
      } catch (err) {
        alert('Erro ao processar o arquivo CSV.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Import from pasted spreadsheet cells (Ctrl+C from Sheets/Excel, Ctrl+V here)
  const handleImportPastedText = () => {
    if (!pastedCsvText.trim()) return;

    try {
      const parsed = parseChoreographiesFromCsv(pastedCsvText);
      if (parsed.length === 0) {
        alert('Nenhuma coreografia reconhecida no texto colado. Copie os cabeçalhos e as linhas da planilha.');
        return;
      }
      onImportChoreographies(parsed);
      setPastedCsvText('');
      alert(`Sucesso! ${parsed.length} coreografias importadas.`);
      onClose();
    } catch (err) {
      alert('Erro ao importar texto colado.');
    }
  };

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
    alert('Pasta do Google Drive vinculada com sucesso!');
  };

  const handleExportJSON = () => {
    const exportData = {
      showInfo,
      choreographies,
      exportedAt: new Date().toISOString(),
      version: '2.0',
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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-theatre text-xl font-bold text-slate-100">
                Sincronização & Nuvem
              </h2>
              <p className="text-xs text-slate-400">
                Google Sheets em tempo real, Google Drive e Backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/40 gap-2 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets (Link Nuvem)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardCopy className="w-4 h-4" />
            <span>Colar Células / Upload CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('folder')}
            className={`flex items-center gap-2 pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'folder'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Pasta Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: GOOGLE SHEETS LIVE SYNC VIA URL */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-emerald-200 text-sm">
                    Atualização Automática em Tempo Real
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Você pode alterar a planilha no Google Sheets a qualquer momento. Ao abrir o app, todos os alunos e professores recebem as informações mais recentes na hora.
                  </p>
                </div>
              </div>

              {/* Quick Actions: Download Template & Open Sheets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={downloadGoogleSheetsTemplate}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:border-emerald-400"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Baixar Modelo de Planilha (.CSV)</span>
                </button>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Table className="w-4 h-4" />
                  <span>Abrir Novo Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                </a>
              </div>

              {/* Sheet URL Input Form */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Cole o Link da sua Planilha do Google Sheets:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleSyncGoogleSheet}
                    disabled={isLoadingSheet}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                    <span>{isLoadingSheet ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                  </button>
                </div>

                {/* Status Messages */}
                {sheetError && (
                  <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="font-semibold">{sheetError}</span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                      💡 <strong>Como liberar o acesso:</strong> No Google Sheets, clique no botão azul <strong>Compartilhar</strong> (canto superior direito) ➔ mude o Acesso Geral para <strong>"Qualquer pessoa com o link pode ler"</strong>. Depois clique em Sincronizar novamente.
                    </div>
                  </div>
                )}

                {sheetSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{sheetSuccessMessage}</span>
                  </div>
                )}

                {showInfo.lastSyncedAt && !sheetSuccessMessage && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Última sincronização: às <strong>{showInfo.lastSyncedAt}</strong></span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider">
                  Passo a passo rápido:
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Clique em <strong>Baixar Modelo</strong> e abra no Google Sheets.</li>
                  <li>No Google Sheets, clique em <strong>Compartilhar</strong> e marque como <strong>"Qualquer pessoa com o link"</strong>.</li>
                  <li>Cole o link acima e clique em <strong>Sincronizar Agora</strong>.</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 2: PASTE CELLS / UPLOAD CSV DIRECTLY */}
          {activeTab === 'paste' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                <p className="font-semibold text-sm">Copiar e Colar Células da Planilha ou Enviar Arquivo</p>
                <p className="text-slate-300 leading-relaxed">
                  Você pode selecionar as linhas na sua planilha do Google Sheets ou Excel, pressionar <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">Ctrl+C</kbd> e colar aqui com <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">Ctrl+V</kbd>.
                </p>
              </div>

              {/* File Upload Option */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Importar Arquivo CSV</h4>
                  <p className="text-[11px] text-slate-400">Selecione o arquivo .csv salvo no seu computador</p>
                </div>

                <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo .CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCsvFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Ou Cole as Células Copiadas do Google Sheets / Excel:
                </label>
                <textarea
                  rows={6}
                  value={pastedCsvText}
                  onChange={(e) => setPastedCsvText(e.target.value)}
                  placeholder={`Ordem\tTitulo da Coreografia\tAto\tNivel\tElenco\n1\tO Livro Encantado\tAbertura\tCia Sá Pateia\tThiago Vinicius, Marina Alencar\n2\tPó de Pirlimpimpim\tAto 1\tInfantil\tSofia Martins, Beatriz Lima`}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="button"
                onClick={handleImportPastedText}
                disabled={!pastedCsvText.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Importar Células Coladas
              </button>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE MASTER FOLDER */}
          {activeTab === 'folder' && (
            <form onSubmit={handleSaveMasterFolder} className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
                <FolderOpen className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Vincule a pasta master do Google Drive onde estão guardados todos os vídeos dos ensaios e apresentações do Studio Sá Pateia.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Link da Pasta Master no Google Drive:
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={masterFolderUrl}
                  onChange={(e) => setMasterFolderUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {masterFolderUrl ? (
                  <a
                    href={masterFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <span>Abrir pasta no Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Salvar Pasta Master
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BACKUP JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <p className="font-semibold">Backup em Arquivo JSON</p>
                <p className="text-slate-300">
                  Exporte ou restaure todas as coreografias e dados do espetáculo em um arquivo único.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Exportar Backup JSON</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Restaurar Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
