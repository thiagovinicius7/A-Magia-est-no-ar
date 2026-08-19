import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ChoreographyCard } from './components/ChoreographyCard';
import { ChoreographyPlayerModal } from './components/ChoreographyPlayerModal';
import { ChoreographyModal } from './components/ChoreographyModal';
import { CastDirectoryModal } from './components/CastDirectoryModal';
import { DriveFolderSyncModal } from './components/DriveFolderSyncModal';
import { StageOrderView } from './components/StageOrderView';
import { RehearsalChecklistView } from './components/RehearsalChecklistView';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { Footer } from './components/Footer';
import { Choreography, ShowInfo, ViewMode, RehearsalStatus } from './types';
import { INITIAL_SHOW_INFO, INITIAL_CHOREOGRAPHIES } from './data/initialData';
import { Plus, Video, Sparkles, FolderSync, Users } from 'lucide-react';

const STORAGE_KEY_CHOREOGRAPHIES = 'sapateia_magia_choreographies_v2';
const STORAGE_KEY_SHOW_INFO = 'sapateia_magia_showinfo_v2';
const STORAGE_KEY_ADMIN_PASS = 'sapateia_magia_admin_pass_v1';
const DEFAULT_ADMIN_PASS = 'sapateia2026';

export default function App() {
  // Load initial data from localStorage or clean initial empty state
  const [showInfo, setShowInfo] = useState<ShowInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOW_INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SHOW_INFO,
          ...parsed,
          googleSheetUrl: parsed.googleSheetUrl || INITIAL_SHOW_INFO.googleSheetUrl,
        };
      }
      return INITIAL_SHOW_INFO;
    } catch {
      return INITIAL_SHOW_INFO;
    }
  });

  const [choreographies, setChoreographies] = useState<Choreography[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHOREOGRAPHIES);
      return saved ? JSON.parse(saved) : INITIAL_CHOREOGRAPHIES;
    } catch {
      return INITIAL_CHOREOGRAPHIES;
    }
  });

  // Admin and Password State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('sapateia_is_admin') === 'true';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PASS) || DEFAULT_ADMIN_PASS;
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<{
    name: string;
    callback: () => void;
  } | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHOREOGRAPHIES, JSON.stringify(choreographies));
    } catch (e) {
      console.error('Failed to save choreographies to localStorage', e);
    }
  }, [choreographies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SHOW_INFO, JSON.stringify(showInfo));
    } catch (e) {
      console.error('Failed to save showInfo to localStorage', e);
    }
  }, [showInfo]);

  // Auto-sync with Google Sheets on mount if URL is configured
  useEffect(() => {
    if (!showInfo.googleSheetUrl) return;

    const fetchLatestFromSheets = async () => {
      try {
        const { fetchGoogleSheetCsv, parseChoreographiesFromCsv } = await import('./utils/googleSheetsSync');
        const csvText = await fetchGoogleSheetCsv(showInfo.googleSheetUrl!);
        const items = parseChoreographiesFromCsv(csvText);
        if (items.length > 0) {
          setChoreographies(items);
          setShowInfo((prev) => ({
            ...prev,
            lastSyncedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }));
        }
      } catch (err) {
        console.warn('Auto-sync from Google Sheets skipped:', err);
      }
    };

    fetchLatestFromSheets();
  }, [showInfo.googleSheetUrl]);

  // Auth Handlers
  const handleUnlockAdmin = (enteredPassword: string): boolean => {
    if (enteredPassword === adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('sapateia_is_admin', 'true');
      if (pendingAdminAction) {
        const action = pendingAdminAction.callback;
        setPendingAdminAction(null);
        setTimeout(() => {
          action();
        }, 300);
      }
      return true;
    }
    return false;
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('sapateia_is_admin');
    setPendingAdminAction(null);
  };

  const handleChangePassword = (oldPass: string, newPass: string): boolean => {
    if (oldPass === adminPassword) {
      setAdminPassword(newPass);
      localStorage.setItem(STORAGE_KEY_ADMIN_PASS, newPass);
      return true;
    }
    return false;
  };

  const requireAdmin = (actionName: string, action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setPendingAdminAction({ name: actionName, callback: action });
      setIsAdminModalOpen(true);
    }
  };

  // UI States & Filters
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAct, setSelectedAct] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedDancer, setSelectedDancer] = useState('ALL');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Modal States
  const [activePlayerChoreo, setActivePlayerChoreo] = useState<Choreography | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChoreo, setEditingChoreo] = useState<Choreography | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // All unique dancers
  const allDancers = useMemo(() => {
    const set = new Set<string>();
    choreographies.forEach((ch) => {
      (ch.dancers || []).forEach((d) => {
        if (d.trim()) set.add(d.trim());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [choreographies]);

  // Total Duration Calculation
  const totalDurationMin = useMemo(() => {
    let totalSec = 0;
    choreographies.forEach((ch) => {
      const parts = (ch.duration || '03:00').split(':');
      if (parts.length === 2) {
        totalSec += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        totalSec += 180;
      }
    });
    return Math.round(totalSec / 60);
  }, [choreographies]);

  const driveVideosCount = useMemo(() => {
    return choreographies.filter((c) => c.driveUrl && c.driveUrl.trim().length > 5).length;
  }, [choreographies]);

  // Filtered choreographies
  const filteredChoreographies = useMemo(() => {
    return choreographies
      .filter((ch) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = ch.title.toLowerCase().includes(q);
          const matchMusic = ch.musicTitle.toLowerCase().includes(q);
          const matchChoreo = (ch.choreographer || '').toLowerCase().includes(q);
          const matchCostume = (ch.costume || '').toLowerCase().includes(q);
          const matchNotes = (ch.notes || '').toLowerCase().includes(q);
          const matchDancer = (ch.dancers || []).some((d) => d.toLowerCase().includes(q));
          if (!matchTitle && !matchMusic && !matchChoreo && !matchCostume && !matchNotes && !matchDancer) {
            return false;
          }
        }

        if (selectedAct !== 'ALL' && ch.act !== selectedAct) {
          return false;
        }

        if (selectedLevel !== 'ALL' && ch.level !== selectedLevel) {
          return false;
        }

        if (selectedDancer !== 'ALL') {
          const hasDancer = (ch.dancers || []).some(
            (d) => d.trim().toLowerCase() === selectedDancer.trim().toLowerCase()
          );
          if (!hasDancer) return false;
        }

        if (showOnlyFavorites && !ch.isFavorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [choreographies, searchTerm, selectedAct, selectedLevel, selectedDancer, showOnlyFavorites]);

  // Handlers for CRUD
  const handleSaveChoreography = (updated: Choreography) => {
    const exists = choreographies.some((c) => c.id === updated.id);
    if (exists) {
      setChoreographies(choreographies.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      setChoreographies([...choreographies, updated]);
    }
  };

  const handleDeleteChoreography = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta coreografia?')) {
      setChoreographies(choreographies.filter((c) => c.id !== id));
      if (activePlayerChoreo?.id === id) {
        setActivePlayerChoreo(null);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    setChoreographies(
      choreographies.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleUpdateStatus = (id: string, newStatus: RehearsalStatus) => {
    setChoreographies(
      choreographies.map((c) => (c.id === id ? { ...c, rehearsalStatus: newStatus } : c))
    );
    if (activePlayerChoreo?.id === id) {
      setActivePlayerChoreo({ ...activePlayerChoreo, rehearsalStatus: newStatus });
    }
  };

  const handleResetToDefault = () => {
    setChoreographies(INITIAL_CHOREOGRAPHIES);
    setShowInfo(INITIAL_SHOW_INFO);
  };

  // Player Prev / Next navigation
  const activePlayerIndex = activePlayerChoreo
    ? filteredChoreographies.findIndex((c) => c.id === activePlayerChoreo.id)
    : -1;

  const handlePreviousPlayer = () => {
    if (activePlayerIndex > 0) {
      setActivePlayerChoreo(filteredChoreographies[activePlayerIndex - 1]);
    }
  };

  const handleNextPlayer = () => {
    if (activePlayerIndex >= 0 && activePlayerIndex < filteredChoreographies.length - 1) {
      setActivePlayerChoreo(filteredChoreographies[activePlayerIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar */}
      <Navbar
        showInfo={showInfo}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewModal={() => {
          requireAdmin('Adicionar Nova Coreografia', () => {
            setEditingChoreo(null);
            setIsEditModalOpen(true);
          });
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenCastModal={() => setIsCastModalOpen(true)}
        choreographiesCount={choreographies.length}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Hero Banner & Search (Shown in all or grid views) */}
      <HeroBanner
        showInfo={showInfo}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAct={selectedAct}
        onSelectAct={setSelectedAct}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        selectedDancer={selectedDancer}
        onSelectDancer={setSelectedDancer}
        allDancers={allDancers}
        totalChoreographies={choreographies.length}
        totalDancers={allDancers.length}
        totalDurationMin={totalDurationMin}
        driveVideosCount={driveVideosCount}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
      />

      {/* Active Dancer Filter Notification Pill */}
      {selectedDancer !== 'ALL' && (
        <div className="bg-purple-950/80 border-b border-purple-500/30 py-2 px-4 text-center text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-purple-300" />
            <span>
              Exibindo coreografias com <strong className="text-amber-300 font-semibold">{selectedDancer}</strong> ({filteredChoreographies.length})
            </span>
            <button
              onClick={() => setSelectedDancer('ALL')}
              className="ml-2 underline text-purple-200 hover:text-white font-semibold cursor-pointer"
            >
              Ver todo o elenco
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: GRID SHOWCASE */}
        {currentView === 'grid' && (
          <div>
            {choreographies.length === 0 ? (
              <div className="text-center py-16 px-6 bg-slate-900/50 border border-slate-800 rounded-3xl max-w-xl mx-auto space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-theatre text-2xl font-bold text-slate-100">
                  Nenhuma coreografia cadastrada
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Adicione as coreografias do espetáculo individualmente ou importe links e dados do Google Drive / arquivo JSON.
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      requireAdmin('Adicionar Nova Coreografia', () => {
                        setEditingChoreo(null);
                        setIsEditModalOpen(true);
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Nova Coreografia</span>
                  </button>
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    <FolderSync className="w-4 h-4 text-blue-400" />
                    <span>Importar do Google Drive / JSON</span>
                  </button>
                </div>
              </div>
            ) : filteredChoreographies.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3 max-w-md mx-auto">
                <Video className="w-10 h-10 text-amber-400/50 mx-auto" />
                <h3 className="font-theatre text-lg font-bold text-slate-200">
                  Nenhum resultado com os filtros selecionados
                </h3>
                <p className="text-xs text-slate-400">
                  Tente limpar a busca para ver todas as coreografias.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAct('ALL');
                    setSelectedLevel('ALL');
                    setSelectedDancer('ALL');
                    setShowOnlyFavorites(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChoreographies.map((choreo) => (
                  <ChoreographyCard
                    key={choreo.id}
                    choreography={choreo}
                    onPlay={(ch) => setActivePlayerChoreo(ch)}
                    onEdit={(ch) => {
                      setEditingChoreo(ch);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={handleDeleteChoreography}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectDancer={(dancer) => setSelectedDancer(dancer)}
                    selectedDancer={selectedDancer}
                    isAdmin={isAdmin}
                    onRequireAdmin={requireAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RUNNING ORDER & TIMELINE */}
        {currentView === 'lineup' && (
          <StageOrderView
            choreographies={choreographies}
            showInfo={showInfo}
            onPlayChoreography={(ch) => setActivePlayerChoreo(ch)}
            onSelectDancer={(dancer) => setSelectedDancer(dancer)}
          />
        )}

        {/* VIEW 3: STAGE MANAGER & REHEARSAL CHECKLIST */}
        {currentView === 'stageManager' && (
          <RehearsalChecklistView
            choreographies={choreographies}
            onUpdateStatus={handleUpdateStatus}
            onPlayChoreography={(ch) => setActivePlayerChoreo(ch)}
            isAdmin={isAdmin}
            onRequireAdmin={requireAdmin}
          />
        )}

      </main>

      {/* Modal: Interactive Video Player */}
      {activePlayerChoreo && (
        <ChoreographyPlayerModal
          choreography={activePlayerChoreo}
          onClose={() => setActivePlayerChoreo(null)}
          onPrevious={handlePreviousPlayer}
          onNext={handleNextPlayer}
          hasPrevious={activePlayerIndex > 0}
          hasNext={activePlayerIndex < filteredChoreographies.length - 1}
          onSelectDancer={(dancer) => setSelectedDancer(dancer)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Modal: Add/Edit Choreography */}
      <ChoreographyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingChoreo(null);
        }}
        onSave={handleSaveChoreography}
        initialData={editingChoreo}
        existingDancers={allDancers}
        nextOrderNumber={choreographies.length + 1}
      />

      {/* Modal: Cast Roster Directory */}
      <CastDirectoryModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        choreographies={choreographies}
        onSelectDancerAndFilter={(dancer) => {
          setSelectedDancer(dancer);
          setCurrentView('grid');
        }}
        onPlayChoreography={(ch) => setActivePlayerChoreo(ch)}
      />

      {/* Modal: Google Drive Master & Batch Sync */}
      <DriveFolderSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        showInfo={showInfo}
        onUpdateShowInfo={setShowInfo}
        choreographies={choreographies}
        onImportChoreographies={(imported) => setChoreographies(imported)}
        onResetToDefault={handleResetToDefault}
        isAdmin={isAdmin}
        onRequireAdmin={requireAdmin}
      />

      {/* Modal: Admin Password & Access Control */}
      <AdminPasswordModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setPendingAdminAction(null);
        }}
        isAdmin={isAdmin}
        currentPassword={adminPassword}
        onUnlock={handleUnlockAdmin}
        onLock={handleLockAdmin}
        onChangePassword={handleChangePassword}
        pendingActionName={pendingAdminAction?.name}
      />

      {/* Footer */}
      <Footer showInfo={showInfo} onOpenSyncModal={() => setIsSyncModalOpen(true)} />

    </div>
  );
}
