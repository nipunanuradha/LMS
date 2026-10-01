import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../config";
import { io } from "socket.io-client";

export default function MessagesPage({ students = [] }) {
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
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
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch all conversations
  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    let currentUserId = "";
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    try {
      const res = await fetch(`${apiUrl}/api/admin/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": String(currentUserId || "")
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
          // If no student is selected yet, optionally select the first conversation
          if (!selectedStudentRef.current && data.length > 0) {
            setSelectedStudent(data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, []);

  // Persistent Socket Connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    let currentUserId = "";
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    const socket = io(apiUrl, {
      auth: { token, userId: currentUserId }
    });
    socketRef.current = socket;

    socket.on("private_message", (msg) => {
      const activeStudent = selectedStudentRef.current;
      const senderId = Number(msg.sender_id);
      const receiverId = Number(msg.receiver_id);
      const activeId = activeStudent ? Number(activeStudent.id) : null;

      // Update conversations list
      setConversations((prev) => {
        const otherId = senderId === Number(currentUserId) ? receiverId : senderId;
        const existing = prev.find(c => Number(c.id) === otherId);
        if (existing) {
          return prev.map(c => Number(c.id) === otherId ? {
            ...c,
            last_message: msg.message,
            last_message_at: msg.created_at || new Date().toISOString(),
            last_sender_id: senderId
          } : c).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
        } else {
          return [{
            id: otherId,
            full_name: "Student",
            last_message: msg.message,
            last_message_at: msg.created_at || new Date().toISOString(),
            last_sender_id: senderId,
            unread_count: 1
          }, ...prev];
        }
      });

      // Append to active conversation if open
      if (activeId && (senderId === activeId || receiverId === activeId)) {
        setMessages((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          const exists = list.some(
            (m) => (msg.id && m.id === msg.id) ||
                   (Number(m.sender_id) === senderId && m.message === msg.message && Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 3000)
          );
          return exists ? list : [...list, msg];
        });
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
    const token = localStorage.getItem("token");
    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    let currentUserId = "";
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    setLoading(true);
    fetch(`${apiUrl}/api/admin/messages/${selectedStudent.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-user-id": String(currentUserId || "")
      }
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent, apiUrl]);

  // Send message / reply
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !selectedStudent || sending) return;

    const msgText = text.trim();
    setText("");
    setSending(true);

    const token = localStorage.getItem("token");
    const currentUserStr = localStorage.getItem("currentUser") || localStorage.getItem("user");
    let currentUserId = "";
    try {
      if (currentUserStr) currentUserId = JSON.parse(currentUserStr).id;
    } catch (e) {}

    const payload = { to: selectedStudent.id, message: msgText };

    // Emit live via socket
    socketRef.current?.emit("private_message", payload);

    try {
      const res = await fetch(`${apiUrl}/api/admin/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": String(currentUserId || "")
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

          // Update conversation list item
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
      console.error("Error sending reply:", err);
    } finally {
      setSending(false);
    }
  };

  // Merge full student list with conversations so admin can also start chatting with any student
  const onlyStudents = students.filter(s => !s.role || s.role === "student");
  const convMap = new Map(conversations.map(c => [Number(c.id), c]));
  
  const mergedList = onlyStudents.map(s => {
    const conv = convMap.get(Number(s.id));
    return {
      ...s,
      last_message: conv ? conv.last_message : null,
      last_message_at: conv ? conv.last_message_at : null,
      unread_count: conv ? conv.unread_count : 0,
      has_conversation: !!conv
    };
  });

  conversations.forEach(c => {
    if (!mergedList.some(s => Number(s.id) === Number(c.id))) {
      mergedList.push({
        id: c.id,
        full_name: c.full_name,
        phone_number: c.phone_number,
        role: c.role || "student",
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread_count: c.unread_count,
        has_conversation: true
      });
    }
  });

  const filteredList = mergedList
    .filter(s => {
      const q = search.toLowerCase();
      return (s.full_name || s.name || "").toLowerCase().includes(q) ||
             (s.phone_number || "").includes(q) ||
             (s.last_message || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.last_message_at && b.last_message_at) {
        return new Date(b.last_message_at) - new Date(a.last_message_at);
      }
      if (a.last_message_at) return -1;
      if (b.last_message_at) return 1;
      return 0;
    });

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div style={{ animation: "fadeIn 0.25s ease", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Student Messages & Support
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Real-time chat with students who initiated consultation via "Chat with Admin"
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            Live Chat Active
          </span>
        </div>
      </div>

      {/* Main Messaging Layout Box */}
      <div className="card" style={{ flex: 1, minHeight: 0, background: "var(--bg-card)", borderRadius: 16, border: "1.5px solid var(--border-color)", display: "flex", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        
        {/* Left Sidebar: Student list */}
        <div style={{ width: 320, minWidth: 320, borderRight: "1.5px solid var(--border-color)", display: "flex", flexDirection: "column", background: "var(--bg-subtle, #f8fafc)" }}>
          {/* Search box */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ position: "relative" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students or messages..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: 10,
                  fontSize: 13,
                  border: "1px solid var(--border-subtle)",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <svg style={{ width: 16, height: 16, position: "absolute", left: 11, top: 10, color: "#94a3b8" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>

          {/* List items */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredList.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No students found
              </div>
            ) : (
              filteredList.map((s) => {
                const isSelected = Number(selectedStudent?.id) === Number(s.id);
                const hasUnread = s.unread_count > 0;
                const initials = (s.full_name || s.name || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: isSelected ? "rgba(37,99,235,0.08)" : "transparent",
                      borderLeft: isSelected ? "4px solid #2563eb" : "4px solid transparent",
                      borderBottom: "1px solid var(--border-subtle, #f1f5f9)",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: (isSelected || hasUnread) ? 700 : 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.full_name || s.name}
                        </div>
                        {s.last_message_at && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6, flexShrink: 0 }}>
                            {new Date(s.last_message_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: hasUnread ? "#b45309" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: hasUnread ? 600 : 400 }}>
                        {s.last_message || s.phone_number}
                      </div>
                    </div>
                    {hasUnread && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Chat conversation */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
          {selectedStudent ? (
            <>
              {/* Top Chat Bar */}
              <div style={{ padding: "14px 20px", borderBottom: "1.5px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                    {(selectedStudent.full_name || selectedStudent.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      {selectedStudent.full_name || selectedStudent.name}
                    </h3>
                    <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>
                      Student · Phone: {selectedStudent.phone_number || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages feed */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-body, #f8fafc)" }}>
                {loading ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "auto", fontSize: 13 }}>
                    Loading conversation...
                  </div>
                ) : safeMessages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "auto", maxWidth: 300 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(37,99,235,0.1)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>No messages yet</div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      Start the consultation by sending a welcoming message to {selectedStudent.full_name || "the student"}.
                    </p>
                  </div>
                ) : (
                  safeMessages.map((m, i) => {
                    const isMe = Number(m.sender_id) !== Number(selectedStudent.id);
                    return (
                      <div key={m.id || i} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            background: isMe ? "#2563eb" : "#ffffff",
                            color: isMe ? "#ffffff" : "var(--text-primary, #0f172a)",
                            fontSize: 13,
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                            border: isMe ? "none" : "1px solid var(--border-color, #e2e8f0)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
                          }}
                        >
                          {m.message}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, textAlign: isMe ? "right" : "left", padding: "0 4px" }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} style={{ padding: "14px 18px", borderTop: "1.5px solid var(--border-color)", display: "flex", gap: 10, background: "var(--bg-card)" }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Type your reply to ${selectedStudent.full_name || "student"}...`}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: 10,
                    border: "1.5px solid var(--border-color)",
                    fontSize: 13,
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  style={{
                    padding: "11px 22px",
                    borderRadius: 10,
                    background: text.trim() && !sending ? "#2563eb" : "var(--border-subtle, #94a3b8)",
                    color: "#fff",
                    border: "none",
                    cursor: text.trim() && !sending ? "pointer" : "default",
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
              <svg style={{ width: 48, height: 48, color: "#cbd5e1", margin: "0 auto 12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Select a Conversation</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Choose a student from the left panel to read and reply to their messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
