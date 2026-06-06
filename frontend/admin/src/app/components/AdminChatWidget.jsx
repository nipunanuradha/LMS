import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

export default function AdminChatWidget({ students = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadStudentIds, setUnreadStudentIds] = useState([]);
  const socketRef = useRef(null);
  const apiUrl = API_URL;

  const onlyStudents = students.filter(s => !s.role || s.role === 'student');

  // Sort students: those with unread messages first, then others
  const sortedStudents = [...onlyStudents].sort((a, b) => {
    const aUnread = unreadStudentIds.includes(a.id);
    const bUnread = unreadStudentIds.includes(b.id);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    return 0;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect socket
    socketRef.current = io(apiUrl, { auth: { token } });

    socketRef.current.on('private_message', (msg) => {
      // If we are currently chatting with this sender, append the message
      if (
        selectedStudent &&
        (msg.sender_id === selectedStudent.id || msg.receiver_id === selectedStudent.id)
      ) {
        setMessages((m) => [...m, msg]);
      } else {
        // If chat is closed or we are chatting with someone else, increment unread count
        setUnreadCount((c) => c + 1);
        
        // Track which student has unread messages
        const studentId = msg.sender_id;
        setUnreadStudentIds((prev) => {
          if (!prev.includes(studentId)) {
            return [...prev, studentId];
          }
          return prev;
        });
      }
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [selectedStudent]);

  // Load message history when selecting a student
  useEffect(() => {
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${apiUrl}/api/admin/messages/${selectedStudent.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => setMessages([]));
  }, [selectedStudent]);

  const send = () => {
    if (!text.trim() || !selectedStudent) return;
    const payload = { to: selectedStudent.id, message: text.trim() };
    socketRef.current?.emit('private_message', payload);
    setText('');
  };

  const handleOpenToggle = () => {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0); // clear count when opening
    }
  };

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
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
            <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div style={{ width: 500, height: 450, background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', borderRadius: 14, overflow: 'hidden', marginTop: 10, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', background: '#0F172A', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Student Messages</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar list of students */}
            <div style={{ width: 180, borderRight: '1px solid #eef2f6', overflowY: 'auto', background: '#f8fafc' }}>
              {onlyStudents.length === 0 ? (
                <div style={{ padding: 12, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No students found</div>
              ) : (
                sortedStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  const isUnread = unreadStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setUnreadStudentIds((prev) => prev.filter((id) => id !== s.id));
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
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.phone_number}</div>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
              {selectedStudent ? (
                <>
                  {/* Active Chat Header */}
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #eef2f6', background: '#fff' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selectedStudent.full_name || selectedStudent.name}</div>
                    <div style={{ fontSize: 11, color: '#10b981' }}>Student</div>
                  </div>

                  {/* Messages list */}
                  <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {messages.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 20 }}>No messages yet. Send a greeting!</div>
                    ) : (
                      messages.map((m, i) => {
                        const isMe = m.sender_id !== selectedStudent.id;
                        return (
                          <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                background: isMe ? '#2563eb' : '#e2e8f0',
                                color: isMe ? '#fff' : '#0f172a',
                                fontSize: 13,
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                              }}
                            >
                              {m.message}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input container */}
                  <div style={{ padding: 10, borderTop: '1px solid #eef2f6', display: 'flex', gap: 8 }}>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && send()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1.5px solid #e2e8f0',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'all 0.15s',
                      }}
                    />
                    <button
                      onClick={send}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, padding: 20, textAlign: 'center' }}>
                  Select a student from the list to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
