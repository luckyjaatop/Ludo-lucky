import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, User, Edit2, ShieldCheck, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
  onOpenRules: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userName,
  onUpdateName,
  onOpenRules,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [isSoundMuted, setIsSoundMuted] = useState(audio.getMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(audio.getMusicMuted());
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = audio.toggleMute();
    setIsSoundMuted(next);
  };

  const handleToggleMusic = () => {
    const next = audio.toggleMusic();
    setIsMusicMuted(next);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onUpdateName(nameInput.trim());
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <h2 className="text-base font-black text-white tracking-wide uppercase font-display">
            Arena Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name edit form */}
        <form onSubmit={handleSaveName} className="mt-4">
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Player Display Name</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              {savedToast ? <Check className="w-4 h-4" /> : 'SAVE'}
            </button>
          </div>
        </form>

        {/* Audio Toggles */}
        <div className="mt-5 space-y-3">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {isSoundMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
              <div>
                <p className="text-xs font-bold text-white">Game Sound Effects</p>
                <p className="text-[10px] text-slate-400">Dice roll, token taps & fanfare</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                !isSoundMuted ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  !isSoundMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Lobby Background Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Music className={`w-5 h-5 ${!isMusicMuted ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <p className="text-xs font-bold text-white">Lobby Theme Music</p>
                <p className="text-[10px] text-slate-400">Arcade royal lobby soundtrack</p>
              </div>
            </div>
            <button
              onClick={handleToggleMusic}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                !isMusicMuted ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  !isMusicMuted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Rules button */}
        <div className="mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onOpenRules();
            }}
            className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>View Tournament Rules & Safe Zones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
