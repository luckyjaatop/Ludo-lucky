import React from 'react';
import { PlayerColor } from '../types/ludo';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  playerColor: PlayerColor;
  skin?: string;
  hasBonusRoll?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  disabled,
  onRoll,
  playerColor,
  skin = 'classic',
  hasBonusRoll = false,
}) => {
  // Return pip positions for 1..6
  const renderPips = (val: number | null) => {
    if (!val) return null;

    // Dice pip styles based on skin
    const pipColorClass =
      skin === 'ruby'
        ? 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]'
        : skin === 'gold'
        ? 'bg-amber-950 shadow-inner'
        : skin === 'diamond'
        ? 'bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,1)]'
        : 'bg-red-600';

    const pips: Record<number, number[][]> = {
      1: [[50, 50]],
      2: [
        [28, 28],
        [72, 72],
      ],
      3: [
        [28, 28],
        [50, 50],
        [72, 72],
      ],
      4: [
        [28, 28],
        [28, 72],
        [72, 28],
        [72, 72],
      ],
      5: [
        [28, 28],
        [28, 72],
        [50, 50],
        [72, 28],
        [72, 72],
      ],
      6: [
        [28, 24],
        [28, 50],
        [28, 76],
        [72, 24],
        [72, 50],
        [72, 76],
      ],
    };

    const coords = pips[val] || pips[1];

    return coords.map(([top, left], i) => (
      <span
        key={i}
        className={`absolute w-3.5 h-3.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all ${pipColorClass}`}
        style={{ top: `${top}%`, left: `${left}%` }}
      />
    ));
  };

  const skinStyles = {
    classic: 'bg-gradient-to-br from-white via-amber-50 to-amber-100 border-2 border-amber-300 text-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.8)]',
    ruby: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 border-2 border-amber-400 text-white shadow-[0_8px_20px_rgba(225,29,72,0.5),inset_0_2px_6px_rgba(255,255,255,0.6)]',
    gold: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-2 border-yellow-200 text-amber-950 shadow-[0_8px_20px_rgba(217,119,6,0.5),inset_0_2px_6px_rgba(255,255,255,0.8)]',
    diamond: 'bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border-2 border-cyan-200 text-white shadow-[0_8px_20px_rgba(6,182,212,0.6),inset_0_2px_6px_rgba(255,255,255,0.9)]',
  }[skin] || 'bg-white border-2 border-slate-300 shadow-lg';

  const glowRingColor: Record<PlayerColor, string> = {
    red: 'ring-rose-500 shadow-rose-500/40',
    green: 'ring-emerald-500 shadow-emerald-500/40',
    yellow: 'ring-amber-400 shadow-amber-400/40',
    blue: 'ring-sky-500 shadow-sky-500/40',
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        aria-label="Roll Dice"
        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 transform active:scale-95 ${skinStyles} ${
          !disabled && !isRolling
            ? `ring-4 ${glowRingColor[playerColor]} shadow-lg animate-pulse hover:scale-105`
            : 'opacity-85'
        } ${isRolling ? 'animate-dice-roll' : ''}`}
      >
        {/* Dice Faces */}
        {value ? (
          renderPips(value)
        ) : (
          <div className="flex flex-col items-center justify-center text-xs font-bold text-amber-700 tracking-wider">
            <span className="text-xl">🎲</span>
            <span>ROLL</span>
          </div>
        )}

        {/* Bonus roll badge */}
        {hasBonusRoll && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-300 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white">
            +1 ROLL
          </span>
        )}
      </button>

      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
          !disabled ? 'text-amber-300 bg-amber-950/70 border border-amber-500/30' : 'text-slate-400'
        }`}
      >
        {isRolling ? 'Rolling...' : !disabled ? 'TAP TO ROLL' : 'Waiting'}
      </span>
    </div>
  );
};
