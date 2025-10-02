import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Users({ onSelectUser }) {
  const { user, signoutUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('name'));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(doc => {
        const u = doc.data();
        if (u.uid !== user.uid && u.name.toLowerCase().includes(search.toLowerCase())) list.push(u);
      });
      setUsers(list);
    });
    return unsub;
  }, [search, user.uid]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <aside className="md:w-[30%] w-full p-4 border-r border-[#111] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-bold">{user.displayName}</div>
              <div className="text-sm text-[var(--muted)]">{user.email}</div>
            </div>
          </div>
          <button
            onClick={signoutUser}
            className="text-sm border px-3 py-1 rounded hover:bg-white/10 transition"
          >
            Logout
          </button>
        </div>

        <input
          placeholder="Search users"
          className="p-2 mb-3 rounded bg-[#0b0b0b] outline-none placeholder-[var(--muted)]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <div
              key={u.uid}
              className="flex items-center p-2 gap-3 cursor-pointer hover:bg-[#0b0b0b] rounded"
              onClick={() => onSelectUser(u)}
            >
              <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-sm text-[var(--muted)]">{u.email}</div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="m-auto text-[var(--muted)]">No users found</div>}
        </div>
      </aside>

      {/* Chat placeholder */}
      <main className="md:flex-1 w-full bg-[var(--bg)] flex items-center justify-center text-[var(--muted)]">
        Select a user to chat
      </main>
    </div>
  );
}
