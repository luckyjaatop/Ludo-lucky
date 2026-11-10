import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Globe, Plus, Users, Play, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { audio } from '../utils/audio';

interface LobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineGame: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineGame,
}) => {
  const {
    publicRooms,
    currentRoom,
    userProfile,
    createOnlineRoom,
    joinOnlineRoom,
    toggleReady,
    startOnlineGame,
    leaveOnlineRoom,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'joinCode'>('browse');
  const [newRoomName, setNewRoomName] = useState(`${userProfile.name}'s Arena`);
  const [newMaxPlayers, setNewMaxPlayers] = useState<2 | 3 | 4>(4);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    createOnlineRoom(newRoomName, newMaxPlayers);
    setActiveTab('browse');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    joinOnlineRoom(joinCodeInput.trim().toUpperCase());
    setJoinCodeInput('');
  };

  // If already in a room, render Room Waiting Room view
  if (currentRoom) {
    const isHost = currentRoom.hostId === userProfile.id;
    const canStart = isHost && currentRoom.players.length >= 2;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                  {currentRoom.id}
                </span>
                <h2 className="text-base font-black text-white tracking-wide">{currentRoom.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Waiting for players ({currentRoom.players.length}/{currentRoom.maxPlayers})
              </p>
            </div>
            <button
              onClick={leaveOnlineRoom}
              aria-label="Leave Room"
              className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-500/30 transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Players List in Room */}
          <div className="my-5 grid grid-cols-2 gap-3">
            {Array.from({ length: currentRoom.maxPlayers }).map((_, idx) => {
              const p = currentRoom.players[idx];

              if (!p) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 text-xs py-5"
                  >
                    <Users className="w-5 h-5 mb-1 opacity-50" />
                    <span>Waiting...</span>
                  </div>
                );
              }

              const colorBorder: Record<string, string> = {
                red: 'border-rose-500 bg-rose-500/10 text-rose-200',
                green: 'border-emerald-500 bg-emerald-500/10 text-emerald-200',
                yellow: 'border-amber-400 bg-amber-400/10 text-amber-200',
                blue: 'border-sky-500 bg-sky-500/10 text-sky-200',
              };

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    colorBorder[p.color] || 'border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-3 h-3 rounded-full bg-white shadow-sm shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {p.color} {p.isHost && '👑 Host'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.isReady ? 'READY' : 'WAITING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Room Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={toggleReady}
              className="flex-1 py-3 rounded-xl border border-amber-500/40 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-colors"
            >
              Toggle Ready State
            </button>

            {isHost && (
              <button
                onClick={() => {
                  startOnlineGame();
                  onStartOnlineGame();
                }}
                disabled={!canStart}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 disabled:opacity-40 text-slate-950 font-black text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START MATCH</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">Online Multiplayer Arena</h2>
              <p className="text-xs text-amber-400/90 font-medium">Join public matches or create a private room</p>
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
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'browse' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Browse Public Rooms
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Table
          </button>
          <button
            onClick={() => setActiveTab('joinCode')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'joinCode' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Join with Code
          </button>
        </div>

        {/* Tab 1: Browse Public Rooms */}
        {activeTab === 'browse' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {publicRooms.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No active public rooms right now.</p>
                <p className="text-amber-400 font-medium mt-1">Create one to start playing!</p>
              </div>
            ) : (
              publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{room.name}</h4>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {room.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>
                        {room.playerCount} / {room.maxPlayers} Players
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => joinOnlineRoom(room.id)}
                    disabled={room.playerCount >= room.maxPlayers || room.status !== 'lobby'}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl transition-all shadow"
                  >
                    {room.status !== 'lobby' ? 'In Match' : 'JOIN TABLE'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Create Table */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Table Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                maxLength={30}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Max Players</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewMaxPlayers(num as 2 | 3 | 4)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      newMaxPlayers === num
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Players
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs tracking-wide rounded-xl shadow-lg transition-all"
            >
              CREATE & OPEN LOBBY
            </button>
          </form>
        )}

        {/* Tab 3: Join with Code */}
        {activeTab === 'joinCode' && (
          <form onSubmit={handleJoinByCode} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Enter Room Code</label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="e.g. ROOM-1234 or ROYAL-888"
                maxLength={15}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={!joinCodeInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-40 text-slate-950 font-black text-xs tracking-wide rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>CONNECT TO ROOM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
