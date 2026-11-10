import React from 'react';
import { GameState, PlayerColor, Token } from '../types/ludo';
import { getTokenCoordinate, SAFE_TRACK_INDICES, getAbsoluteTrackIndex } from '../utils/ludoEngine';
import { Crown, Star } from 'lucide-react';

interface LudoBoardProps {
  gameState: GameState;
  onTokenClick: (tokenId: number) => void;
  pawnSkin?: string;
  isOnlineGame?: boolean;
  myColor?: PlayerColor;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  onTokenClick,
  pawnSkin = 'classic',
  isOnlineGame = false,
  myColor,
}) => {
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn = !isOnlineGame || Boolean(myColor && currentPlayer?.color === myColor);

  // Group tokens by their grid coordinate for stacking display
  const tokenMap: Record<string, { token: Token; isCurrentTurn: boolean; isValid: boolean }[]> = {};

  gameState.players.forEach((player, pIdx) => {
    const isThisPlayerTurn = pIdx === gameState.currentTurnIndex;
    player.tokens.forEach((token) => {
      if (token.isHome) return; // Rendered in center

      const coord = getTokenCoordinate(token);
      // Key format: r_c
      const key = `${coord.r.toFixed(1)}_${coord.c.toFixed(1)}`;
      if (!tokenMap[key]) tokenMap[key] = [];

      const isValid = Boolean(
        isThisPlayerTurn &&
        isMyTurn &&
        gameState.isDiceRolled &&
        gameState.validTokenMoves.includes(token.id)
      );

      tokenMap[key].push({ token, isCurrentTurn: isThisPlayerTurn, isValid });
    });
  });

  // Base quadrant render helper
  const renderYard = (color: PlayerColor, label: string) => {
    const player = gameState.players.find((p) => p.color === color);
    const isTurn = currentPlayer?.color === color;

    const colorConfig: Record<
      PlayerColor,
      { bg: string; border: string; accent: string; text: string; ring: string }
    > = {
      red: {
        bg: 'from-rose-600 to-red-800',
        border: 'border-red-950/40',
        accent: 'bg-rose-500',
        text: 'text-rose-100',
        ring: 'ring-rose-400',
      },
      green: {
        bg: 'from-emerald-600 to-green-800',
        border: 'border-emerald-950/40',
        accent: 'bg-emerald-500',
        text: 'text-emerald-100',
        ring: 'ring-emerald-400',
      },
      yellow: {
        bg: 'from-amber-400 to-yellow-600',
        border: 'border-amber-950/40',
        accent: 'bg-amber-400',
        text: 'text-amber-950',
        ring: 'ring-amber-300',
      },
      blue: {
        bg: 'from-sky-500 to-blue-700',
        border: 'border-blue-950/40',
        accent: 'bg-sky-500',
        text: 'text-sky-100',
        ring: 'ring-sky-400',
      },
    };

    const cfg = colorConfig[color];

    return (
      <div
        className={`relative w-full h-full rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-[inset_0_4px_12px_rgba(0,0,0,0.35)] bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border} transition-all duration-300 ${
          isTurn ? `ring-4 ${cfg.ring} shadow-xl scale-[1.01]` : 'opacity-95'
        }`}
      >
        {/* Yard Header: Player Name + Home Tokens counter */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            <span className={`text-[11px] sm:text-xs font-bold truncate ${cfg.text}`}>
              {player ? player.name : label}
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[10px] font-bold text-white shrink-0">
            <Crown className="w-3 h-3 text-amber-300" />
            <span>{player?.tokensAtHome || 0}/4</span>
          </div>
        </div>

        {/* Inner white arena with 4 yard stands */}
        <div className="relative mx-auto my-auto w-[82%] h-[82%] bg-gradient-to-br from-white to-slate-100 rounded-xl shadow-inner border border-black/10 grid grid-cols-2 grid-rows-2 p-2 gap-2">
          {[0, 1, 2, 3].map((slotIdx) => {
            const tokenInSlot = player?.tokens.find((t) => t.id === slotIdx && t.step === -1);
            const isValid = Boolean(
              isTurn &&
              isMyTurn &&
              gameState.isDiceRolled &&
              tokenInSlot &&
              gameState.validTokenMoves.includes(tokenInSlot.id)
            );

            return (
              <div
                key={slotIdx}
                className="relative rounded-full bg-slate-200/90 border border-slate-300 shadow-inner flex items-center justify-center"
              >
                {tokenInSlot && (
                  <button
                    onClick={() => isValid && onTokenClick(tokenInSlot.id)}
                    disabled={!isValid}
                    aria-label={`Player ${color} Token ${slotIdx + 1}`}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transform transition-transform duration-200 cursor-pointer ${
                      isValid
                        ? 'animate-token-pulse cursor-pointer hover:scale-110 ring-4 ring-yellow-400 z-30'
                        : 'cursor-default'
                    }`}
                  >
                    {renderPawnPiece(color, pawnSkin, isValid)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render decorative pawn visual
  const renderPawnPiece = (color: PlayerColor, skin: string, isValid: boolean) => {
    const colorStyles: Record<PlayerColor, string> = {
      red: 'from-rose-500 via-red-600 to-rose-800 text-rose-100',
      green: 'from-emerald-400 via-emerald-600 to-emerald-800 text-emerald-100',
      yellow: 'from-amber-300 via-amber-500 to-yellow-600 text-amber-950',
      blue: 'from-sky-400 via-blue-600 to-blue-800 text-sky-100',
    };

    const gradient = colorStyles[color];

    return (
      <div
        className={`relative w-full h-full rounded-full flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] bg-gradient-to-br ${gradient} border-2 border-white/90`}
      >
        {/* Token top cap */}
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/70 shadow-sm flex items-center justify-center">
          {skin === 'royal' ? (
            <Crown className="w-2 h-2 text-amber-500" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
          )}
        </div>
      </div>
    );
  };

  // Render individual track grid cell (6..8 x 0..14 or 0..14 x 6..8)
  const renderTrackCell = (r: number, c: number) => {
    // Determine cell characteristics
    let bg = 'bg-white';
    let isSafe = false;
    let isArrow = false;
    let arrowColor = '';

    // Star coordinates
    if (
      (r === 2 && c === 6) ||
      (r === 6 && c === 12) ||
      (r === 12 && c === 8) ||
      (r === 8 && c === 2)
    ) {
      isSafe = true;
    }

    // Start squares (safe + colored)
    if (r === 6 && c === 1) {
      bg = 'bg-rose-500 text-white';
      isSafe = true;
      isArrow = true;
      arrowColor = 'red';
    } else if (r === 1 && c === 8) {
      bg = 'bg-emerald-500 text-white';
      isSafe = true;
      isArrow = true;
      arrowColor = 'green';
    } else if (r === 8 && c === 13) {
      bg = 'bg-amber-400 text-amber-950';
      isSafe = true;
      isArrow = true;
      arrowColor = 'yellow';
    } else if (r === 13 && c === 6) {
      bg = 'bg-sky-500 text-white';
      isSafe = true;
      isArrow = true;
      arrowColor = 'blue';
    }

    // Home corridors
    if (r === 7 && c >= 1 && c <= 5) bg = 'bg-rose-500/90 text-white'; // Red corridor
    if (c === 7 && r >= 1 && r <= 5) bg = 'bg-emerald-500/90 text-white'; // Green corridor
    if (r === 7 && c >= 9 && c <= 13) bg = 'bg-amber-400/90 text-amber-950'; // Yellow corridor
    if (c === 7 && r >= 9 && r <= 13) bg = 'bg-sky-500/90 text-white'; // Blue corridor

    // Find any active tokens sitting on this exact tile
    const key = `${r.toFixed(1)}_${c.toFixed(1)}`;
    const tokensOnCell = tokenMap[key] || [];

    return (
      <div
        key={`${r}-${c}`}
        className={`relative w-full h-full border border-slate-300/80 flex items-center justify-center transition-colors ${bg} shadow-inner`}
      >
        {/* Star Icon for Safe Squares */}
        {isSafe && !isArrow && (
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 drop-shadow-sm opacity-85 pointer-events-none" />
        )}

        {/* Start tile arrow */}
        {isArrow && (
          <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
            <span className="text-[10px] sm:text-xs font-black">★</span>
          </div>
        )}

        {/* Render Tokens on this Cell */}
        {tokensOnCell.length > 0 && (
          <div className="relative w-full h-full flex items-center justify-center">
            {tokensOnCell.map(({ token, isValid }, idx) => {
              const count = tokensOnCell.length;
              // If multiple, slightly offset them
              const offsetX = count > 1 ? (idx - (count - 1) / 2) * 6 : 0;
              const offsetY = count > 1 ? (idx - (count - 1) / 2) * -4 : 0;

              return (
                <button
                  key={token.id + '-' + token.color}
                  onClick={() => isValid && onTokenClick(token.id)}
                  disabled={!isValid}
                  aria-label={`${token.color} token`}
                  className={`absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isValid
                      ? 'animate-token-pulse z-40 cursor-pointer ring-4 ring-yellow-400 hover:scale-125'
                      : 'z-20 cursor-default'
                  }`}
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                  }}
                >
                  {renderPawnPiece(token.color, pawnSkin, isValid)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Center triangle finish zone (rows 6..8, cols 6..8)
  const renderCenterGoal = () => {
    return (
      <div className="relative w-full h-full bg-slate-900 border-2 border-amber-400/80 shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Red Triangle from Left */}
        <div
          className="absolute inset-0 bg-rose-600 shadow-md"
          style={{ clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)' }}
        />
        {/* Green Triangle from Top */}
        <div
          className="absolute inset-0 bg-emerald-600 shadow-md"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)' }}
        />
        {/* Yellow Triangle from Right */}
        <div
          className="absolute inset-0 bg-amber-400 shadow-md"
          style={{ clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)' }}
        />
        {/* Blue Triangle from Bottom */}
        <div
          className="absolute inset-0 bg-sky-600 shadow-md"
          style={{ clipPath: 'polygon(0% 100%, 100% 100%, 50% 50%)' }}
        />

        {/* Central Golden Crown Crest */}
        <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-2 border-amber-200 shadow-lg flex items-center justify-center">
          <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-950 drop-shadow" />
        </div>

        {/* Completed Tokens in Home Display */}
        {gameState.players.map((p) => {
          if (p.tokensAtHome === 0) return null;
          const posConfig: Record<PlayerColor, string> = {
            red: 'left-1 top-1/2 -translate-y-1/2',
            green: 'top-1 left-1/2 -translate-x-1/2',
            yellow: 'right-1 top-1/2 -translate-y-1/2',
            blue: 'bottom-1 left-1/2 -translate-x-1/2',
          };
          return (
            <div
              key={p.color}
              className={`absolute z-20 px-1 py-0.5 rounded-full bg-black/60 text-[9px] font-black text-white flex items-center gap-0.5 ${posConfig[p.color]}`}
            >
              <span>{p.tokensAtHome}</span>
              <Crown className="w-2.5 h-2.5 text-amber-300" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-square rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-amber-900/60 via-amber-950/80 to-slate-950 border-4 border-amber-500/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] select-none">
      {/* 15x15 Ludo Board Grid */}
      <div className="w-full h-full rounded-2xl overflow-hidden grid grid-cols-15 grid-rows-15 bg-white border border-amber-400/40 shadow-inner">
        {/* Top-Left Quadrant: RED YARD (Rows 0..5, Cols 0..5) */}
        <div className="col-start-1 col-end-7 row-start-1 row-end-7">
          {renderYard('red', 'Red')}
        </div>

        {/* Top-Right Quadrant: GREEN YARD (Rows 0..5, Cols 10..15) */}
        <div className="col-start-10 col-end-16 row-start-1 row-end-7">
          {renderYard('green', 'Green')}
        </div>

        {/* Bottom-Right Quadrant: YELLOW YARD (Rows 10..15, Cols 10..15) */}
        <div className="col-start-10 col-end-16 row-start-10 row-end-16">
          {renderYard('yellow', 'Yellow')}
        </div>

        {/* Bottom-Left Quadrant: BLUE YARD (Rows 10..15, Cols 0..5) */}
        <div className="col-start-1 col-end-7 row-start-10 row-end-16">
          {renderYard('blue', 'Blue')}
        </div>

        {/* Center 3x3 Home Triangle (Rows 7..9, Cols 7..9 / index 6..8) */}
        <div className="col-start-7 col-end-10 row-start-7 row-end-10 z-10">
          {renderCenterGoal()}
        </div>

        {/* All Remaining 1x1 Track Squares */}
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            // Check if this (r, c) falls into Yard or Center
            const isRedYard = r < 6 && c < 6;
            const isGreenYard = r < 6 && c >= 9;
            const isYellowYard = r >= 9 && c >= 9;
            const isBlueYard = r >= 9 && c < 6;
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            if (isRedYard || isGreenYard || isYellowYard || isBlueYard || isCenter) {
              return null; // Handled by larger blocks
            }

            return (
              <div
                key={`c-${r}-${c}`}
                style={{ gridRow: r + 1, gridColumn: c + 1 }}
                className="w-full h-full"
              >
                {renderTrackCell(r, c)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
