import React from 'react';
import { UserProfile, GameMode } from '../types/ludo';
import {
  Globe,
  Users,
  Bot,
  Gamepad2,
  Gift,
  Target,
  Trophy,
  Palette,
  MessageSquare,
  Settings,
  Coins,
  Sparkles,
  BookOpen,
  Flame,
  Plus,
  Play,
  Zap,
} from 'lucide-react';
import { audio } from '../utils/audio';

const CROWN_EMBLEM_IMG = '/src/assets/images/ludo_crown_emblem_1794301869451.jpg';
const LUCKY_WHEEL_IMG = '/src/assets/images/ludo_lucky_wheel_1794301863461.jpg';

interface HomeLobbyProps {
  userProfile: UserProfile;
  onlineCount: number;
  onSelectMode: (mode: GameMode) => void;
  onOpenFriendsLobby: () => void;
  onOpenDailyRewards: () => void;
  onOpenQuests: () => void;
  onOpenArmory: () => void;
  onOpenLeaderboard: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
}

export const HomeLobby: React.FC<HomeLobbyProps> = ({
  userProfile,
  onlineCount,
  onSelectMode,
  onOpenFriendsLobby,
  onOpenDailyRewards,
  onOpenQuests,
  onOpenArmory,
  onOpenLeaderboard,
  onOpenChat,
  onOpenSettings,
  onOpenRules,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const canFreeSpin = userProfile.lastDailySpinDate !== todayStr;
  const canClaimStreak = userProfile.lastStreakClaimDate !== todayStr;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto select-none p-3 sm:p-5 z-20">
      {/* 1. TOP STATUS & WALLET BAR */}
      <header className="w-full flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* Profile Card on Left */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900/90 border-2 border-amber-400/80 shadow-lg cursor-pointer hover:border-yellow-300 transition-all group"
        >
          {/* Avatar with Level Badge */}
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-300 shadow-md bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
              <img
                src={CROWN_EMBLEM_IMG}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black rounded-full shadow border border-white">
              {userProfile.level}
            </span>
          </div>

          <div className="flex flex-col text-left truncate max-w-[90px] sm:max-w-[130px]">
            <span className="text-xs font-black text-white truncate font-display leading-tight">
              {userProfile.name}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
              <Zap className="w-3 h-3 text-sky-400" />
              <span>Lv.{userProfile.level}</span>
            </div>
          </div>
        </div>

        {/* Currency Pills in Center/Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gold Coins Pill */}
          <div
            onClick={onOpenDailyRewards}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-slate-900/90 border-2 border-amber-400/80 shadow-md cursor-pointer hover:border-amber-300 transition-all"
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-300 tabular-nums">
              {userProfile.coins.toLocaleString()}
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center text-xs font-black shadow ml-1">
              +
            </span>
          </div>

          {/* Diamonds / Gems Pill */}
          <div
            onClick={onOpenDailyRewards}
            className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-slate-900/90 border-2 border-cyan-400/80 shadow-md cursor-pointer hover:border-cyan-300 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="text-xs font-black text-cyan-300 tabular-nums">
              {userProfile.gems.toLocaleString()}
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center text-xs font-black shadow ml-1">
              +
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 sm:p-2.5 rounded-full bg-slate-900/90 border-2 border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 shadow-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. CENTER STAGE: LOGO & 4 BIG GAME MODE TILES */}
      <main className="w-full max-w-4xl mx-auto my-auto py-3 sm:py-5 flex flex-col items-center">
        {/* Ludo King Banner Header */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-400" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-[11px] font-black text-amber-300 tracking-widest uppercase">
            👑 ROYAL TOURNAMENT
          </div>
          <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {/* 4 ICONIC LUDO KING MODE CARDS IN 2x2 GRID */}
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
          {/* Card 1: PLAY ONLINE */}
          <button
            onClick={() => {
              audio.playButton();
              onSelectMode('online');
            }}
            className="group relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-[#1e40af] via-[#1d4ed8] to-[#172554] border-3 border-sky-300/80 shadow-[0_12px_30px_rgba(30,64,175,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all hover:scale-[1.02]"
          >
            {/* Gloss light reflection */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 border-2 border-white/80 shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
            </div>

            <h3 className="relative text-sm sm:text-lg font-black text-white uppercase tracking-wide drop-shadow font-display">
              Play Online
            </h3>
            <p className="relative text-[10px] sm:text-xs text-sky-200 font-semibold mt-0.5">
              Multiplayer Worldwide
            </p>

            <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-950/60 border border-sky-400/60 text-[10px] font-black text-sky-300 tracking-wider">
              2 - 4 PLAYERS
            </span>
          </button>

          {/* Card 2: PLAY WITH FRIENDS */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenFriendsLobby();
            }}
            className="group relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-[#15803d] via-[#16a34a] to-[#052e16] border-3 border-emerald-300/80 shadow-[0_12px_30px_rgba(21,128,61,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all hover:scale-[1.02]"
          >
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-700 border-2 border-white/80 shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
            </div>

            <h3 className="relative text-sm sm:text-lg font-black text-white uppercase tracking-wide drop-shadow font-display">
              Play Friends
            </h3>
            <p className="relative text-[10px] sm:text-xs text-emerald-200 font-semibold mt-0.5">
              Private Code Table
            </p>

            <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-950/60 border border-emerald-400/60 text-[10px] font-black text-emerald-300 tracking-wider">
              ROOM CODE
            </span>
          </button>

          {/* Card 3: VS COMPUTER */}
          <button
            onClick={() => {
              audio.playButton();
              onSelectMode('vs_bot');
            }}
            className="group relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-[#b91c1c] via-[#dc2626] to-[#450a0a] border-3 border-rose-300/80 shadow-[0_12px_30px_rgba(185,28,28,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all hover:scale-[1.02]"
          >
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-rose-400 to-red-700 border-2 border-white/80 shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
            </div>

            <h3 className="relative text-sm sm:text-lg font-black text-white uppercase tracking-wide drop-shadow font-display">
              VS Computer
            </h3>
            <p className="relative text-[10px] sm:text-xs text-rose-200 font-semibold mt-0.5">
              Tactical AI Kings
            </p>

            <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-950/60 border border-rose-400/60 text-[10px] font-black text-rose-300 tracking-wider">
              OFFLINE / SOLO
            </span>
          </button>

          {/* Card 4: PASS N PLAY */}
          <button
            onClick={() => {
              audio.playButton();
              onSelectMode('local');
            }}
            className="group relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-[#b45309] via-[#d97706] to-[#451a03] border-3 border-amber-300/80 shadow-[0_12px_30px_rgba(180,83,9,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] flex flex-col items-center justify-between text-center cursor-pointer active:scale-95 transition-all hover:scale-[1.02]"
          >
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-600 border-2 border-white/80 shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-950 drop-shadow" />
            </div>

            <h3 className="relative text-sm sm:text-lg font-black text-white uppercase tracking-wide drop-shadow font-display">
              Pass N Play
            </h3>
            <p className="relative text-[10px] sm:text-xs text-amber-200 font-semibold mt-0.5">
              Same Device Board
            </p>

            <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-950/60 border border-amber-400/60 text-[10px] font-black text-amber-300 tracking-wider">
              FAMILY & LOCAL
            </span>
          </button>
        </div>

        {/* 3. FLOATING INCENTIVES: LUCKY WHEEL & 7-DAY STREAK BANNER */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 sm:mt-4">
          {/* Lucky Wheel Widget */}
          <div
            onClick={onOpenDailyRewards}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-400/60 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-300 shadow-md shrink-0">
                <img
                  src={LUCKY_WHEEL_IMG}
                  alt="Lucky Wheel"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-wide font-display">
                  Fortune Spin
                </h4>
                <p className="text-[10px] text-amber-300/90 font-medium">Win up to 2,500 Coins!</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
              {canFreeSpin ? 'FREE SPIN' : 'SPIN'}
            </span>
          </div>

          {/* 7-Day Streak Widget */}
          <div
            onClick={onOpenDailyRewards}
            className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/70 border-2 border-orange-500/50 shadow-lg flex items-center justify-between cursor-pointer hover:border-orange-400 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-orange-300 shadow-md flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-wide font-display">
                  Daily Bonus
                </h4>
                <p className="text-[10px] text-orange-300 font-medium">Day {userProfile.streakDays}/7 Streak</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
              {canClaimStreak ? 'CLAIM' : 'STREAK'}
            </span>
          </div>
        </div>
      </main>

      {/* 4. BOTTOM DOCK / NAV BAR */}
      <footer className="w-full max-w-4xl mx-auto pt-2 border-t border-amber-500/20">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {/* Shop / Armory */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenArmory();
            }}
            className="py-2 px-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
          >
            <Palette className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Armory</span>
          </button>

          {/* Missions */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenQuests();
            }}
            className="py-2 px-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
          >
            <Target className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Missions</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenLeaderboard();
            }}
            className="py-2 px-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Rankings</span>
          </button>

          {/* Global Chat */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenChat();
            }}
            className="relative py-2 px-1 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-amber-400 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
          >
            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Chat</span>
            <span className="absolute -top-1 -right-1 px-1 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full tabular-nums">
              {onlineCount}
            </span>
          </button>

          {/* Rules */}
          <button
            onClick={() => {
              audio.playButton();
              onOpenRules();
            }}
            className="py-2 px-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Rules</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
