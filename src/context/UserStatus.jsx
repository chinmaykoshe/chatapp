import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function UserStatus({ uid }) {
  const [status, setStatus] = useState({ online: false, lastSeen: null });

  useEffect(() => {
    if (!uid) return;

    let snapData = null;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (!snap.exists()) return;
      snapData = snap.data();
      updateStatus();
    });

    const updateStatus = () => {
      if (!snapData) return;
      const lastSeenDate = snapData.lastSeen?.toDate() || null;
      const now = new Date();

      // User is online if online flag is true AND lastSeen within 1 min
      const isOnline = !!snapData.online && lastSeenDate && now - lastSeenDate < 60000;

      setStatus({ online: isOnline, lastSeen: lastSeenDate });
    };

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [uid]);

  const formatLastSeen = (date) => {
    if (!date) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <span className="text-sm text-[var(--muted)]">
      {status.online
        ? "Online"
        : status.lastSeen
        ? `Last seen: ${formatLastSeen(status.lastSeen)}`
        : "Offline"}
    </span>
  );
}
