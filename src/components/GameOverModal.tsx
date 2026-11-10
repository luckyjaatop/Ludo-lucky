import React, { useEffect } from 'react';
import { PlayerColor } from '../types/ludo';
import { Crown, Trophy, Coins, Zap, RotateCcw, Home } from 'lucide-react';
import { audio } from '../utils/audio';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  winnerColor: PlayerColor | null;
  winnerName: string;
  isLocalWinner: boolean;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerColor,
  winnerName,
  isLocalWinner,
  onPlayAgain,
  onReturnToMenu,
}) => {
  useEffect(() => {
    audio.playVictory();
    const duration = 3000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const colorStyles: Record<PlayerColor, string> = {
    red: 'from-rose-500 to-red-700 text-rose-200 border-rose-400',
    green: 'from-emerald-500 to-green-700 text-emerald-200 border-emerald-400',
    yellow: 'from-amber-400 to-yellow-600 text-amber-950 border-amber-300',
    blue: 'from-sky-500 to-blue-700 text-sky-200 border-sky-400',
  };

  const currentStyle = winnerColor ? colorStyles[winnerColor] : 'from-amber-500 to-yellow-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crown & Trophy Trophy Crest */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-4 border-amber-200 shadow-xl flex items-center justify-center mb-4">
          <Crown className="w-10 h-10 text-amber-950 drop-shadow-md animate-bounce" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
          {isLocalWinner ? 'ROYAL VICTORY!' : 'MATCH COMPLETED'}
        </h2>

        <p className="text-xs text-amber-400/90 font-medium mt-1">
          All 4 tokens guided safely to the central throne
        </p>

        {/* Winner Badge */}
        <div className={`mt-4 p-3 rounded-2xl bg-gradient-to-r ${currentStyle} border shadow-lg flex items-center justify-center gap-2 font-black text-sm`}>
          <Trophy className="w-4 h-4" />
          <span>{winnerName} CROWNED KING!</span>
        </div>

        {/* Match Spoils Summary */}
        <div className="my-5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rewards</span>
            <div className="flex items-center gap-1 text-sm font-black text-amber-400 mt-0.5">
              <Coins className="w-4 h-4" />
              <span>+800</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</span>
            <div className="flex items-center gap-1 text-sm font-black text-sky-400 mt-0.5">
              <Zap className="w-4 h-4" />
              <span>+350 XP</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>MAIN ARENA MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
