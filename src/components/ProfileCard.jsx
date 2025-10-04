import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Avatar from "./Avatar";

export default function ProfileCard() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.displayName || "");
  const [photo, setPhoto] = useState(user.photoURL || "");

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

  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert("Notifications enabled!");
        }
      });
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (e) {
      console.error(e);
      alert("Logout failed");
    }
  };

  return (
    <div className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4">
      <Avatar src={photo} name={name} size={64} className="w-16 h-16" />
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
      <button
        onClick={() => {
          requestNotificationPermission();
          editing ? handleSave() : setEditing(true);
        }}
        className="border border-[var(--accent)] px-4 py-1 rounded hover:bg-white/10 transition"
      >
        {editing ? "Save" : "Edit"}
      </button>
      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="border border-[var(--accent)] px-4 py-1 rounded hover:bg-white/10 transition"
        >
          Cancel
        </button>
      )}
      <button
        onClick={handleLogout}
        className="border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-500/10 transition"
      >
        Logout
      </button>
    </div>
  );
}