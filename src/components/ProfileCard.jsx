import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function ProfileCard() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.displayName || "");
  const [photo, setPhoto] = useState(user.photoURL || "");
  const [preview, setPreview] = useState(user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`);

  useEffect(() => {
    setPreview(photo || `https://i.pravatar.cc/100?u=${user.uid}`);
  }, [photo, user.uid]);

  const handleSave = async () => {
    try {
      // Update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        { name, photoURL: photo },
        { merge: true }
      );

      // Update Firebase Auth profile
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
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert("Notifications enabled!");
        }
      });
    }
  };

  return (
    <div className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4">
      <img
        src={preview}
        alt={name || "User"}
        className="w-16 h-16 rounded-full object-cover"
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
      <button
        onClick={() => {
          requestNotificationPermission(); // ask here
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
    </div>
  );
}
