import { safeFetch } from '../lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Users, Send, LogIn, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: any;
}

export function FloatingChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await safeFetch('/api/chat');
        const data = await res.json();
        if (data.status === 'success') {
          const msgs = data.messages.map((m: any) => ({
            id: m.id,
            userId: m.userId,
            userName: m.userName || m.username || 'Anonymous',
            userAvatar: m.userAvatar || null,
            text: m.text || m.message,
            timestamp: m.timestamp || m.createdAt
          }));
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Chat API Error:", err);
      }
    };

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
        // Optimistic UI or just wait for poll
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] hidden md:flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="origin-bottom-right mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-[#0f172a] border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-black/40 border-b border-white/5 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold tracking-tight">Community Chat</h3>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Now
                </p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
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
                        "flex items-start gap-2.5 max-w-[85%]",
                        isMe ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className="shrink-0 pt-0.5">
                        {msg.userAvatar ? (
                          <img 
                            src={msg.userAvatar} 
                            alt={msg.userName} 
                            className="w-7 h-7 rounded-lg border border-white/10 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "flex flex-col gap-1",
                        isMe ? "items-end" : "items-start"
                      )}>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">
                          {msg.userName}
                        </span>
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-md",
                          isMe 
                            ? "bg-emerald-500 text-black font-medium rounded-tr-sm" 
                            : "bg-zinc-800 text-zinc-200 rounded-tl-sm border border-white/5"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/40 border-t border-white/5 shrink-0">
              {!user ? (
                <button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px]"
                >
                  <LogIn className="w-4 h-4" />
                  Login to chat
                </button>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-11 h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Toggle) */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 z-50 relative"
      >
        {isChatOpen ? (
          <X className="w-6 h-6 animate-in zoom-in duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 animate-in zoom-in duration-200" />
        )}
      </button>
    </div>
  );
}
