import { safeFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Send, LogIn, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  createdAt: string;
}

export function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await safeFetch('/api/chat'); 
      const data = await res.json();
      if (data.status === 'success') {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Chat API Error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const res = await safeFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          message: text
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchMessages(); // Immediately refresh
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-72px)] lg:h-full overflow-hidden bg-[#0a0a0b]",
      user ? "pb-20 lg:pb-0" : "pb-0"
    )}>
      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">
              No messages yet
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.userId;
            
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex items-start gap-3 max-w-[85%] md:max-w-[75%]",
                  isMe ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.userAvatar ? (
                    <img 
                      src={msg.userAvatar} 
                      alt={msg.username} 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex flex-col gap-1",
                  isMe ? "items-end" : "items-start"
                )}>
                  <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                    {msg.username}
                  </span>
                  <div className={cn(
                    "px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg",
                    isMe 
                      ? "bg-emerald-500 text-white rounded-tr-none" 
                      : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-white/5"
                  )}>
                    {msg.message}
                  </div>
                  <span className="text-[8px] text-zinc-600 font-medium px-1">
                    {msg.createdAt 
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Sending...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar - Sticky above BottomNav */}
      <div className="p-3 md:p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 shrink-0">
        {!user ? (
          <button 
            onClick={() => navigate('/signin')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 group"
          >
            <LogIn className="w-5 h-5" />
            Login to chat
          </button>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 group"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
