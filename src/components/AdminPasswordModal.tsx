import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, X, Check, Eye, EyeOff, ShieldCheck, FileSpreadsheet, ExternalLink, RefreshCw } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentPassword: string;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
  pendingActionName?: string;
  googleSheetUrl?: string;
  onSyncNow?: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onUnlock,
  onLock,
  onChangePassword,
  pendingActionName,
  googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1QgsC7WJiV7Q78jYeiBI7Sw2whLo9wbKBIl_TlD8f9gU/edit?gid=52395862#gid=52395862',
  onSyncNow,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mode: 'login' | 'changePassword'
  const [mode, setMode] = useState<'login' | 'changePassword'>('login');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const success = onUnlock(passwordInput);
    if (success) {
      setPasswordInput('');
      setSuccessMsg('Acesso liberado com sucesso!');
    } else {
      setErrorMsg('Senha incorreta. Tente novamente.');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPasswordInput.length < 4) {
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    const success = onChangePassword(oldPasswordInput, newPasswordInput);
    if (success) {
      setSuccessMsg('Senha alterada com sucesso!');
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 1000);
    } else {
      setErrorMsg('A senha atual informada está incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/50 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            {isAdmin ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider block">
              Painel da Direção
            </span>
            <h2 className="font-theatre text-xl font-bold text-slate-100">
              {isAdmin ? 'Direção Autenticada' : 'Acesso da Direção'}
            </h2>
          </div>
        </div>

        {/* Pending action note */}
        {pendingActionName && !isAdmin && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Para <strong>{pendingActionName}</strong>, insira a senha da direção.
            </span>
          </div>
        )}

        {/* ALREADY LOGGED IN ADMIN STATE */}
        {isAdmin && mode === 'login' && (
          <div className="space-y-4">
            
            {/* Status Banner */}
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-1.5 text-xs text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Modo Direção Ativo</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Você pode gerenciar as coreografias diretamente no app ou editar pela planilha do Google Sheets.
              </p>
            </div>

            {/* Direct Google Sheet Edit Link */}
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 hover:from-emerald-900/70 hover:to-emerald-800/40 border border-emerald-500/50 text-emerald-200 transition-all cursor-pointer shadow-lg group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/40 shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-emerald-100 flex items-center gap-1.5">
                    <span className="truncate">Abrir e Editar Planilha Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-emerald-300/80 truncate">
                    Edite dados, elenco e links de vídeos no Google Sheets
                  </p>
                </div>
              </div>
            </a>

            {/* Actions Grid */}
            <div className="flex flex-col gap-2 pt-1">
              {onSyncNow && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncNow();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Sincronizar Alterações da Planilha Agora</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMode('changePassword')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Alterar Senha de Acesso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLock();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Bloquear / Sair da Direção</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM (WHEN LOCKED) */}
        {!isAdmin && mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Senha da Direção:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha..."
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Painel da Direção</span>
            </button>
          </form>
        )}

        {/* CHANGE PASSWORD SUB-VIEW */}
        {mode === 'changePassword' && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Senha Atual:</label>
              <input
                type="password"
                value={oldPasswordInput}
                onChange={(e) => setOldPasswordInput(e.target.value)}
                placeholder="Senha atual..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-hidden font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Nova Senha:</label>
              <input
                type="password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Mínimo 4 caracteres..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-hidden font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Confirmar Nova Senha:</label>
              <input
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Repita a nova senha..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 outline-hidden font-mono"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                {successMsg}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
              >
                Salvar Nova Senha
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
