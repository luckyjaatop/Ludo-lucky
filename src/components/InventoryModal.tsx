import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Sparkles, Coins, Check, Lock, Palette } from 'lucide-react';
import { audio } from '../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DICE_SKINS = [
  {
    id: 'classic',
    name: 'Classic Ivory',
    cost: 0,
    preview: 'bg-gradient-to-br from-white via-amber-50 to-amber-100 border-2 border-amber-300 text-slate-800',
    description: 'Polished bone ivory with royal crimson pips',
  },
  {
    id: 'ruby',
    name: 'Ruby Flame',
    cost: 600,
    preview: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 border-2 border-amber-400 text-amber-200',
    description: 'Forged from fiery dragon crystals with radiant amber pips',
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    cost: 1200,
    preview: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-2 border-yellow-200 text-amber-950',
    description: 'Pure 24k gold bullion with polished obsidian pips',
  },
  {
    id: 'diamond',
    name: 'Diamond Ice',
    cost: 2000,
    preview: 'bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border-2 border-cyan-200 text-cyan-100',
    description: 'Glacial diamond crystal infused with electric starlight',
  },
];

const PAWN_SKINS = [
  {
    id: 'classic',
    name: 'Classic Pawn',
    cost: 0,
    description: 'Standard polished tournament pawn',
  },
  {
    id: 'neon',
    name: 'Neon Crystal',
    cost: 700,
    description: 'Luminescent energy token with soft prismatic glow',
  },
  {
    id: 'royal',
    name: 'Crown Monarch',
    cost: 1500,
    description: 'Topped with a miniature golden imperial crown',
  },
  {
    id: 'mecha',
    name: 'Aegis Sentinel',
    cost: 2200,
    description: 'Futuristic reinforced armored token',
  },
];

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, equipDice, equipPawn, buyDiceSkin, buyPawnSkin } = useGame();
  const [activeTab, setActiveTab] = useState<'dice' | 'pawns'>('dice');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">Royal Armory & Skins</h2>
              <p className="text-xs text-amber-400/90 font-medium">Equip custom dice & prestige pawns</p>
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
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'dice' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎲 Dice Skins
          </button>
          <button
            onClick={() => setActiveTab('pawns')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pawns' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ♟️ Pawn Skins
          </button>
        </div>

        {/* Tab Content: Dice */}
        {activeTab === 'dice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
            {DICE_SKINS.map((skin) => {
              const isUnlocked = userProfile.unlockedDice.includes(skin.id);
              const isEquipped = userProfile.equippedDice === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-slate-900/40 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md ${skin.preview}`}>
                      <span>6</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{skin.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{skin.description}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800">
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{skin.cost}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
                    )}

                    {isEquipped ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Check className="w-3.5 h-3.5" /> EQUIPPED
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => equipDice(skin.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        EQUIP
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!buyDiceSkin(skin.id, skin.cost)) {
                            alert('Not enough coins to unlock this skin!');
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black rounded-lg shadow-md transition-all flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> UNLOCK
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content: Pawns */}
        {activeTab === 'pawns' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
            {PAWN_SKINS.map((skin) => {
              const isUnlocked = userProfile.unlockedPawns.includes(skin.id);
              const isEquipped = userProfile.equippedPawn === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-slate-900/40 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-sky-500 border border-white/40 flex items-center justify-center text-xl shadow-md">
                      <span>♟️</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{skin.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{skin.description}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800">
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{skin.cost}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
                    )}

                    {isEquipped ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Check className="w-3.5 h-3.5" /> EQUIPPED
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => equipPawn(skin.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        EQUIP
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!buyPawnSkin(skin.id, skin.cost)) {
                            alert('Not enough coins to unlock this pawn skin!');
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black rounded-lg shadow-md transition-all flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> UNLOCK
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
