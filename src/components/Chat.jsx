import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  Timestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Chat({ otherUser, onClose, isOpen }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const containerRef = useRef();

  const CHAT_BATCH_SIZE = 25;

  // ✅ Stable getChatId
  const getChatId = useCallback(async () => {
    const possibleChatIds = [
      `${user.uid}_${otherUser.uid}`,
      `${otherUser.uid}_${user.uid}`,
    ];
    for (let id of possibleChatIds) {
      const docSnap = await getDoc(doc(db, "chats", id));
      if (docSnap.exists()) return id;
    }
    return [user.uid, otherUser.uid].sort().join("_");
  }, [user.uid, otherUser?.uid]);

  // ✅ Load messages batch
  const loadMessages = useCallback(
    async (loadOlder = false) => {
      if (!otherUser) return;
      const chatId = await getChatId();
      const msgsRef = collection(db, "chats", chatId, "messages");

      let q = query(msgsRef, orderBy("ts", "desc"), limit(CHAT_BATCH_SIZE));

      if (loadOlder && lastVisible) {
        q = query(
          msgsRef,
          orderBy("ts", "desc"),
          startAfter(lastVisible),
          limit(CHAT_BATCH_SIZE)
        );
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        const msgsBatch = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (loadOlder) {
          setMessages((prev) => [...prev, ...msgsBatch]);
        } else {
          setMessages(msgsBatch);
        }
        setLastVisible(snap.docs[snap.docs.length - 1]);
        if (snap.docs.length < CHAT_BATCH_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    },
    [otherUser, lastVisible, getChatId]
  );

  // ✅ Real-time listener
  useEffect(() => {
    if (!otherUser) return;
    let unsub;
    const setupListener = async () => {
      const chatId = await getChatId();
      const msgsRef = collection(db, "chats", chatId, "messages");
      const q = query(msgsRef, orderBy("ts", "desc"), limit(CHAT_BATCH_SIZE));

      unsub = onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);

        // Count new messages
        const unseenCount = msgs.filter(
          (m) => m.from === otherUser.uid && !m.seen
        ).length;
        setNewMsgCount(unseenCount);
      });
    };
    setupListener();
    return () => unsub?.();
  }, [otherUser, getChatId]);

  // ✅ Mark messages as seen when loaded
  useEffect(() => {
    if (!otherUser || !messages.length) return;

    const markSeen = async () => {
      const chatId = await getChatId();
      const updates = messages
        .filter((m) => m.from === otherUser.uid && !m.seen)
        .map((m) => {
          const msgRef = doc(db, "chats", chatId, "messages", m.id);
          return setDoc(msgRef, { seen: true }, { merge: true });
        });
      if (updates.length > 0) await Promise.all(updates);
    };

    markSeen();
  }, [messages, otherUser, getChatId]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!text.trim() || !otherUser) return;
    const chatId = [user.uid, otherUser.uid].sort().join("_");

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

  // ✅ Scroll helper
  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setNewMsgCount(0);
  };

  // ✅ Infinite scroll for older messages
  const handleScroll = () => {
    if (!containerRef.current || !hasMore) return;
    if (containerRef.current.scrollTop < 50) {
      loadMessages(true);
    }
  };

  if (!otherUser) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[var(--bg)] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#111]">
        <div className="flex items-center gap-3">
          <img
            src={otherUser.photoURL}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="font-bold">{otherUser.name}</div>
            <div className="text-sm text-[var(--muted)]">
              {otherUser.online ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="border px-3 py-1 rounded hover:bg-white/10 transition"
        >
          Back
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3 bg-[#111]"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map((m) => {
          const isSent = m.from === user.uid;
          return (
            <div
              key={m.id}
              className={`max-w-[70%] p-3 rounded-xl ${
                isSent ? "self-end bg-[#222]" : "self-start bg-[#191919]"
              }`}
            >
              <div>{m.text}</div>
              <div className="text-[var(--muted)] text-xs mt-1 flex justify-end gap-1 items-center">
                {m.ts?.seconds &&
                  new Date(m.ts.seconds * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                {isSent && (
                  <span
                    className={`ml-1 text-sm ${
                      m.seen ? "text-green-500" : "text-blue-400"
                    }`}
                  >
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-2xl bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-3 bg-[var(--accent)] rounded-2xl font-semibold hover:bg-white/80 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}