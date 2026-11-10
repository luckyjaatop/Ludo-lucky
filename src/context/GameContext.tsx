import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, DailyQuest, ChatMessage, GameRoom, PlayerColor } from '../types/ludo';
import { audio } from '../utils/audio';

const STORAGE_KEY_PROFILE = 'ludo_king_user_profile_v1';
const STORAGE_KEY_QUESTS = 'ludo_king_daily_quests_v1';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-' + Math.random().toString(36).substring(2, 9),
  name: 'Royal Ruler',
  coins: 2500,
  gems: 45,
  level: 1,
  xp: 120,
  avatarSeed: 'royal-lion',
  equippedDice: 'classic',
  equippedPawn: 'classic',
  unlockedDice: ['classic'],
  unlockedPawns: ['classic'],
  lastDailySpinDate: null,
  streakDays: 1,
  lastStreakClaimDate: null,
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    tokensCaptured: 0,
    sixesRolled: 0,
  },
};

const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'q_sixer',
    title: 'Dice Sorcerer',
    description: 'Roll a lucky 6 three times in games',
    current: 0,
    target: 3,
    rewardCoins: 350,
    rewardXp: 150,
    claimed: false,
  },
  {
    id: 'q_capture',
    title: 'Token Hunter',
    description: 'Capture 2 opponent tokens in any mode',
    current: 0,
    target: 2,
    rewardCoins: 500,
    rewardXp: 200,
    claimed: false,
  },
  {
    id: 'q_home',
    title: 'Safe Harbor',
    description: 'Guide at least 1 token safely into Home',
    current: 0,
    target: 1,
    rewardCoins: 400,
    rewardXp: 180,
    claimed: false,
  },
  {
    id: 'q_win',
    title: 'Grand Champion',
    description: 'Win 1 match in Local or Online arena',
    current: 0,
    target: 1,
    rewardCoins: 1000,
    rewardXp: 500,
    claimed: false,
  },
];

