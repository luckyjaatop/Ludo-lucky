import { PlayerColor, Token, Player, GameState, GameMode } from '../types/ludo';

export interface GridCoord {
  r: number; // 0..14 (row)
  c: number; // 0..14 (col)
}

// 52 tiles along the outer track in clockwise sequence starting from Red's entry point (6, 1)
export const TRACK_COORDS: GridCoord[] = [
  // Red zone heading right and turning up
  { r: 6, c: 1 },  // 0  [Red Start - Safe]
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8  [Safe Star]
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11
  { r: 0, c: 8 },  // 12

  // Green zone heading down and turning right
  { r: 1, c: 8 },  // 13 [Green Start - Safe]
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21 [Safe Star]
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25

  // Yellow zone heading left and turning down
  { r: 8, c: 13 }, // 26 [Yellow Start - Safe]
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34 [Safe Star]
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38

  // Blue zone heading up and turning left
  { r: 13, c: 6 }, // 39 [Blue Start - Safe]
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47 [Safe Star]
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50
  { r: 6, c: 0 },  // 51
];

// Start tile indices on TRACK_COORDS for each player color
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe spots on the 52-tile track
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

// 5 home corridor tiles for each color, leading up to the center triangle
export const HOME_CORRIDORS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 },
    { r: 7, c: 6 }, // Goal
  ],
  green: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 },
    { r: 6, c: 7 }, // Goal
  ],
  yellow: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 },
    { r: 7, c: 8 }, // Goal
  ],
  blue: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9, c: 7 },
    { r: 8, c: 7 }, // Goal
  ],
};

// Yard spawn positions (approximate grid row/col inside the player's 6x6 base)
export const YARD_POSITIONS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { r: 1.8, c: 1.8 },
    { r: 1.8, c: 3.8 },
    { r: 3.8, c: 1.8 },
    { r: 3.8, c: 3.8 },
  ],
  green: [
    { r: 1.8, c: 10.8 },
    { r: 1.8, c: 12.8 },
    { r: 3.8, c: 10.8 },
    { r: 3.8, c: 12.8 },
  ],
  yellow: [
    { r: 10.8, c: 10.8 },
    { r: 10.8, c: 12.8 },
    { r: 12.8, c: 10.8 },
    { r: 12.8, c: 12.8 },
  ],
  blue: [
    { r: 10.8, c: 1.8 },
    { r: 10.8, c: 3.8 },
    { r: 12.8, c: 1.8 },
    { r: 12.8, c: 3.8 },
  ],
};

/**
 * Returns grid coordinates for a given token based on its step.
 * step: -1 = Yard
 * step: 0..50 = Main Track (from color's starting tile)
 * step: 51..56 = Home corridor tiles
 * step: 57 = Home victory slot
 */
export function getTokenCoordinate(token: Token): GridCoord {
  if (token.step < 0) {
    return YARD_POSITIONS[token.color][token.id];
  }

  if (token.step <= 50) {
    const startIdx = COLOR_START_INDEX[token.color];
    const trackIdx = (startIdx + token.step) % 52;
    return TRACK_COORDS[trackIdx];
  }

  // Home corridor
  const corridorStep = token.step - 51;
  const corridor = HOME_CORRIDORS[token.color];
  if (corridorStep < corridor.length) {
    return corridor[corridorStep];
  }

  // Home center
  return corridor[corridor.length - 1];
}

/**
 * Converts a player's relative step (0..50) into an absolute index on TRACK_COORDS (0..51).
 */
export function getAbsoluteTrackIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > 50) return null;
  const startIdx = COLOR_START_INDEX[color];
  return (startIdx + step) % 52;
}

/**
 * Checks if a tile on the main track is safe from captures.
 */
export function isSafeSquare(color: PlayerColor, step: number): boolean {
  if (step > 50) return true; // All home corridor steps are protected
  if (step < 0) return true;  // Yard is safe
  const absIdx = getAbsoluteTrackIndex(color, step);
  if (absIdx === null) return true;
  return SAFE_TRACK_INDICES.has(absIdx);
}

/**
 * Returns the list of token IDs for the current player that can legally move with the rolled dice value.
 */
export function getValidMoves(player: Player, diceValue: number): number[] {
  const valid: number[] = [];

  for (const token of player.tokens) {
    if (token.isHome) continue;

    // In Yard: can only exit with a 6
    if (token.step === -1) {
      if (diceValue === 6) {
        valid.push(token.id);
      }
      continue;
    }

    // On track or corridor: cannot overshoot Home (step 57)
    const targetStep = token.step + diceValue;
    if (targetStep <= 57) {
      valid.push(token.id);
    }
  }

  return valid;
}

/**
 * Apply a move to a token in the game state.
 * Returns information about whether an opponent token was captured, whether the token reached home,
 * and whether the player earns a bonus roll.
 */
