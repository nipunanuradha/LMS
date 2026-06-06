import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  Sparkles,
  BellRing
} from 'lucide-react';
import { API_URL } from '../config';

// Web Audio API synthesiser for a premium chime notification sound
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const playTone = (time: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };
    
    // Play a beautiful double-chime (D5 to A5)
    playTone(now, 587.33, 0.35);
    playTone(now + 0.12, 880, 0.5);
  } catch (e) {
    console.error('Failed to play sound:', e);
  }
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [activeToast, setActiveToast] = useState<{ admin: any; message: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const socketRef = useRef<any>(null);
  const apiUrl = API_URL;
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep latest state in refs for the socket listener callback
  const adminsRef = useRef(admins);
  const selectedAdminRef = useRef(selectedAdmin);
  const openRef = useRef(open);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => { adminsRef.current = admins; }, [admins]);
  useEffect(() => { selectedAdminRef.current = selectedAdmin; }, [selectedAdmin]);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Load admins list
  useEffect(() => {
    fetch(`${apiUrl}/api/admins`)
      .then((r) => r.json())
      .then(setAdmins)
      .catch(() => setAdmins([]));
  }, [apiUrl]);

  // Auto-scroll to bottom of chat when new messages arrive or widget opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Persistent Socket Connection - connects as long as the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current) return; // Already connected

    const socket = io(apiUrl, { auth: { token } });
    socketRef.current = socket;

    socket.on('private_message', (msg: any) => {
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : 0;

      // Handle message sent to the student
      if (msg.receiver_id === Number(currentUserId)) {
        const senderId = msg.sender_id;
        const isViewingThisAdmin = openRef.current && selectedAdminRef.current?.id === senderId;

        if (!isViewingThisAdmin) {
          // Play sound chime if enabled
          if (soundEnabledRef.current) {
            playChime();
          }

          // Increment unread count for this admin
          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));

          // Trigger a beautiful in-app toast notification
          const senderAdmin = adminsRef.current.find((a) => a.id === senderId);
          if (senderAdmin) {
            setActiveToast({
              admin: senderAdmin,
              message: msg.message,
            });
          }
        } else {
          // Currently viewing this admin's chat, append directly to message list
          setMessages((prevMsgs) => {
            const exists = prevMsgs.some(
              (m) => m.id === msg.id || (m.created_at === msg.created_at && m.message === msg.message && m.sender_id === msg.sender_id)
            );
            return exists ? prevMsgs : [...prevMsgs, msg];
          });
        }
      } else if (msg.sender_id === Number(currentUserId)) {
        // Handle message sent *from* this student to the admin (echo)
        if (selectedAdminRef.current?.id === msg.receiver_id) {
          setMessages((prevMsgs) => [...prevMsgs, msg]);
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiUrl, location.pathname]);

  // Load message history when selecting an admin
  useEffect(() => {
    if (!selectedAdmin) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    // Clear unread count for this admin
    setUnreadCounts((prev) => ({
      ...prev,
      [selectedAdmin.id]: 0,
    }));

    fetch(`${apiUrl}/api/admin/messages/${selectedAdmin.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => setMessages([]));

    // Focus input field after selecting
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [selectedAdmin, apiUrl]);

  // Send message
  const send = () => {
    if (!text.trim() || !selectedAdmin) return;
    const payload = { to: selectedAdmin.id, message: text.trim() };
    socketRef.current?.emit('private_message', payload);
    setText('');
  };

  // Toast notification auto-dismiss timer
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000); // dismiss after 6 seconds
    return () => clearTimeout(timer);
  }, [activeToast]);

  // When clicking Reply in the toast
  const handleReplyFromToast = () => {
    if (!activeToast) return;
    setSelectedAdmin(activeToast.admin);
    setOpen(true);
    setActiveToast(null);
  };

  // Check if student is logged in to decide if the chat button should show
  const isLoggedIn = !!localStorage.getItem('token');
  if (!isLoggedIn) return null;

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* CSS style block for premium custom micro-animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); opacity: 0.5; box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes toast-slide-in {
          0% { transform: translateY(100px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes chat-fade-in {
          from { transform: scale(0.95) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes message-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes admin-new-message-glow {
          0% { background-color: rgba(254, 240, 138, 0.4); border-color: rgba(250, 204, 21, 0.6); }
          100% { background-color: #f1f5f9; border-color: #e2e8f0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        .animate-toast-in {
          animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-chat-in {
          animation: chat-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-message-appear {
          animation: message-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-admin-glow {
          animation: admin-new-message-glow 2s ease-out forwards;
        }
      `}</style>

      {/* FLOATING ACTION TRIGGER */}
      <div className="fixed bottom-5 right-5 z-[1000] font-sans">
        <button 
          onClick={() => setOpen((s) => !s)} 
          className="relative flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-medium shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat with Admin</span>
          
          {/* Unread count badge on the main chat button */}
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold animate-pulse-ring border-2 border-white">
              {totalUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* GLASSMORPHIC IN-APP TOAST NOTIFICATION */}
      {activeToast && (
        <div className="fixed bottom-24 right-5 z-[1002] w-80 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-toast-in font-sans">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                <BellRing className="w-4.5 h-4.5 animate-bounce animate-duration-1000" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 truncate m-0">
                  {activeToast.admin.full_name}
                </h4>
                <p className="text-[11px] text-slate-400 m-0">LMS Support Administrator</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveToast(null)} 
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 max-h-16 overflow-hidden text-ellipsis line-clamp-2">
            {activeToast.message}
          </div>
          
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setActiveToast(null)} 
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold bg-transparent transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button 
              onClick={handleReplyFromToast} 
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold border-none flex items-center gap-1 transition-colors shadow-sm shadow-indigo-100 cursor-pointer"
            >
              <span>Reply</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUPPORT CHAT WIDGET BOX */}
      {open && (
        <div className="fixed bottom-24 right-5 w-[420px] h-[540px] bg-white border border-slate-200/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-chat-in z-[1001] font-sans">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 tracking-wide">LMS Admin Support</h3>
                <p className="text-[10px] text-slate-400 m-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Active support channel
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sound Toggle Button */}
              <button 
                onClick={() => setSoundEnabled((e) => !e)}
                className={`p-1.5 rounded-lg border-none cursor-pointer transition-colors bg-transparent ${
                  soundEnabled ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-400'
                }`}
                title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {/* Close Button */}
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Left Sidebar - Admins list */}
            <div className="w-32 border-r border-slate-100 overflow-y-auto bg-slate-50 flex flex-col">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Admins
              </div>
              
              {admins.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No admins available
                </div>
              ) : (
                admins.map((a) => {
                  const isSelected = selectedAdmin?.id === a.id;
                  const unreadCount = unreadCounts[a.id] || 0;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAdmin(a)}
                      className={`w-full text-left p-3 border-b border-slate-100 transition-all duration-200 flex flex-col gap-1 relative ${
                        isSelected 
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600 text-blue-900' 
                          : unreadCount > 0
                            ? 'bg-amber-50/40 border-l-4 border-l-amber-500 hover:bg-slate-100'
                            : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="font-semibold text-xs truncate pr-1">{a.full_name}</div>
                        {unreadCount > 0 && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{a.phone_number}</div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Pane - Chat window */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
              
              {/* Message Feed Container */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {selectedAdmin ? (
                  messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 font-sans">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-medium m-0">No messages yet</p>
                      <p className="text-[10px] text-slate-400 m-0 mt-1">Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((m, i) => {
                      const isMe = m.sender_id !== selectedAdmin.id;
                      const isLastMessage = i === messages.length - 1;
                      
                      // Highlight the last received admin message
                      const messageStyleClass = isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-sm shadow-blue-100' 
                        : isLastMessage 
                          ? 'animate-admin-glow border rounded-2xl rounded-tl-none text-slate-800 shadow-sm' 
                          : 'bg-slate-100 text-slate-800 border border-slate-200/50 rounded-2xl rounded-tl-none';

                      return (
                        <div 
                          key={i} 
                          className={`flex flex-col animate-message-appear ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed ${messageStyleClass}`}>
                            {m.message}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 font-sans">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 animate-bounce">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 m-0">Select an Administrator</p>
                    <p className="text-[10px] text-slate-400 m-0 mt-1 max-w-[200px]">Choose an administrator from the list on the left to start your consultation.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              {selectedAdmin && (
                <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder={`Message ${selectedAdmin.full_name}...`}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button 
                    onClick={send}
                    disabled={!text.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-full border-none transition-colors duration-200 cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}