interface GameContextType {
  userProfile: UserProfile;
  quests: DailyQuest[];
  onlineCount: number;
  chatMessages: ChatMessage[];
  publicRooms: any[];
  currentRoom: GameRoom | null;
  clientId: string | null;
  isMuted: boolean;
  activeReaction: { emoji: string; phrase?: string; senderName: string; color?: string } | null;
  toggleAudio: () => void;
  updateProfileName: (name: string) => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  claimDailySpin: (coins: number, diceSkin?: string) => void;
  claimStreakReward: (day: number, coins: number, pawnSkin?: string) => void;
  claimQuest: (questId: string) => void;
  equipDice: (id: string) => void;
  equipPawn: (id: string) => void;
  buyDiceSkin: (id: string, costCoins: number) => boolean;
  buyPawnSkin: (id: string, costCoins: number) => boolean;
  recordStat: (stat: 'gamesPlayed' | 'gamesWon' | 'tokensCaptured' | 'sixesRolled') => void;
  sendChatMessage: (text: string) => void;
  createOnlineRoom: (name: string, maxPlayers: 2 | 3 | 4) => void;
  joinOnlineRoom: (roomId: string) => void;
  toggleReady: () => void;
  startOnlineGame: () => void;
  leaveOnlineRoom: () => void;
  sendGameAction: (action: string, payload?: any) => void;
  sendReaction: (emoji: string, phrase?: string) => void;
  remoteGameState: any | null;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getMuted());
  const [onlineCount, setOnlineCount] = useState<number>(14);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [remoteGameState, setRemoteGameState] = useState<any | null>(null);
  const [activeReaction, setActiveReaction] = useState<{ emoji: string; phrase?: string; senderName: string; color?: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  }, [userProfile]);

  // Sync quests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
    } catch (err) {
      console.error('Error saving quests:', err);
    }
  }, [quests]);

  // WebSocket Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'SET_PLAYER_INFO',
              name: userProfile.name,
              color: 'red',
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'INIT_SYNC':
              setClientId(data.clientId);
              if (data.onlineCount) setOnlineCount(data.onlineCount);
              if (data.chatHistory) setChatMessages(data.chatHistory);
              if (data.rooms) setPublicRooms(data.rooms);
              break;

            case 'ONLINE_COUNT_UPDATE':
              setOnlineCount(data.onlineCount);
              break;

            case 'NEW_CHAT_MESSAGE':
              setChatMessages((prev) => [...prev.slice(-60), data.message]);
              break;

            case 'ROOM_LIST':
            case 'ROOM_LIST_UPDATE':
              if (data.rooms) setPublicRooms(data.rooms);
              break;

            case 'ROOM_CREATED':
            case 'ROOM_UPDATED':
              setCurrentRoom(data.room);
              break;

            case 'GAME_STARTED':
              setCurrentRoom(data.room);
              break;

            case 'REMOTE_GAME_STATE':
              setRemoteGameState(data.gameState);
              break;

            case 'REMOTE_REACTION':
              setActiveReaction({
                emoji: data.emoji,
                phrase: data.phrase,
                senderName: data.senderName,
                color: data.color,
              });
              setTimeout(() => {
                setActiveReaction(null);
              }, 3000);
              break;
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [userProfile.name]);

  const toggleAudio = useCallback(() => {
    const next = audio.toggleMute();
    setIsMuted(next);
  }, []);

  const updateProfileName = useCallback((name: string) => {
    setUserProfile((prev) => ({ ...prev, name }));
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'SET_PLAYER_INFO',
          name,
        })
      );
    }
  }, []);

  const addCoins = useCallback((amount: number) => {
    setUserProfile((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins + amount),
    }));
  }, []);

  const addXp = useCallback((amount: number) => {
    setUserProfile((prev) => {
      const nextXp = prev.xp + amount;
      const xpNeeded = prev.level * 250;
      if (nextXp >= xpNeeded) {
        audio.playClaimReward();
        return {
          ...prev,
          level: prev.level + 1,
          xp: nextXp - xpNeeded,
          coins: prev.coins + 500, // Level up bonus!
        };
      }
      return { ...prev, xp: nextXp };
    });
  }, []);

  const claimDailySpin = useCallback((coins: number, diceSkin?: string) => {
    audio.playClaimReward();
    setUserProfile((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const nextUnlockedDice = diceSkin && !prev.unlockedDice.includes(diceSkin)
        ? [...prev.unlockedDice, diceSkin]
        : prev.unlockedDice;

      return {
        ...prev,
        coins: prev.coins + coins,
        lastDailySpinDate: today,
        unlockedDice: nextUnlockedDice,
      };
    });
  }, []);

  const claimStreakReward = useCallback((day: number, coins: number, pawnSkin?: string) => {
    audio.playClaimReward();
    setUserProfile((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const nextUnlockedPawns = pawnSkin && !prev.unlockedPawns.includes(pawnSkin)
        ? [...prev.unlockedPawns, pawnSkin]
        : prev.unlockedPawns;

      return {
        ...prev,
        coins: prev.coins + coins,
        streakDays: (day % 7) + 1,
        lastStreakClaimDate: today,
        unlockedPawns: nextUnlockedPawns,
      };
    });
  }, []);

  const claimQuest = useCallback((questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.claimed || q.current < q.target) return;

    audio.playClaimReward();
    addCoins(q.rewardCoins);
    addXp(q.rewardXp);

    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
    );
  }, [quests, addCoins, addXp]);

  const equipDice = useCallback((id: string) => {
    audio.playButton();
    setUserProfile((prev) => ({ ...prev, equippedDice: id }));
  }, []);

  const equipPawn = useCallback((id: string) => {
    audio.playButton();
    setUserProfile((prev) => ({ ...prev, equippedPawn: id }));
  }, []);

  const buyDiceSkin = useCallback((id: string, costCoins: number): boolean => {
    if (userProfile.coins < costCoins) return false;
    audio.playClaimReward();
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins - costCoins,
      unlockedDice: [...prev.unlockedDice, id],
      equippedDice: id,
    }));
    return true;
  }, [userProfile.coins]);

  const buyPawnSkin = useCallback((id: string, costCoins: number): boolean => {
    if (userProfile.coins < costCoins) return false;
    audio.playClaimReward();
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins - costCoins,
      unlockedPawns: [...prev.unlockedPawns, id],
      equippedPawn: id,
    }));
    return true;
  }, [userProfile.coins]);

  const recordStat = useCallback((stat: 'gamesPlayed' | 'gamesWon' | 'tokensCaptured' | 'sixesRolled') => {
    setUserProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: prev.stats[stat] + 1,
      },
    }));

    // Update corresponding daily quests
    setQuests((prev) =>
      prev.map((q) => {
        if (stat === 'sixesRolled' && q.id === 'q_sixer' && !q.claimed) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (stat === 'tokensCaptured' && q.id === 'q_capture' && !q.claimed) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (stat === 'gamesWon' && q.id === 'q_win' && !q.claimed) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      })
    );
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    if (!text.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'CHAT_MESSAGE',
        senderName: userProfile.name,
        senderColor: 'yellow',
        avatarSeed: userProfile.avatarSeed,
        text,
      })
    );
  }, [userProfile.name, userProfile.avatarSeed]);

  const createOnlineRoom = useCallback((name: string, maxPlayers: 2 | 3 | 4) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    audio.playButton();
    socketRef.current.send(
      JSON.stringify({
        type: 'CREATE_ROOM',
        name,
        maxPlayers,
        avatarSeed: userProfile.avatarSeed,
      })
    );
  }, [userProfile.avatarSeed]);

  const joinOnlineRoom = useCallback((roomId: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    audio.playButton();
    socketRef.current.send(
      JSON.stringify({
        type: 'JOIN_ROOM',
        roomId,
        avatarSeed: userProfile.avatarSeed,
      })
    );
  }, [userProfile.avatarSeed]);

  const toggleReady = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    audio.playButton();
    socketRef.current.send(JSON.stringify({ type: 'TOGGLE_READY' }));
  }, []);

  const startOnlineGame = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    audio.playButton();
    socketRef.current.send(JSON.stringify({ type: 'START_ROOM_GAME' }));
  }, []);

  const leaveOnlineRoom = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    audio.playButton();
    socketRef.current.send(JSON.stringify({ type: 'LEAVE_ROOM' }));
    setCurrentRoom(null);
    setRemoteGameState(null);
  }, []);

  const sendGameAction = useCallback((action: string, gameState?: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'SYNC_GAME_STATE',
        action,
        gameState,
      })
    );
  }, []);

  const sendReaction = useCallback((emoji: string, phrase?: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'GAME_REACTION',
        emoji,
        phrase,
      })
    );
    setActiveReaction({
      emoji,
      phrase,
      senderName: userProfile.name,
    });
    setTimeout(() => {
      setActiveReaction(null);
    }, 3000);
  }, [userProfile.name]);

  return (
    <GameContext.Provider
      value={{
        userProfile,
        quests,
        onlineCount,
        chatMessages,
        publicRooms,
        currentRoom,
        clientId,
        isMuted,
        activeReaction,
        toggleAudio,
        updateProfileName,
        addCoins,
        addXp,
        claimDailySpin,
        claimStreakReward,
        claimQuest,
        equipDice,
        equipPawn,
        buyDiceSkin,
        buyPawnSkin,
        recordStat,
        sendChatMessage,
        createOnlineRoom,
        joinOnlineRoom,
        toggleReady,
        startOnlineGame,
        leaveOnlineRoom,
        sendGameAction,
        sendReaction,
        remoteGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
