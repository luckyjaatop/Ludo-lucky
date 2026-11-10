import React, { useState } from 'react';
import { PlayerColor, GameMode } from '../types/ludo';
import { X, Users, Coins, Trophy, Sparkles, Play, Shield } from 'lucide-react';
import { audio } from '../utils/audio';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: GameMode;
  userCoins: number;
  onConfirmStart: (mode: GameMode, playerCount: 2 | 3 | 4, entryFee: number, playerColor: PlayerColor) => void;
}

const BET_OPTIONS = [
  { fee: 0, label: 'Practice (Free)', prize: 200 },
  { fee: 500, label: '500 Coins', prize: 1000 },
  { fee: 1000, label: '1,000 Coins', prize: 2000 },
  { fee: 2500, label: '2,500 Coins', prize: 5000 },
];

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  selectedMode,
  userCoins,
  onConfirmStart,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [selectedBetIndex, setSelectedBetIndex] = useState(1); // 500 Coins
  const [chosenColor, setChosenColor] = useState<PlayerColor>('red');

  if (!isOpen) return null;

  const currentBet = BET_OPTIONS[selectedBetIndex];

  const handleStart = () => {
    if (currentBet.fee > userCoins) {
      alert(`You need at least ${currentBet.fee} Coins to join this table!`);
      return;
    }
    audio.playButton();
    onConfirmStart(selectedMode, playerCount, currentBet.fee, chosenColor);
  };

  const getModeTitle = () => {
    switch (selectedMode) {
      case 'vs_bot':
        return 'VS Computer / Smart Bot';
      case 'local':
        return 'Pass N Play (Local Board)';
      case 'online':
        return 'Play Online Arena';
      default:
        return 'Select Table';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#020617] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div>
            <h2 className="text-base font-black text-white tracking-wide uppercase font-display">
              {getModeTitle()}
            </h2>
            <p className="text-xs text-amber-300/80 font-medium">Configure match options & entry stake</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Select Number of Players */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Player Count:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => {
                  audio.playButton();
                  setPlayerCount(count as 2 | 3 | 4);
                }}
                className={`py-2.5 rounded-xl border-2 font-black text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                  playerCount === count
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-md scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{count} PLAYERS</span>
                <span className="text-[10px] font-semibold opacity-85">
                  {count === 2 ? '1 vs 1 Battle' : count === 3 ? 'Triple Threat' : 'Full Tournament'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Choose Your Token Color */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Choose Your Starting Color:</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c) => {
              const colorInfo: Record<PlayerColor, { name: string; bg: string; border: string }> = {
                red: { name: 'Red', bg: 'bg-rose-500', border: 'border-rose-400 ring-rose-400' },
                green: { name: 'Green', bg: 'bg-emerald-500', border: 'border-emerald-400 ring-emerald-400' },
                yellow: { name: 'Yellow', bg: 'bg-amber-400', border: 'border-amber-300 ring-amber-300' },
                blue: { name: 'Blue', bg: 'bg-sky-500', border: 'border-sky-400 ring-sky-400' },
              };

              const info = colorInfo[c];
              const isSelected = chosenColor === c;

              return (
                <button
                  key={c}
                  onClick={() => {
                    audio.playButton();
                    setChosenColor(c);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? `bg-slate-900 ${info.border} ring-2 shadow-lg scale-[1.03]`
                      : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full shadow-md ${info.bg} border-2 border-white`} />
                  <span className="text-[10px] font-black uppercase text-white tracking-wider">
                    {info.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Choose Entry Stake & Prize */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Table Stake:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BET_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  audio.playButton();
                  setSelectedBetIndex(idx);
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  selectedBetIndex === idx
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow ring-1 ring-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-white">{opt.label}</p>
                  <p className="text-[10px] text-amber-300 flex items-center gap-0.5 mt-0.5">
                    <Trophy className="w-3 h-3 text-amber-400" /> Win: {opt.prize}
                  </p>
                </div>
                {opt.fee === 0 ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    FREE
                  </span>
                ) : (
                  <Coins className="w-4 h-4 text-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start CTA Button */}
        <div className="mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm tracking-wider uppercase rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>ENTER BATTLEGROUND</span>
          </button>
        </div>
      </div>
    </div>
  );
};
