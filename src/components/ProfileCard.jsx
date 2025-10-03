import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function ProfileCard() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.displayName || "");
  const [photo, setPhoto] = useState(user.photoURL || "");
  const [preview, setPreview] = useState(user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`);
  const [longPressTimer, setLongPressTimer] = useState(null);

  useEffect(() => {
    setPreview(photo || `https://i.pravatar.cc/100?u=${user.uid}`);
  }, [photo, user.uid]);

  const handleSave = async () => {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name, photoURL: photo },
        { merge: true }
      );

      await updateProfile(auth.currentUser, { displayName: name, photoURL: photo });

      setEditing(false);
      alert("Profile updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          alert("Notifications enabled!");
        }
      });
    } else {
      alert("Notifications already enabled!");
    }
  };

  // Revoke notification permission (workaround: open browser settings)
  const revokeNotificationPermission = () => {
    alert("To revoke notifications, please disable them from your browser settings.");
  };

  // Handle long press on profile picture
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setEditing(true);
    }, 800); // 800ms long press
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer);
  };

  return (
    <div className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4">
      <img
        src={preview}
        alt={name || "User"}
        className="w-16 h-16 rounded-full object-cover cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      />
      {editing ? (
        <div className="flex-1 flex flex-col gap-2">
          <input
            className="p-2 rounded bg-[#0b0b0b] outline-none text-[var(--accent)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display Name"
          />
          <input
            className="p-2 rounded bg-[#0b0b0b] outline-none text-[var(--accent)]"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="Photo URL"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="font-bold text-[var(--accent)]">{user.displayName}</div>
        </div>
      )}

      {/* Edit/Save Button */}
      <button
        onClick={() => {
          requestNotificationPermission();
          editing ? handleSave() : setEditing(true);
        }}
        className="border border-[var(--accent)] px-4 py-1 rounded hover:bg-white/10 transition"
      >
        {editing ? "Save" : "Edit"}
      </button>

      {/* Cancel button */}
      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="border border-[var(--accent)] px-4 py-1 rounded hover:bg-white/10 transition"
        >
          Cancel
        </button>
      )}

      {/* Revoke Notifications */}
      <button
        onClick={revokeNotificationPermission}
        className="border border-red-500 text-red-400 px-4 py-1 rounded hover:bg-red-500/20 transition"
      >
        Revoke
      </button>

      {/* Logout Button */}
      <button
        onClick={() => signOut(auth)}
        className="border border-red-500 text-red-400 px-4 py-1 rounded hover:bg-red-500/20 transition"
      >
        Logout
      </button>
    </div>
  );
}