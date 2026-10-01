import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

export default function AdminChatWidget({ students = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [text, setText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadStudentIds, setUnreadStudentIds] = useState([]);
  
  const socketRef = useRef(null);
  const selectedStudentRef = useRef(selectedStudent);
  const messagesEndRef = useRef(null);
  const apiUrl = API_URL;

  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Load conversations from backend
  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    const currentUserStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let currentUserId = '';
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    try {
      const res = await fetch(`${apiUrl}/api/admin/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-user-id': String(currentUserId || '')
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
          
          // Count total unread from conversation list
          const totalUnreads = data.reduce((acc, c) => acc + (c.unread_count || 0), 0);
          if (totalUnreads > 0) {
            setUnreadCount(totalUnreads);
            const studentIdsWithUnread = data.filter(c => c.unread_count > 0).map(c => Number(c.id));
            setUnreadStudentIds(prev => Array.from(new Set([...prev, ...studentIdsWithUnread])));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Polling backup every 10s
    return () => clearInterval(interval);
  }, []);

  // Persistent Socket Connection (Only connects once, not on selectedStudent change)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const currentUserStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let currentUserId = '';
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    const socket = io(apiUrl, { 
      auth: { 
        token, 
        userId: currentUserId 
      } 
    });
    socketRef.current = socket;

    socket.on('private_message', (msg) => {
      const activeStudent = selectedStudentRef.current;
      const senderId = Number(msg.sender_id);
      const receiverId = Number(msg.receiver_id);
      const activeStudentId = activeStudent ? Number(activeStudent.id) : null;

      // Update conversations list immediately with newest message
      setConversations((prevConv) => {
        const otherId = senderId === Number(currentUserId) ? receiverId : senderId;
        const existing = prevConv.find(c => Number(c.id) === otherId);
        if (existing) {
          return prevConv.map(c => Number(c.id) === otherId ? {
            ...c,
            last_message: msg.message,
            last_message_at: msg.created_at || new Date().toISOString(),
            last_sender_id: senderId
          } : c).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
        } else {
          return [{
            id: otherId,
            full_name: 'Student',
            last_message: msg.message,
            last_message_at: msg.created_at || new Date().toISOString(),
            last_sender_id: senderId,
            unread_count: 1
          }, ...prevConv];
        }
      });

      // If we are currently chatting with this student, append the message
      if (activeStudentId && (senderId === activeStudentId || receiverId === activeStudentId)) {
        setMessages((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          const exists = list.some(
            (m) => (msg.id && m.id === msg.id) ||
                   (Number(m.sender_id) === senderId && m.message === msg.message && Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 3000)
          );
          return exists ? list : [...list, msg];
        });
      } else if (senderId !== Number(currentUserId)) {
        // Increment unread count & mark student as having unread
        setUnreadCount((c) => c + 1);
        setUnreadStudentIds((prev) => Array.from(new Set([...prev, senderId])));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiUrl]);

  // Load message history when selecting a student
  useEffect(() => {
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    const currentUserStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let currentUserId = '';
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    // Clear unread for this student
    setUnreadStudentIds((prev) => prev.filter((id) => Number(id) !== Number(selectedStudent.id)));

    fetch(`${apiUrl}/api/admin/messages/${selectedStudent.id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'x-user-id': String(currentUserId || '')
      },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load messages:', err);
        setMessages([]);
      });
  }, [selectedStudent, apiUrl]);

  // Send reply message
  const send = async () => {
    if (!text.trim() || !selectedStudent) return;
    const msgText = text.trim();
    setText('');

    const token = localStorage.getItem('token');
    const currentUserStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let currentUserId = '';
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    const payload = { to: selectedStudent.id, message: msgText };

    // Emit live via socket
    socketRef.current?.emit('private_message', payload);

    // Persist via REST API for guaranteed delivery & DB storage
    try {
      const res = await fetch(`${apiUrl}/api/admin/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-user-id': String(currentUserId || '')
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            const exists = list.some(
              (m) => (data.message.id && m.id === data.message.id) ||
                     (Number(m.sender_id) === Number(data.message.sender_id) && m.message === data.message.message && Math.abs(new Date(m.created_at).getTime() - new Date(data.message.created_at).getTime()) < 3000)
            );
            return exists ? list : [...list, data.message];
          });

          // Update local conversation preview
          setConversations((prev) => {
            const list = [...prev];
            const idx = list.findIndex(c => Number(c.id) === Number(selectedStudent.id));
            if (idx >= 0) {
              list[idx] = {
                ...list[idx],
                last_message: msgText,
                last_message_at: new Date().toISOString(),
                last_sender_id: Number(currentUserId)
              };
              return list.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
            }
            return list;
          });
        }
      }
    } catch (err) {
      console.error('Error persisting message:', err);
    }
  };

  const handleOpenToggle = () => {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0); // Clear badge on opening
      fetchConversations();
    }
  };

  const onlyStudents = students.filter(s => !s.role || s.role === 'student');

  // Merge full students list with conversations
  const convMap = new Map(conversations.map(c => [Number(c.id), c]));
  const studentListWithConv = onlyStudents.map(s => {
    const conv = convMap.get(Number(s.id));
    return {
      ...s,
      last_message: conv ? conv.last_message : null,
      last_message_at: conv ? conv.last_message_at : null,
      unread_count: conv ? conv.unread_count : 0,
      has_conversation: !!conv
    };
  });

  // Include any students from conversations not present in prop list
  conversations.forEach(c => {
    if (!studentListWithConv.some(s => Number(s.id) === Number(c.id))) {
      studentListWithConv.push({
        id: c.id,
        full_name: c.full_name,
        phone_number: c.phone_number,
        role: c.role || 'student',
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread_count: c.unread_count,
        has_conversation: true
      });
    }
  });

  // Sort students: unread first, then by last message time, then others
  const sortedStudents = [...studentListWithConv].sort((a, b) => {
    const aUnread = unreadStudentIds.includes(Number(a.id)) || (a.unread_count > 0);
    const bUnread = unreadStudentIds.includes(Number(b.id)) || (b.unread_count > 0);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;

    if (a.last_message_at && b.last_message_at) {
      return new Date(b.last_message_at) - new Date(a.last_message_at);
    }
    if (a.last_message_at) return -1;
    if (b.last_message_at) return 1;
    return 0;
  });

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @media (max-width: 640px) {
          .admin-chat-popup {
            width: calc(100vw - 32px) !important;
            height: 75vh !important;
            max-height: 520px !important;
            right: 16px !important;
            bottom: 20px !important;
          }
          .admin-chat-layout {
            flex-direction: column !important;
          }
          .admin-chat-sidebar {
            display: ${selectedStudent ? 'none' : 'block'} !important;
            width: 100% !important;
            height: 100% !important;
            border-right: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .admin-chat-area {
            display: ${selectedStudent ? 'flex' : 'none'} !important;
            width: 100% !important;
            height: 100% !important;
          }
          .mobile-back-btn {
            display: inline-flex !important;
            align-items: center;
            gap: 4px;
          }
        }
      `}</style>
      <div>
        <button
          onClick={handleOpenToggle}
          style={{
            padding: '12px 18px',
            borderRadius: 30,
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chat with Students
          {unreadCount > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="admin-chat-popup" style={{ width: 540, height: 480, background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', borderRadius: 14, overflow: 'hidden', marginTop: 10, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', background: '#0F172A', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Student Messages & Support</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
          </div>

          <div className="admin-chat-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar list of students */}
            <div className="admin-chat-sidebar" style={{ width: 200, borderRight: '1px solid #eef2f6', overflowY: 'auto', background: '#f8fafc' }}>
              {sortedStudents.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No students found</div>
              ) : (
                sortedStudents.map((s) => {
                  const isSelected = Number(selectedStudent?.id) === Number(s.id);
                  const isUnread = unreadStudentIds.includes(Number(s.id)) || (s.unread_count > 0);
                  return (
                    <div
                      key={s.id}
                      className="admin-chat-student-item"
                      onClick={() => {
                        setSelectedStudent(s);
                        setUnreadStudentIds((prev) => prev.filter((id) => Number(id) !== Number(s.id)));
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: isSelected 
                          ? '#EFF6FF' 
                          : isUnread 
                            ? '#FFFBEB' 
                            : 'transparent',
                        borderLeft: isSelected 
                          ? '4.5px solid #2563eb' 
                          : isUnread 
                            ? '4.5px solid #eab308' 
                            : '4.5px solid transparent',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.15s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: (isSelected || isUnread) ? 700 : 500, 
                          fontSize: 13, 
                          color: isSelected 
                            ? '#1e40af' 
                            : isUnread 
                              ? '#b45309' 
                              : '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {s.full_name || s.name}
                        </div>
                        {s.last_message ? (
                          <div style={{ 
                            fontSize: 11, 
                            color: isUnread ? '#b45309' : '#64748b', 
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: isUnread ? 600 : 400
                          }}>
                            {s.last_message}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.phone_number}</div>
                        )}
                      </div>
                      {isUnread && (
                        <span style={{ 
                          background: '#ef4444', 
                          color: '#fff', 
                          fontSize: 9, 
                          fontWeight: 700, 
                          padding: '2px 6px', 
                          borderRadius: 10,
                          marginLeft: 6,
                          flexShrink: 0
                        }}>
                          NEW
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Area */}
            <div className="admin-chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
              {selectedStudent ? (
                <>
                  {/* Active Chat Header */}
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #eef2f6', background: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="mobile-back-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        marginRight: 8,
                        display: 'none',
                        padding: '4px 8px',
                        borderRadius: 4
                      }}
                    >
                      ← Back
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selectedStudent.full_name || selectedStudent.name}</div>
                      <div style={{ fontSize: 11, color: '#10b981' }}>Student · {selectedStudent.phone_number}</div>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {safeMessages.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 30 }}>
                        <p style={{ margin: 0 }}>No messages yet with this student.</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11 }}>Send a reply to start the conversation!</p>
                      </div>
                    ) : (
                      safeMessages.map((m, i) => {
                        const isMe = Number(m.sender_id) !== Number(selectedStudent.id);
                        return (
                          <div key={m.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                            <div
                              style={{
                                padding: '8px 13px',
                                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                background: isMe ? '#2563eb' : '#fff',
                                color: isMe ? '#fff' : '#0f172a',
                                fontSize: 13,
                                lineHeight: 1.45,
                                wordBreak: 'break-word',
                                border: isMe ? 'none' : '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              {m.message}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                              {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input container */}
                  <div style={{ padding: 10, borderTop: '1px solid #eef2f6', display: 'flex', gap: 8, background: '#fff' }}>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && send()}
                      placeholder={`Reply to ${selectedStudent.full_name || 'student'}...`}
                      style={{
                        flex: 1,
                        padding: '9px 13px',
                        borderRadius: 8,
                        border: '1.5px solid #e2e8f0',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'all 0.15s',
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={!text.trim()}
                      style={{
                        padding: '9px 16px',
                        borderRadius: 8,
                        background: text.trim() ? '#2563eb' : '#94a3b8',
                        color: '#fff',
                        border: 'none',
                        cursor: text.trim() ? 'pointer' : 'default',
                        fontSize: 13,
                        fontWeight: 600,
                        transition: 'all 0.15s'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, padding: 20, textAlign: 'center' }}>
                  <svg style={{ width: 36, height: 36, color: '#cbd5e1', marginBottom: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Select a student from the list to view messages and reply
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
