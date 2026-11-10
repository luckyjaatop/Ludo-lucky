import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, Send, X, Users, Smile } from 'lucide-react';
import { audio } from '../utils/audio';

interface GlobalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_EMOJIS = ['👑', '🎲', '🔥', '🏆', '👏', '🥳', '😎', '💥'];

export const GlobalChat: React.FC<GlobalChatProps> = ({ isOpen, onClose }) => {
  const { chatMessages, sendChatMessage, onlineCount, userProfile } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    audio.playButton();
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleSendQuick = (emoji: string) => {
    audio.playButton();
    sendChatMessage(emoji);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-slate-950/95 backdrop-blur-md border-l border-amber-500/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Global Arena Chat</h3>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Users className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300 tabular-nums">{onlineCount}</span>
              <span className="text-slate-400">players online</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Chat"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs py-8">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
            <p>No messages yet.</p>
            <p>Say hello to fellow kings & queens!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === userProfile.id;
            const isSystem = msg.senderId === 'system';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-200/90 leading-relaxed shadow-sm"
                >
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] mb-1">
                  <span className={`font-semibold ${isMe ? 'text-amber-400' : 'text-slate-300'}`}>
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Bar */}
      <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <Smile className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendQuick(emoji)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-sm flex items-center justify-center shrink-0 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-amber-500/20 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a battle chant..."
          maxLength={120}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          aria-label="Send message"
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
