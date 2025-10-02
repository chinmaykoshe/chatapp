import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Chat({ otherUser, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef();
  const chatId = [user.uid, otherUser.uid].sort().join('_');

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('ts'));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(doc => doc.data());
      setMessages(msgs);
      scrollToBottom();
    });
    return unsub;
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = { text: text.trim(), from: user.uid, ts: serverTimestamp() };
    await addDoc(collection(db, 'chats', chatId, 'messages'), msg);
    await setDoc(doc(db, 'chats', chatId), {
      participants: [user.uid, otherUser.uid],
      lastMessage: msg.text,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    setText('');
    scrollToBottom();
  };

  return (
    <div className="relative flex flex-col h-screen w-full max-w-4xl mx-auto bg-[var(--bg)] text-[var(--accent)]">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <img src={otherUser.photoURL} alt={otherUser.name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-bold">{otherUser.name}</div>
            <div className="text-sm text-[var(--muted)]">{otherUser.online ? 'Online' : 'Offline'}</div>
          </div>
        </div>
        <button onClick={onClose} className="border px-3 py-1 rounded hover:bg-white/10 transition">Close</button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-[#0f0f10] to-[#111] transition-all"
        style={{ paddingBottom: inputFocused ? '80px' : '20px' }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[70%] p-3 rounded-xl break-words ${m.from === user.uid ? 'self-end bg-[#222]' : 'self-start bg-[#191919]'}`}>
            <div>{m.text}</div>
            <div className="text-[var(--muted)] text-xs mt-1 text-right">
              {m.ts?.seconds ? new Date(m.ts.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div
        className={`fixed left-0 w-full max-w-4xl mx-auto px-4 z-20 transition-all`}
        style={{ bottom: inputFocused ? '0' : '1rem' }}
      >
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="flex-1 p-3 rounded-2xl bg-[#0b0b0b] placeholder-[var(--muted)] outline-none shadow-inner"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-[var(--accent)] text-[var(--bg)] px-4 py-3 rounded-2xl font-semibold hover:bg-white/80 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
