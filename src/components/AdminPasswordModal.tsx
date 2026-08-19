import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, X, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentPassword: string;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
  pendingActionName?: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onUnlock,
  onLock,
  onChangePassword,
  pendingActionName,
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
      setSuccessMsg('Acesso liberado!');
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setErrorMsg('Senha incorreta.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/50 space-y-6">
        
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
              Controle de Acesso
            </span>
            <h2 className="font-theatre text-xl font-bold text-slate-100">
              {isAdmin ? 'Modo Direção' : 'Acesso da Direção'}
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
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-1.5 text-xs text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Modo Direção Ativo</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Permissões liberadas para adicionar, editar e excluir coreografias.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('changePassword')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
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
                <span>Bloquear Edição</span>
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
              <span>Desbloquear Edição</span>
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
