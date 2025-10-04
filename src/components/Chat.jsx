import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import UserStatus from "../context/UserStatus";

export default function Chat({ otherUser, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [newMsgCount, setNewMsgCount] = useState(0);
  const containerRef = useRef();
  const chatIdRef = useRef(null);
  const inputRef = useRef();
  const fileInputRef = useRef();
  const CHAT_BATCH_SIZE = 25;

  // ------------------- Helper: Get Chat ID -------------------
  const getChatId = useCallback(async () => {
    if (!user || !otherUser) return null;
    if (chatIdRef.current) return chatIdRef.current;

    const possibleIds = [`${user.uid}_${otherUser.uid}`, `${otherUser.uid}_${user.uid}`];
    for (let id of possibleIds) {
      const docSnap = await getDoc(doc(db, "chats", id));
      if (docSnap.exists()) {
        chatIdRef.current = id;
        return id;
      }
    }
    const newId = [user.uid, otherUser.uid].sort().join("_");
    chatIdRef.current = newId;
    return newId;
  }, [user, otherUser]);

  // ------------------- Send Text Message -------------------
  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!user || !otherUser) return;

    const chatId = await getChatId();
    if (!chatId) return;

    const msg = {
      text: text.trim(),
      from: user.uid,
      ts: Timestamp.now(),
      seen: false,
    };

    await addDoc(collection(db, "chats", chatId, "messages"), msg);
    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [user.uid, otherUser.uid],
        lastMessage: msg.text,
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    setText("");
  };

  // ------------------- Handle File Upload -------------------
  const handleFileUpload = async () => {
    alert("File upload coming soon! 🚧");
  };

  // ------------------- Scroll to Bottom -------------------
  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
    setNewMsgCount(0);
  };

  // ------------------- Notifications -------------------
  const notifyUser = useCallback(async (latestMsg, chatId) => {
    if ("Notification" in window && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(`New message from ${otherUser.name}`, {
          body: latestMsg.text || "📎 Message",
          icon: otherUser.photoURL || "/default-avatar.png",
          data: { chatId },
        });
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`New message from ${otherUser.name}`, {
        body: latestMsg.text || "📎 Message",
        icon: otherUser.photoURL || "/default-avatar.png",
      });
    }
  }, [otherUser]);

  // ------------------- Autofocus Input -------------------
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ------------------- Real-time Messages -------------------
  useEffect(() => {
    if (!user || !otherUser) return;
    let unsub;
    const lastNotifiedMsgRef = { current: null };

    const setupListener = async () => {
      const chatId = await getChatId();
      if (!chatId) return;

      const msgsRef = collection(db, "chats", chatId, "messages");
      const q = query(msgsRef, orderBy("ts", "desc"), limit(CHAT_BATCH_SIZE));

      unsub = onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);

        const unseenCount = msgs.filter((m) => m.from === otherUser.uid && !m.seen).length;
        setNewMsgCount(unseenCount);

        const latestMsg = msgs[0];
        if (
          latestMsg &&
          latestMsg.from === otherUser.uid &&
          !latestMsg.seen &&
          lastNotifiedMsgRef.current !== latestMsg.id
        ) {
          lastNotifiedMsgRef.current = latestMsg.id;

          const audio = new Audio(process.env.PUBLIC_URL + "/notification.mp3");
          audio.play().catch(() => {});

          notifyUser(latestMsg, chatId);
        }
      });
    };

    setupListener();
    return () => unsub?.();
  }, [user, otherUser, getChatId, notifyUser]);

  // ------------------- Mark Messages Seen -------------------
  useEffect(() => {
    if (!user || !otherUser || messages.length === 0) return;

    const markSeen = async () => {
      const chatId = await getChatId();
      if (!chatId) return;

      const updates = messages
        .filter((m) => m.from === otherUser.uid && !m.seen)
        .map((m) => setDoc(doc(db, "chats", chatId, "messages", m.id), { seen: true }, { merge: true }));

      if (updates.length) await Promise.all(updates);
    };

    markSeen();
  }, [messages, user, otherUser, getChatId]);

  // ------------------- Render -------------------
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[var(--bg)] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <Avatar src={otherUser?.photoURL} name={otherUser?.name} size={40} />
          <div>
            <div className="font-bold text-white">{otherUser?.name || "User"}</div>
            <div className="text-sm text-[var(--muted)]">
              <UserStatus uid={otherUser?.uid} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="border px-3 py-1 rounded hover:bg-white/10 transition">
          Back
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3 bg-[#111]" ref={containerRef}>
        {messages.length === 0 && (
          <div className="text-[var(--muted)] text-center mt-5">No messages yet</div>
        )}

        {messages.map((m) => {
          const isSent = m.from === user.uid;
          return (
            <div
              key={m.id}
              className={`max-w-[70%] p-3 rounded-xl ${isSent ? "self-end bg-[#222]" : "self-start bg-[#191919]"}`}
            >
              <div>{m.text}</div>
              <div className="text-[var(--muted)] text-xs mt-1 flex justify-end gap-1 items-center">
                {m.ts?.seconds &&
                  new Date(m.ts.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {isSent && (
                  <span className={`ml-1 text-sm ${m.seen ? "text-green-500" : "text-blue-400"}`}>
                    {m.seen ? "✔✔" : "✔"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {newMsgCount > 0 && (
          <button
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[var(--accent)] text-[var(--bg)] px-4 py-2 rounded-full"
            onClick={scrollToBottom}
          >
            {newMsgCount} New
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t border-[#111]">
        <input
          value={text}
          ref={inputRef}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-2xl bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
        />
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          📎
        </button>
        <button
          onClick={sendMessage}
          className="px-4 py-3 bg-blue rounded-2xl font-semibold hover:bg-white/80 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
