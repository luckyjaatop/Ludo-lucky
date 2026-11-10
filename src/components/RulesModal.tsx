import React from 'react';
import { X, BookOpen, CheckCircle, Shield, Award, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">How to Play Ludo</h2>
              <p className="text-xs text-amber-400/90 font-medium">Standard International Tournament Rules</p>
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

        <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Entering the Board</h4>
              <p className="text-slate-400">
                You must roll a <strong className="text-amber-400">6</strong> to move a token from your corner Yard onto your starting square.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Extra Bonus Rolls</h4>
              <p className="text-slate-400">
                You get an extra turn whenever you roll a <strong className="text-amber-400">6</strong>, capture an opponent token, or safely guide a token to Home!
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Capturing & Safe Zones</h4>
              <p className="text-slate-400">
                Landing on an opponent's token on normal track squares captures them back to their yard! Squares marked with a <strong className="text-amber-400">★ Star</strong> and starting colored tiles are safe from capture.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Winning Condition</h4>
              <p className="text-slate-400">
                The first player to guide all <strong className="text-white">4 tokens</strong> through the colored home corridor into the central crown is crowned Grand Champion!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
