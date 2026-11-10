import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

interface ClientConnection {
  ws: WebSocket;
  id: string;
  name: string;
  roomId?: string;
  color?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  avatarSeed: string;
  text: string;
  timestamp: number;
}

interface RoomPlayer {
  id: string;
  name: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  avatarSeed: string;
  isReady: boolean;
  isHost: boolean;
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  players: RoomPlayer[];
  status: 'lobby' | 'playing' | 'finished';
  gameState?: any;
  createdAt: number;
}

const clients = new Map<WebSocket, ClientConnection>();
const chatHistory: ChatMessage[] = [
  {
    id: 'msg-welcome',
    senderId: 'system',
    senderName: 'Ludo King Arena',
    senderColor: 'yellow',
    avatarSeed: 'royal-system',
    text: 'Welcome to Ludo King Royal Arena! Roll sixes, claim rewards, and challenge players worldwide! 👑🎲',
    timestamp: Date.now() - 60000,
  },
];

const rooms = new Map<string, Room>();

// Seed a public room so players always see live action or can join immediately
rooms.set('ROYAL-888', {
  id: 'ROYAL-888',
  name: 'Crown Masters 🏆',
  hostId: 'bot-host',
  maxPlayers: 4,
  players: [
    {
      id: 'bot-host',
      name: 'Raja Vikram',
      color: 'red',
      avatarSeed: 'vikram-red',
      isReady: true,
      isHost: true,
    },
  ],
  status: 'lobby',
  createdAt: Date.now(),
});

