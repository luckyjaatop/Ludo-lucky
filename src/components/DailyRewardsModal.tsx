import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { X, Sparkles, Coins, Gift, Calendar, CheckCircle, Flame } from 'lucide-react';
import { audio } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHEEL_SECTORS = [
  { label: '250 Coins', coins: 250, color: '#f59e0b', text: '#78350f' },
  { label: '500 Coins', coins: 500, color: '#10b981', text: '#064e3b' },
  { label: '1,000 Coins', coins: 1000, color: '#3b82f6', text: '#1e3a8a' },
  { label: 'Ruby Dice 🎲', coins: 300, skin: 'ruby', color: '#e11d48', text: '#ffffff' },
  { label: '350 Coins', coins: 350, color: '#8b5cf6', text: '#ffffff' },
  { label: '750 Coins', coins: 750, color: '#f97316', text: '#ffffff' },
  { label: '2,500 JACKPOT', coins: 2500, color: '#eab308', text: '#713f12' },
  { label: '50 Gems 💎', coins: 600, color: '#06b6d4', text: '#083344' },
];

const STREAK_REWARDS = [
  { day: 1, label: '250 Coins', coins: 250, icon: '🪙' },
  { day: 2, label: '500 Coins', coins: 500, icon: '🪙' },
  { day: 3, label: 'Golden Pawn', coins: 300, pawnSkin: 'royal', icon: '👑' },
  { day: 4, label: '1,000 Coins', coins: 1000, icon: '💰' },
  { day: 5, label: '1,500 Coins', coins: 1500, icon: '💰' },
  { day: 6, label: '2,500 Coins', coins: 2500, icon: '💎' },
  { day: 7, label: 'Crown Emperor Dice', coins: 3000, diceSkin: 'gold', icon: '🏆' },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, claimDailySpin, claimStreakReward, addCoins } = useGame();
  const [activeTab, setActiveTab] = useState<'wheel' | 'streak'>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const canFreeSpin = userProfile.lastDailySpinDate !== todayStr;
  const canClaimStreak = userProfile.lastStreakClaimDate !== todayStr;

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    if (!canFreeSpin && userProfile.coins < 150) {
      alert('You need at least 150 Coins for an extra spin!');
      return;
    }

    if (!canFreeSpin) {
      addCoins(-150);
    }

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random target sector
    const targetIdx = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sectorAngle = 360 / WHEEL_SECTORS.length;
    // Each sector centers at (targetIdx * sectorAngle + sectorAngle / 2)
    // To land under top pointer (270deg or 90deg offset):
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetDegree = wheelRotation + extraSpins * 360 + (360 - targetIdx * sectorAngle - sectorAngle / 2);

    setWheelRotation(targetDegree);

    // Play ticking audio
    const tickInterval = setInterval(() => {
      audio.playWheelTick();
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const prize = WHEEL_SECTORS[targetIdx];
      setWonPrize(prize.label);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      claimDailySpin(prize.coins, prize.skin);
    }, 4500);
  };

  const handleClaimStreakDay = (day: number) => {
    const reward = STREAK_REWARDS[day - 1];
    claimStreakReward(day, reward.coins, reward.pawnSkin || reward.diceSkin);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Glow ambient light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Daily Royal Rewards</h2>
              <p className="text-xs text-amber-400/90 font-medium">Claim spins, coin showers & rare skins</p>
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl my-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'wheel'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Lucky Fortune Wheel</span>
            {canFreeSpin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'streak'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>7-Day Login Streak</span>
            {canClaimStreak && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Tab Content: Wheel */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col items-center py-2">
            {/* Wheel Canvas / SVG */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Pointer indicator at top */}
              <div className="absolute -top-2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

              {/* Rotating Wheel Plate */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-[4500ms] ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: 'conic-gradient(#f59e0b 0% 12.5%, #10b981 12.5% 25%, #3b82f6 25% 37.5%, #e11d48 37.5% 50%, #8b5cf6 50% 62.5%, #f97316 62.5% 75%, #eab308 75% 87.5%, #06b6d4 87.5% 100%)',
                }}
              >
                {/* Wheel Labels SVG Overlay */}
                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 pointer-events-none">
                  {WHEEL_SECTORS.map((sec, i) => {
                    const angle = i * 45 + 22.5;
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 32 * Math.cos(rad);
                    const y = 50 + 32 * Math.sin(rad);
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="3.8"
                        fontWeight="800"
                        transform={`rotate(${angle + 90}, ${x}, ${y})`}
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
                      >
                        {sec.label}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Wheel Center Button */}
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-4 border-amber-100 shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-80 transition-transform"
              >
                <Sparkles className="w-5 h-5 text-amber-950" />
                <span className="text-[10px] font-black text-amber-950">SPIN</span>
              </button>
            </div>

            {/* Prize Announcement */}
            {wonPrize && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center animate-in zoom-in-95">
                <p className="text-xs text-amber-300 font-medium">You Won:</p>
                <p className="text-base font-black text-white">{wonPrize}</p>
              </div>
            )}

            {/* Spin CTA Button */}
            <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>
                  {isSpinning
                    ? 'Spinning the Wheel...'
                    : canFreeSpin
                    ? 'FREE DAILY SPIN!'
                    : 'SPIN AGAIN (150 COINS)'}
                </span>
              </button>
              <span className="text-[11px] text-slate-400">
                {canFreeSpin ? '1 Free spin refreshes daily' : 'Extra spins cost 150 Coins each'}
              </span>
            </div>
          </div>
        )}

        {/* Tab Content: 7-Day Streak */}
        {activeTab === 'streak' && (
          <div className="py-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Current Streak: Day {userProfile.streakDays}/7</span>
              </div>
              <span className="text-xs text-slate-400">
                {canClaimStreak ? 'Ready to claim!' : 'Come back tomorrow'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {STREAK_REWARDS.map((item) => {
                const isClaimed = item.day < userProfile.streakDays;
                const isCurrent = item.day === userProfile.streakDays;
                const isEligibleNow = isCurrent && canClaimStreak;

                return (
                  <div
                    key={item.day}
                    className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                      isEligibleNow
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : isClaimed
                        ? 'bg-emerald-950/30 border-emerald-500/30 opacity-75'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400">Day {item.day}</span>
                    <span className="text-xl my-1">{item.icon}</span>
                    <span className="text-[10px] font-bold text-white line-clamp-1">{item.label}</span>

                    {isClaimed ? (
                      <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    ) : isEligibleNow ? (
                      <button
                        onClick={() => handleClaimStreakDay(item.day)}
                        className="mt-1 w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded shadow"
                      >
                        CLAIM
                      </button>
                    ) : (
                      <span className="mt-1 text-[9px] text-slate-500">Locked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
