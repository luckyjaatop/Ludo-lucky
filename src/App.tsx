import React, { useState, useEffect, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import {
  GameState,
  PlayerColor,
  GameMode,
} from './types/ludo';
import {
  createInitialPlayers,
  getValidMoves,
  applyMove,
  chooseBotMove,
} from './utils/ludoEngine';
import { LudoBoard } from './components/LudoBoard';
import { Dice } from './components/Dice';
import { GlobalChat } from './components/GlobalChat';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { QuestsModal } from './components/QuestsModal';
import { InventoryModal } from './components/InventoryModal';
import { LobbyModal } from './components/LobbyModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeLobby } from './components/HomeLobby';
import { ModeSelectModal } from './components/ModeSelectModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { audio } from './utils/audio';
import {
  Volume2,
  VolumeX,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Coins,
  Crown,
} from 'lucide-react';

const CROWN_EMBLEM_IMG = '/src/assets/images/ludo_crown_emblem_1794301869451.jpg';
const TABLE_BACKDROP_IMG = '/src/assets/images/ludo_table_backdrop_1794301864597.jpg';

function LudoGameApp() {
  const {
    userProfile,
    onlineCount,
    isMuted,
    toggleAudio,
    updateProfileName,
    recordStat,
    addCoins,
    addXp,
    currentRoom,
    sendGameAction,
    sendReaction,
    activeReaction,
    remoteGameState,
  } = useGame();

  // Screen States: 'LOADING' -> 'HOME_LOBBY' -> 'PLAYING'
  const [screen, setScreen] = useState<'LOADING' | 'HOME_LOBBY' | 'PLAYING'>('LOADING');

  // Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mode Selection Modal
  const [modeSelectOpen, setModeSelectOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<GameMode>('vs_bot');
  const [activeStakeFee, setActiveStakeFee] = useState<number>(0);

  // Active Game State
  const [gameState, setGameState] = useState<GameState>({
    id: 'game-local',
    mode: 'vs_bot',
    players: createInitialPlayers(['red', 'green', 'yellow', 'blue'], 'vs_bot', userProfile.name),
    currentTurnIndex: 0,
    diceValue: null,
    isDiceRolled: false,
    consecutiveSixes: 0,
    validTokenMoves: [],
    winner: null,
    status: 'idle',
    turnTimeout: 15,
    lastActionMessage: 'Roll the dice to begin the match!',
  });

  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [hasBonusRoll, setHasBonusRoll] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [floatingActionToast, setFloatingActionToast] = useState<string | null>(null);

  // Start lobby music on lobby mount if not muted
  useEffect(() => {
    if (screen === 'HOME_LOBBY') {
      audio.startLobbyMusic();
    } else {
      audio.stopLobbyMusic();
    }
    return () => {
      audio.stopLobbyMusic();
    };
  }, [screen]);

  // Handle remote state sync in online room
  useEffect(() => {
    if (gameState.mode === 'online' && remoteGameState) {
      setGameState(remoteGameState);
    }
  }, [remoteGameState, gameState.mode]);

  const showToast = useCallback((msg: string) => {
    setFloatingActionToast(msg);
    setTimeout(() => {
      setFloatingActionToast(null);
    }, 2500);
  }, []);

  const triggerCameraShake = useCallback(() => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 350);
  }, []);

  const checkVictory = useCallback((state: GameState): PlayerColor | null => {
    for (const p of state.players) {
      if (p.tokensAtHome >= 4) {
        return p.color;
      }
    }
    return null;
  }, []);

  const advanceTurn = useCallback((currentState: GameState, grantBonusRoll: boolean = false) => {
    if (grantBonusRoll) {
      setHasBonusRoll(true);
      setGameState((prev) => ({
        ...prev,
        diceValue: null,
        isDiceRolled: false,
        validTokenMoves: [],
        status: 'idle',
        lastActionMessage: `${currentState.players[currentState.currentTurnIndex].name} earned a Bonus Roll! 🎲`,
      }));
      return;
    }

    setHasBonusRoll(false);
    const nextIndex = (currentState.currentTurnIndex + 1) % currentState.players.length;
    const nextPlayer = currentState.players[nextIndex];

    setGameState((prev) => ({
      ...prev,
      currentTurnIndex: nextIndex,
      diceValue: null,
      isDiceRolled: false,
      consecutiveSixes: 0,
      validTokenMoves: [],
      status: 'idle',
      lastActionMessage: `${nextPlayer.name}'s turn to roll!`,
    }));
  }, []);

  // Roll Dice Action
  const handleRollDice = useCallback(() => {
    if (gameState.isDiceRolled || isDiceRolling || gameState.winner) return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (gameState.mode === 'online' && currentRoom) {
      const myColor = currentRoom.players.find((p) => p.id === userProfile.id)?.color;
      if (currentPlayer.color !== myColor) return;
    }

    setIsDiceRolling(true);
    audio.playDiceRoll();

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setIsDiceRolling(false);

      if (rolled === 6) {
        recordStat('sixesRolled');
      }

      const newConsecutive = rolled === 6 ? gameState.consecutiveSixes + 1 : 0;

      // 3 consecutive sixes penalty rule
      if (newConsecutive >= 3) {
        showToast('Three 6s in a row! Turn forfeited!');
        advanceTurn(gameState, false);
        return;
      }

      const validMoves = getValidMoves(currentPlayer, rolled);

      const nextState: GameState = {
        ...gameState,
        diceValue: rolled,
        isDiceRolled: true,
        consecutiveSixes: newConsecutive,
        validTokenMoves: validMoves,
        lastActionMessage:
          validMoves.length > 0
            ? `${currentPlayer.name} rolled a ${rolled}! Tap a glowing token to move.`
            : `${currentPlayer.name} rolled a ${rolled}. No valid moves available!`,
      };

      setGameState(nextState);

      if (gameState.mode === 'online') {
        sendGameAction('ROLL_DICE', nextState);
      }

      if (validMoves.length === 0) {
        setTimeout(() => {
          advanceTurn(nextState, false);
        }, 1200);
      } else if (validMoves.length === 1 && currentPlayer.type === 'human') {
        setTimeout(() => {
          handleTokenMove(validMoves[0], nextState);
        }, 400);
      }
    }, 450);
  }, [
    gameState,
    isDiceRolling,
    userProfile.id,
    currentRoom,
    advanceTurn,
    recordStat,
    sendGameAction,
    showToast,
  ]);

  // Move Token Action
  const handleTokenMove = useCallback(
    (tokenId: number, activeState: GameState = gameState) => {
      const currentPlayer = activeState.players[activeState.currentTurnIndex];
      const { capturedToken, reachedHome, bonusRoll } = applyMove(activeState, tokenId);

      audio.playPawnHop(activeState.diceValue || 1);

      if (capturedToken) {
        audio.playCapture();
        triggerCameraShake();
        recordStat('tokensCaptured');
        showToast(`💥 ${currentPlayer.name} captured ${capturedToken.color}'s token!`);
      }

      if (reachedHome) {
        audio.playHome();
        showToast(`👑 ${currentPlayer.name} reached Home!`);
      }

      const winner = checkVictory(activeState);
      if (winner) {
        const isMe = currentPlayer.type === 'human';
        activeState.winner = winner;
        activeState.status = 'finished';
        setGameState({ ...activeState });
        recordStat('gamesWon');
        recordStat('gamesPlayed');

        // Winner gets prize pool
        const rewardCoins = activeStakeFee > 0 ? activeStakeFee * 2 : 500;
        addCoins(rewardCoins);
        addXp(350);
        setIsGameOverOpen(true);

        if (activeState.mode === 'online') {
          sendGameAction('GAME_OVER', activeState);
        }
        return;
      }

      setGameState({ ...activeState });

      if (activeState.mode === 'online') {
        sendGameAction('MOVE_TOKEN', activeState);
      }

      setTimeout(() => {
        advanceTurn(activeState, bonusRoll);
      }, 350);
    },
    [
      gameState,
      activeStakeFee,
      checkVictory,
      recordStat,
      addCoins,
      addXp,
      advanceTurn,
      sendGameAction,
      triggerCameraShake,
      showToast,
    ]
  );

  // Automated Smart Bot Turns Loop
  useEffect(() => {
    if (screen !== 'PLAYING' || gameState.winner) return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer?.type !== 'bot') return;

    if (!gameState.isDiceRolled && !isDiceRolling) {
      const rollTimer = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    if (gameState.isDiceRolled && gameState.validTokenMoves.length > 0) {
      const moveTimer = setTimeout(() => {
        const bestMoveId = chooseBotMove(gameState, gameState.validTokenMoves);
        handleTokenMove(bestMoveId);
      }, 750);
      return () => clearTimeout(moveTimer);
    }
  }, [screen, gameState, isDiceRolling, handleRollDice, handleTokenMove]);

  // Handle Mode Open
  const handleSelectMode = (mode: GameMode) => {
    setTargetMode(mode);
    setModeSelectOpen(true);
  };

  // Confirm and start match from ModeSelectModal
  const handleConfirmStartMatch = (
    mode: GameMode,
    playerCount: 2 | 3 | 4,
    entryFee: number,
    playerColor: PlayerColor
  ) => {
    setModeSelectOpen(false);
    setActiveStakeFee(entryFee);

    if (entryFee > 0) {
      addCoins(-entryFee);
    }

    let colors: PlayerColor[] = [];
    if (playerCount === 2) {
      const oppColor: PlayerColor = playerColor === 'red' ? 'yellow' : playerColor === 'yellow' ? 'red' : playerColor === 'green' ? 'blue' : 'green';
      colors = [playerColor, oppColor];
    } else if (playerCount === 3) {
      const all: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const rest = all.filter((c) => c !== playerColor).slice(0, 2);
      colors = [playerColor, ...rest];
    } else {
      const all: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const rest = all.filter((c) => c !== playerColor);
      colors = [playerColor, ...rest];
    }

    const newPlayers = createInitialPlayers(colors, mode, userProfile.name);

    setGameState({
      id: 'game-' + Date.now(),
      mode,
      players: newPlayers,
      currentTurnIndex: 0,
      diceValue: null,
      isDiceRolled: false,
      consecutiveSixes: 0,
      validTokenMoves: [],
      winner: null,
      status: 'idle',
      turnTimeout: 15,
      lastActionMessage: `${newPlayers[0].name}'s turn to roll!`,
    });

    recordStat('gamesPlayed');
    setScreen('PLAYING');
    setIsGameOverOpen(false);
  };

  // Keyboard shortcut Space/Enter to roll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (screen === 'PLAYING') {
          handleRollDice();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleRollDice]);

  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const isOnline = gameState.mode === 'online';
  const myRoomPlayer = currentRoom?.players.find((p) => p.id === userProfile.id);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none font-sans"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(15, 23, 42, 0.75) 0%, rgba(2, 6, 23, 0.98) 100%), url(${TABLE_BACKDROP_IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 1. STARTUP LOADING SCREEN */}
      {screen === 'LOADING' && (
        <LoadingScreen onComplete={() => setScreen('HOME_LOBBY')} />
      )}

      {/* Floating Reaction Emote Overlay */}
      {activeReaction && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-75 duration-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-400 shadow-2xl backdrop-blur-md">
            <span className="text-2xl animate-bounce">{activeReaction.emoji}</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-300 font-bold">{activeReaction.senderName}</span>
              {activeReaction.phrase && (
                <span className="text-xs font-black text-white">{activeReaction.phrase}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action toast banner */}
      {floatingActionToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in slide-in-from-top duration-200">
          <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-xl tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{floatingActionToast}</span>
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC LUDO KING HOME LOBBY */}
      {screen === 'HOME_LOBBY' && (
        <HomeLobby
          userProfile={userProfile}
          onlineCount={onlineCount}
          onSelectMode={handleSelectMode}
          onOpenFriendsLobby={() => setIsLobbyOpen(true)}
          onOpenDailyRewards={() => setIsRewardsOpen(true)}
          onOpenQuests={() => setIsQuestsOpen(true)}
          onOpenArmory={() => setIsArmoryOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {/* 3. IN-GAME BOARD PLAYFIELD */}
      {screen === 'PLAYING' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* In-Game Minimal Top Bar */}
          <div className="relative z-30 w-full px-3 sm:px-6 py-2 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('Leave current battle and return to Main Lobby?')) {
                    setScreen('HOME_LOBBY');
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lobby</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Prize: {activeStakeFee > 0 ? activeStakeFee * 2 : 500} 🪙</span>
              </div>
            </div>

            {/* In-Game Center Title */}
            <div className="flex items-center gap-1.5">
              <img
                src={CROWN_EMBLEM_IMG}
                alt="Crown"
                className="w-5 h-5 rounded-full border border-amber-400"
              />
              <span className="text-xs sm:text-sm font-black text-amber-300 uppercase font-display tracking-wide">
                Ludo King Arena
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                aria-label="Global Chat"
                className="relative p-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 px-1 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full tabular-nums">
                  {onlineCount}
                </span>
              </button>

              <button
                onClick={toggleAudio}
                aria-label="Toggle Sound"
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Playing Field Viewport */}
          <div className="flex-1 relative flex flex-col lg:flex-row items-center justify-center p-2 sm:p-4 gap-4 overflow-hidden z-20">
            {/* Main 15x15 Ludo Board Viewport with Camera Shake */}
            <div
              className={`relative flex items-center justify-center transition-transform ${
                cameraShake ? 'animate-bounce' : ''
              }`}
            >
              <LudoBoard
                gameState={gameState}
                onTokenClick={(tokenId) => handleTokenMove(tokenId)}
                pawnSkin={userProfile.equippedPawn}
                isOnlineGame={isOnline}
                myColor={myRoomPlayer?.color}
              />
            </div>

            {/* Right/Bottom Tactical Action Cluster */}
            <div className="w-full max-w-[340px] flex flex-col items-center gap-2.5">
              {/* Active Turn Header Pill */}
              <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full shadow-md animate-pulse ${
                      currentPlayer.color === 'red'
                        ? 'bg-rose-500'
                        : currentPlayer.color === 'green'
                        ? 'bg-emerald-500'
                        : currentPlayer.color === 'yellow'
                        ? 'bg-amber-400'
                        : 'bg-sky-500'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{currentPlayer.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {currentPlayer.type === 'bot' ? 'Smart AI Bot' : 'Active Player'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {gameState.isDiceRolled ? 'SELECT TOKEN' : 'ROLL DICE'}
                  </span>
                </div>
              </div>

              {/* 3D Rolling Dice Card */}
              <div className="w-full p-3.5 sm:p-4 rounded-3xl bg-slate-900/85 border border-amber-500/30 backdrop-blur-md flex flex-col items-center justify-center shadow-xl">
                <Dice
                  value={gameState.diceValue}
                  isRolling={isDiceRolling}
                  disabled={
                    gameState.isDiceRolled ||
                    currentPlayer.type === 'bot' ||
                    (isOnline && myRoomPlayer?.color !== currentPlayer.color)
                  }
                  onRoll={handleRollDice}
                  playerColor={currentPlayer.color}
                  skin={userProfile.equippedDice}
                  hasBonusRoll={hasBonusRoll}
                />

                <p className="text-[11px] text-slate-300 font-medium text-center mt-2.5 max-w-[240px] line-clamp-2">
                  {gameState.lastActionMessage}
                </p>
              </div>

              {/* Quick In-Game Emote Reactions */}
              <div className="w-full p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-around">
                {['👑', '🔥', '🏆', '👏', '🎲'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji, 'Battle Chanted!')}
                    className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-90 text-sm flex items-center justify-center transition-all shadow"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Restart Button */}
              <button
                onClick={() => handleConfirmStartMatch(gameState.mode, gameState.players.length as 2 | 3 | 4, activeStakeFee, gameState.players[0].color)}
                className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Table</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Global Live Chat */}
      <GlobalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* 2. Daily Rewards (Lucky Wheel & 7-Day Streak) */}
      <DailyRewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />

      {/* 3. Daily Quests */}
      <QuestsModal isOpen={isQuestsOpen} onClose={() => setIsQuestsOpen(false)} />

      {/* 4. Armory & Custom Skins */}
      <InventoryModal isOpen={isArmoryOpen} onClose={() => setIsArmoryOpen(false)} />

      {/* 5. Online Multiplayer Lobby */}
      <LobbyModal
        isOpen={isLobbyOpen}
        onClose={() => setIsLobbyOpen(false)}
        onStartOnlineGame={() => {
          setIsLobbyOpen(false);
          handleConfirmStartMatch('online', (currentRoom?.players.length || 4) as 2 | 3 | 4, 500, 'red');
        }}
      />

      {/* 6. Mode Selection (Players & Stake) */}
      <ModeSelectModal
        isOpen={modeSelectOpen}
        onClose={() => setModeSelectOpen(false)}
        selectedMode={targetMode}
        userCoins={userProfile.coins}
        onConfirmStart={handleConfirmStartMatch}
      />

      {/* 7. Leaderboard */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userName={userProfile.name}
        userCoins={userProfile.coins}
      />

      {/* 8. Settings */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userProfile.name}
        onUpdateName={updateProfileName}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* 9. Tournament Rules */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* 10. Game Over / Victory Modal */}
      {isGameOverOpen && (
        <GameOverModal
          winnerColor={gameState.winner}
          winnerName={
            gameState.players.find((p) => p.color === gameState.winner)?.name || 'Champion'
          }
          isLocalWinner={
            gameState.players.find((p) => p.color === gameState.winner)?.type === 'human'
          }
          onPlayAgain={() => {
            setIsGameOverOpen(false);
            handleConfirmStartMatch(gameState.mode, gameState.players.length as 2 | 3 | 4, activeStakeFee, gameState.players[0].color);
          }}
          onReturnToMenu={() => {
            setIsGameOverOpen(false);
            setScreen('HOME_LOBBY');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <LudoGameApp />
    </GameProvider>
  );
}
