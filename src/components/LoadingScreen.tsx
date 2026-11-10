import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../utils/audio';

const CROWN_EMBLEM_IMG = '/src/assets/images/ludo_crown_emblem_1794301869451.jpg';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_TIPS = [
  'Polishing the golden tournament dice...',
  'Setting up royal 15x15 boards...',
  'Connecting to live multiplayer arena...',
  'Charging lucky star safe zones...',
  'Preparing daily rewards & fortune wheel...',
  'All kings assembled! Ready to roll!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(audio.getMuted());

  useEffect(() => {
    // Progress interval 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        // Realistic game loader progression
        const increment = Math.random() > 0.6 ? 7 : Math.random() > 0.3 ? 4 : 2;
        return Math.min(100, prev + increment);
      });
    }, 90);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [onComplete]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audio.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <div
      onClick={() => {
        if (progress >= 85) onComplete();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-gradient-to-b from-[#0a1128] via-[#001f54] to-[#03071e]"
    >
      {/* Background ambient royal spotlights */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header info & Sound toggle */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-black text-amber-300 tracking-wider">
            OFFICIAL EDITION
          </span>
          <span className="text-[11px] text-slate-400">v8.4.2</span>
        </div>

        <button
          onClick={toggleSound}
          aria-label="Toggle Sound"
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Central Brand Lockup */}
      <div className="flex flex-col items-center text-center my-auto z-10 animate-in zoom-in-95 duration-500">
        {/* Glowing Crown Mascot with Royal Aura */}
        <div className="relative mb-5">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 opacity-40 blur-xl animate-pulse" />
          <img
            src={CROWN_EMBLEM_IMG}
            alt="Ludo King Crown"
            className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-amber-300 shadow-[0_20px_50px_rgba(245,158,11,0.6)] object-cover transform hover:scale-105 transition-transform"
          />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[11px] font-black tracking-widest uppercase shadow-md border border-white/60 whitespace-nowrap">
            👑 KING OF KINGS
          </div>
        </div>

        {/* 3D Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-wide font-display uppercase">
          LUDO KING
        </h1>
        <p className="text-xs sm:text-sm font-black text-amber-200/90 tracking-[0.25em] uppercase mt-1 drop-shadow">
          ROYAL TOURNAMENT ARENA
        </p>

        {/* 4 Colored Token Gems preview */}
        <div className="flex items-center gap-3 mt-4">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] border border-white" />
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border border-white" />
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] border border-white" />
          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)] border border-white" />
        </div>
      </div>

      {/* Bottom Loading Progress Bar & Dynamic Tip */}
      <div className="w-full max-w-md flex flex-col items-center gap-2.5 z-10">
        {/* Loading tip text */}
        <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium h-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="animate-in fade-in duration-300">{LOADING_TIPS[tipIndex]}</span>
        </div>

        {/* The Golden Progress Bar */}
        <div className="w-full h-4 sm:h-5 rounded-full bg-slate-950/80 border-2 border-amber-400/80 p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(0,0,0,0.9)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(250,204,21,0.8)] transition-all duration-200 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Percentage Readout */}
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
          <span>Loading assets...</span>
          <span className="text-amber-300 font-mono text-xs tabular-nums">{progress}%</span>
        </div>

        {/* Tap to skip hint */}
        <p className="text-[10px] text-slate-500 tracking-wide mt-1">
          {progress >= 85 ? 'Click or Tap to Enter Arena' : '© Ludo King Royal Arena · All Rights Reserved'}
        </p>
      </div>
    </div>
  );
};
