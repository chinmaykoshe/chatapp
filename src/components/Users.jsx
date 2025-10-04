import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Users({ onSelectUser }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        const u = docSnap.data();
        if (u.uid !== user.uid && u.name.toLowerCase().includes(search.toLowerCase())) {
          list.push(u);
        }
      });

      const sortedList = await Promise.all(
        list.map(async (u) => {
          const chatId = [user.uid, u.uid].sort().join("_");
          const chatDoc = await getDoc(doc(db, "chats", chatId));
          return {
            ...u,
            lastUpdated: chatDoc.exists() ? chatDoc.data().lastUpdated?.toMillis() || 0 : 0,
          };
        })
      );

      sortedList.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
      setUsers(sortedList);
    });

    return () => unsub();
  }, [search, user.uid]);

  useEffect(() => {
    const unsubscribers = [];

    users.forEach((u) => {
      const chatId = [user.uid, u.uid].sort().join("_");
      const msgsRef = collection(db, "chats", chatId, "messages");
      const unsubMsg = onSnapshot(msgsRef, (snap) => {
        let count = 0;
        snap.docs.forEach((msgDoc) => {
          const msg = msgDoc.data();
          if (msg.from === u.uid && !msg.seen) count++;
        });
        setUnreadCounts((prev) => ({ ...prev, [u.uid]: count }));
      });
      unsubscribers.push(unsubMsg);
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [users, user.uid]);

  return (
    <div className="flex flex-col gap-4">
      <input
        placeholder="Search users..."
        className="p-2 rounded bg-[#0b0b0b] outline-none text-[var(--accent)]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div
            key={u.uid}
            onClick={() => onSelectUser(u)}
            className="flex items-center justify-between p-2 rounded hover:bg-[#0b0b0b] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={u.photoURL} name={u.name} size={40} />
              </div>
              <div className="font-semibold text-[var(--accent)]">{u.name}</div>
            </div>
            {unreadCounts[u.uid] > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {unreadCounts[u.uid]}
              </span>
            )}
          </div>
        ))}
        {users.length === 0 && <div className="text-[var(--muted)]">No users found</div>}
      </div>
    </div>
  );
}