function broadcastGlobal(message: any) {
  const payload = JSON.stringify(message);
  for (const [ws] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function broadcastRoom(roomId: string, message: any) {
  const payload = JSON.stringify(message);
  for (const [ws, client] of clients.entries()) {
    if (client.roomId === roomId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function getPublicRooms() {
  return Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    hostId: r.hostId,
    maxPlayers: r.maxPlayers,
    playerCount: r.players.length,
    players: r.players.map((p) => ({ name: p.name, color: p.color })),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      onlineCount: clients.size,
      activeRooms: rooms.size,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    const clientId = 'user-' + Math.random().toString(36).substring(2, 9);
    const client: ClientConnection = {
      ws,
      id: clientId,
      name: 'Player-' + clientId.slice(-4),
    };
    clients.set(ws, client);

    // Send initial greeting with chat history and online count
    ws.send(
      JSON.stringify({
        type: 'INIT_SYNC',
        clientId,
        onlineCount: Math.max(clients.size, 12), // Minimum vibrant activity
        chatHistory: chatHistory.slice(-40),
        rooms: getPublicRooms(),
      })
    );

    // Broadcast updated online count
    broadcastGlobal({
      type: 'ONLINE_COUNT_UPDATE',
      onlineCount: Math.max(clients.size, 12),
    });

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'SET_PLAYER_INFO': {
            if (msg.name) client.name = msg.name;
            if (msg.color) client.color = msg.color;
            break;
          }

          case 'CHAT_MESSAGE': {
            const newMsg: ChatMessage = {
              id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              senderId: client.id,
              senderName: msg.senderName || client.name,
              senderColor: msg.senderColor || 'yellow',
              avatarSeed: msg.avatarSeed || 'player',
              text: (msg.text || '').slice(0, 150),
              timestamp: Date.now(),
            };
            chatHistory.push(newMsg);
            if (chatHistory.length > 100) chatHistory.shift();

            broadcastGlobal({
              type: 'NEW_CHAT_MESSAGE',
              message: newMsg,
            });
            break;
          }

          case 'LIST_ROOMS': {
            ws.send(
              JSON.stringify({
                type: 'ROOM_LIST',
                rooms: getPublicRooms(),
              })
            );
            break;
          }

          case 'CREATE_ROOM': {
            const roomId = (msg.roomId || 'ROOM-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
            const colors: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];
            const room: Room = {
              id: roomId,
              name: msg.name || `${client.name}'s Table`,
              hostId: client.id,
              maxPlayers: msg.maxPlayers || 4,
              players: [
                {
                  id: client.id,
                  name: client.name,
                  color: colors[0],
                  avatarSeed: msg.avatarSeed || 'host',
                  isReady: true,
                  isHost: true,
                },
              ],
              status: 'lobby',
              createdAt: Date.now(),
            };
            rooms.set(roomId, room);
            client.roomId = roomId;

            ws.send(
              JSON.stringify({
                type: 'ROOM_CREATED',
                room,
              })
            );

            broadcastGlobal({
              type: 'ROOM_LIST_UPDATE',
              rooms: getPublicRooms(),
            });
            break;
          }

          case 'JOIN_ROOM': {
            const targetRoomId = (msg.roomId || '').toUpperCase();
            const room = rooms.get(targetRoomId);
            if (!room) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
              return;
            }
            if (room.players.length >= room.maxPlayers) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is already full' }));
              return;
            }
            if (room.status !== 'lobby') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Game has already started' }));
              return;
            }

            // Assign next available color
            const usedColors = new Set(room.players.map((p) => p.color));
            const allColors: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];
            const availableColor = allColors.find((c) => !usedColors.has(c)) || 'blue';

            room.players.push({
              id: client.id,
              name: client.name,
              color: availableColor,
              avatarSeed: msg.avatarSeed || 'joiner',
              isReady: false,
              isHost: false,
            });

            client.roomId = room.id;

            broadcastRoom(room.id, {
              type: 'ROOM_UPDATED',
              room,
            });

            broadcastGlobal({
              type: 'ROOM_LIST_UPDATE',
              rooms: getPublicRooms(),
            });
            break;
          }

          case 'TOGGLE_READY': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room) return;
            const p = room.players.find((player) => player.id === client.id);
            if (p) {
              p.isReady = !p.isReady;
              broadcastRoom(room.id, {
                type: 'ROOM_UPDATED',
                room,
              });
            }
            break;
          }

          case 'START_ROOM_GAME': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || room.hostId !== client.id) return;
            room.status = 'playing';

            broadcastRoom(room.id, {
              type: 'GAME_STARTED',
              room,
            });

            broadcastGlobal({
              type: 'ROOM_LIST_UPDATE',
              rooms: getPublicRooms(),
            });
            break;
          }

          case 'SYNC_GAME_STATE': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room) return;
            room.gameState = msg.gameState;

            broadcastRoom(room.id, {
              type: 'REMOTE_GAME_STATE',
              gameState: msg.gameState,
              action: msg.action,
            });
            break;
          }

          case 'GAME_REACTION': {
            if (!client.roomId) return;
            broadcastRoom(client.roomId, {
              type: 'REMOTE_REACTION',
              playerId: client.id,
              senderName: client.name,
              color: client.color,
              emoji: msg.emoji,
              phrase: msg.phrase,
            });
            break;
          }

          case 'LEAVE_ROOM': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (room) {
              room.players = room.players.filter((p) => p.id !== client.id);
              if (room.players.length === 0) {
                rooms.delete(room.id);
              } else {
                if (room.hostId === client.id) {
                  room.hostId = room.players[0].id;
                  room.players[0].isHost = true;
                }
                broadcastRoom(room.id, {
                  type: 'ROOM_UPDATED',
                  room,
                });
              }
              broadcastGlobal({
                type: 'ROOM_LIST_UPDATE',
                rooms: getPublicRooms(),
              });
            }
            client.roomId = undefined;
            break;
          }
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    });

    ws.on('close', () => {
      if (client.roomId) {
        const room = rooms.get(client.roomId);
        if (room) {
          room.players = room.players.filter((p) => p.id !== client.id);
          if (room.players.length === 0) {
            rooms.delete(room.id);
          } else {
            if (room.hostId === client.id) {
              room.hostId = room.players[0].id;
              room.players[0].isHost = true;
            }
            broadcastRoom(room.id, {
              type: 'ROOM_UPDATED',
              room,
            });
          }
          broadcastGlobal({
            type: 'ROOM_LIST_UPDATE',
            rooms: getPublicRooms(),
          });
        }
      }
      clients.delete(ws);
      broadcastGlobal({
        type: 'ONLINE_COUNT_UPDATE',
        onlineCount: Math.max(clients.size, 12),
      });
    });
  });

  // Setup Vite middleware in dev or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ludo King Royal Arena full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
