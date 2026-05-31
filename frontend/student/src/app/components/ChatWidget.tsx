import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<any>(null);
  const apiUrl = API_URL;

  useEffect(() => {
    // load admins
    fetch(`${apiUrl}/api/admins`)
      .then((r) => r.json())
      .then(setAdmins)
      .catch(() => setAdmins([]));
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedAdmin) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    socketRef.current = io(apiUrl, { auth: { token } });

    socketRef.current.on('private_message', (msg: any) => {
      // Only accept messages relevant to this conversation
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : 0;
      if ((msg.sender_id === selectedAdmin.id && msg.receiver_id === Number(currentUserId)) || (msg.sender_id === Number(currentUserId) && msg.receiver_id === selectedAdmin.id)) {
        setMessages((m) => [...m, msg]);
      }
    });

    // load history
    fetch(`${apiUrl}/api/admin/messages/${selectedAdmin.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => setMessages([]));

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [selectedAdmin, apiUrl]);

  const send = () => {
    if (!text.trim() || !selectedAdmin) return;
    const payload = { to: selectedAdmin.id, message: text.trim() };
    socketRef.current?.emit('private_message', payload);
    setText('');
  };

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}>
      <div>
        <button onClick={() => setOpen((s) => !s)} style={{ padding: 10, borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>
          Chat with Admin
        </button>
      </div>
      {open && (
        <div style={{ width: 360, height: 480, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ padding: 8, borderBottom: '1px solid #eef2f6' }}>
            <strong>Admins</strong>
          </div>
          <div style={{ display: 'flex', height: 'calc(100% - 48px)' }}>
            <div style={{ width: 120, borderRight: '1px solid #eef2f6', overflow: 'auto' }}>
              {admins.map((a) => (
                <div key={a.id} onClick={() => setSelectedAdmin(a)} style={{ padding: 10, cursor: 'pointer', background: selectedAdmin?.id === a.id ? '#eef2ff' : 'transparent' }}>
                  <div style={{ fontWeight: 600 }}>{a.full_name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{a.phone_number}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, padding: 12, overflow: 'auto', background: '#f8fafc' }}>
                {selectedAdmin ? (
                  messages.map((m, i) => (
                    <div key={i} style={{ textAlign: m.sender_id === (JSON.parse(localStorage.getItem('currentUser') || '{}')?.id) ? 'right' : 'left', margin: '8px 0' }}>
                      <div style={{ display: 'inline-block', padding: '8px 10px', borderRadius: 8, background: m.sender_id === (JSON.parse(localStorage.getItem('currentUser') || '{}')?.id) ? '#2563eb' : '#e6e6e6', color: m.sender_id === (JSON.parse(localStorage.getItem('currentUser') || '{}')?.id) ? 'white' : 'black' }}>
                        {m.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', padding: 12 }}>Select an admin to start chat</div>
                )}
              </div>
              <div style={{ padding: 8, borderTop: '1px solid #eef2f6', display: 'flex', gap: 8 }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={selectedAdmin ? `Message ${selectedAdmin.full_name}` : 'Select admin'} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} disabled={!selectedAdmin} />
                <button onClick={send} disabled={!selectedAdmin} style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