export function applyMove(
  gameState: GameState,
  tokenId: number
): {
  capturedToken: { color: PlayerColor; id: number } | null;
  reachedHome: boolean;
  bonusRoll: boolean;
} {
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const token = currentPlayer.tokens.find((t) => t.id === tokenId);
  const dice = gameState.diceValue || 0;

  if (!token) {
    return { capturedToken: null, reachedHome: false, bonusRoll: false };
  }

  let capturedToken: { color: PlayerColor; id: number } | null = null;
  let reachedHome = false;
  let bonusRoll = dice === 6;

  if (token.step === -1) {
    // Exit yard onto start square
    token.step = 0;
    token.isYard = false;
  } else {
    token.step += dice;
    if (token.step === 57) {
      token.isHome = true;
      reachedHome = true;
      currentPlayer.tokensAtHome += 1;
      bonusRoll = true; // Bonus roll for reaching home
    }
  }

  // Check captures if on main track
  if (token.step >= 0 && token.step <= 50) {
    const landingAbsIdx = getAbsoluteTrackIndex(token.color, token.step);

    if (landingAbsIdx !== null && !SAFE_TRACK_INDICES.has(landingAbsIdx)) {
      // Check all other players' tokens
      for (const opponent of gameState.players) {
        if (opponent.color === token.color) continue;

        for (const oppToken of opponent.tokens) {
          if (oppToken.step >= 0 && oppToken.step <= 50) {
            const oppAbsIdx = getAbsoluteTrackIndex(oppToken.color, oppToken.step);
            if (oppAbsIdx === landingAbsIdx) {
              // Captured! Send back to yard
              oppToken.step = -1;
              oppToken.isYard = true;
              capturedToken = { color: opponent.color, id: oppToken.id };
              bonusRoll = true; // Bonus roll for capture
              break;
            }
          }
        }
        if (capturedToken) break;
      }
    }
  }

  return { capturedToken, reachedHome, bonusRoll };
}

/**
 * Intelligent Bot Move Selector.
 * Analyzes legal moves and scores them based on tactical priorities:
 * 1. Capture enemy token (+100)
 * 2. Reach Home slot (+80)
 * 3. Escape dangerous square (+50)
 * 4. Free new token from yard on 6 (+45)
 * 5. Land on safe star (+35)
 * 6. Move furthest active token forward (+15)
 */
export function chooseBotMove(
  gameState: GameState,
  validMoveIds: number[]
): number {
  if (validMoveIds.length === 1) return validMoveIds[0];

  const botPlayer = gameState.players[gameState.currentTurnIndex];
  const dice = gameState.diceValue || 0;

  let bestMoveId = validMoveIds[0];
  let highestScore = -Infinity;

  for (const tokenId of validMoveIds) {
    const token = botPlayer.tokens.find((t) => t.id === tokenId)!;
    let score = 0;

    // Moving out of yard
    if (token.step === -1) {
      // Bringing more tokens onto the board is good
      score += 45;
    } else {
      const targetStep = token.step + dice;

      // Reaching home!
      if (targetStep === 57) {
        score += 85;
      } else if (targetStep > 50) {
        // Entering safe home corridor
        score += 40;
      } else {
        const targetAbs = getAbsoluteTrackIndex(token.color, targetStep);

        // Capture check
        if (targetAbs !== null && !SAFE_TRACK_INDICES.has(targetAbs)) {
          let canCapture = false;
          for (const opp of gameState.players) {
            if (opp.color === token.color) continue;
            for (const ot of opp.tokens) {
              const otAbs = getAbsoluteTrackIndex(opp.color, ot.step);
              if (otAbs === targetAbs) {
                canCapture = true;
                break;
              }
            }
            if (canCapture) break;
          }
          if (canCapture) {
            score += 110; // High priority!
          }
        }

        // Landing on safe star
        if (targetAbs !== null && SAFE_TRACK_INDICES.has(targetAbs)) {
          score += 35;
        }

        // Current position vulnerability check: are we being chased?
        const currentAbs = getAbsoluteTrackIndex(token.color, token.step);
        if (currentAbs !== null && !SAFE_TRACK_INDICES.has(currentAbs)) {
          score += 20; // Moving away from vulnerability
        }

        // Prefer advancing tokens further along
        score += targetStep * 0.5;
      }
    }

    // Add tiny jitter to feel natural
    score += Math.random() * 2;

    if (score > highestScore) {
      highestScore = score;
      bestMoveId = tokenId;
    }
  }

  return bestMoveId;
}

/**
 * Helper to initialize a default 2 to 4 player setup.
 */
export function createInitialPlayers(
  colors: PlayerColor[],
  mode: GameMode,
  localPlayerName: string = 'You'
): Player[] {
  return colors.map((color, index) => {
    let type: 'human' | 'bot' | 'remote' = 'human';

    if (mode === 'vs_bot') {
      type = index === 0 ? 'human' : 'bot';
    } else if (mode === 'online') {
      type = index === 0 ? 'human' : 'remote';
    }

    const defaultNames: Record<PlayerColor, string> = {
      red: 'Red Emperor',
      green: 'Green Knight',
      yellow: 'Yellow Monarch',
      blue: 'Blue Champion',
    };

    return {
      id: `p-${color}-${index}`,
      name: index === 0 && (mode === 'vs_bot' || mode === 'online') ? localPlayerName : defaultNames[color],
      color,
      type,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color,
        step: -1,
        isHome: false,
        isYard: true,
      })),
      tokensAtHome: 0,
      avatarSeed: `avatar-${color}-${index}`,
      isReady: true,
    };
  });
}
