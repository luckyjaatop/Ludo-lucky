import React, { useState } from 'react';
import { X, Trophy, Crown, Medal, Users } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userCoins: number;
}

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Sultan Khan 👑', country: 'IN', wins: 1420, coins: '1,450,000', badge: 'Grand Emperor' },
  { rank: 2, name: 'DragonSlayer99', country: 'US', wins: 1210, coins: '980,000', badge: 'High Monarch' },
  { rank: 3, name: 'Elena The Swift', country: 'BR', wins: 1050, coins: '840,000', badge: 'Royal Knight' },
  { rank: 4, name: 'Vikram King', country: 'IN', wins: 980, coins: '720,000', badge: 'Diamond Lord' },
  { rank: 5, name: 'TokyoMaster', country: 'JP', wins: 890, coins: '610,000', badge: 'Ruby Baron' },
  { rank: 6, name: 'CaptainDice', country: 'UK', wins: 820, coins: '540,000', badge: 'Emerald Duke' },
  { rank: 7, name: 'ShadowPawn', country: 'CA', wins: 760, coins: '490,000', badge: 'Golden Earl' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  userName,
  userCoins,
}) => {
  const [tab, setTab] = useState<'world' | 'friends'>('world');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide uppercase font-display">
                Royal Leaderboard
              </h2>
              <p className="text-xs text-amber-300/80 font-medium">Top Ludo King tournament champions</p>
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

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl my-4 border border-slate-800">
          <button
            onClick={() => setTab('world')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'world' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Worldwide Champions
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'friends' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            League Friends
          </button>
        </div>

        {/* List of champions */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {LEADERBOARD_DATA.map((player) => {
            const isTop1 = player.rank === 1;
            const isTop2 = player.rank === 2;
            const isTop3 = player.rank === 3;

            return (
              <div
                key={player.rank}
                className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isTop1
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                    : isTop2
                    ? 'bg-slate-900/90 border-slate-700'
                    : isTop3
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                    {isTop1 ? (
                      <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                    ) : isTop2 ? (
                      <Medal className="w-5 h-5 text-slate-300" />
                    ) : isTop3 ? (
                      <Medal className="w-5 h-5 text-amber-600" />
                    ) : (
                      <span className="text-slate-400 font-mono">#{player.rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white line-clamp-1">{player.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{player.country}</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-semibold">{player.badge}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-amber-300 tabular-nums">{player.coins} 🪙</p>
                  <p className="text-[10px] text-slate-400 font-bold">{player.wins} Wins</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* User's own Rank Bar at Bottom */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              #42
            </span>
            <div>
              <p className="text-xs font-bold text-white">{userName} (You)</p>
              <p className="text-[10px] text-emerald-400">Rising Challenger</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-amber-400 tabular-nums">
              {userCoins.toLocaleString()} 🪙
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
