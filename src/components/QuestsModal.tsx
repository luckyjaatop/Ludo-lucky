import React from 'react';
import { useGame } from '../context/GameContext';
import { X, Target, Coins, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ isOpen, onClose }) => {
  const { quests, claimQuest } = useGame();

  if (!isOpen) return null;

  const handleClaim = (questId: string) => {
    claimQuest(questId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">Daily Royal Quests</h2>
              <p className="text-xs text-amber-400/90 font-medium">Complete daily trials to earn gold & XP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest List */}
        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {quests.map((q) => {
            const isCompleted = q.current >= q.target;
            const progressPct = Math.min(100, Math.round((q.current / q.target) * 100));

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  q.claimed
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : isCompleted
                    ? 'bg-amber-500/10 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{q.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{q.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>+{q.rewardCoins}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400">
                      <Zap className="w-3 h-3 text-sky-400" />
                      <span>+{q.rewardXp} XP</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    {q.current}/{q.target}
                  </span>
                </div>

                {/* Claim action */}
                <div className="mt-2.5 flex justify-end">
                  {q.claimed ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(q.id)}
                      className="px-3.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-black rounded-lg shadow-md transition-all"
                    >
                      CLAIM REWARD
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
