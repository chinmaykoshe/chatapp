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
  const [preview, setPreview] = useState(
    user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`
  );
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [notifGranted, setNotifGranted] = useState(
    Notification.permission === "granted"
  );

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

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });

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
          setNotifGranted(true);
          alert("Notifications enabled!");
        }
      });
    }
  };

  // Revoke notification (browser only allows manual revoke)
  const revokeNotificationPermission = () => {
    alert(
      "To revoke notifications, please disable them from your browser settings."
    );
  };

  // Long press to reveal actions
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowActions(true);
      setEditing(true);
    }, 800); // 800ms long press
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer);
  };

  // Double click to reveal actions
  const handleDoubleClick = () => {
    setShowActions(true);
    setEditing(true);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Profile Card */}
      <div className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4 w-full">
        <img
          src={preview}
          alt={name || "User"}
          className="w-16 h-16 rounded-full object-cover cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onDoubleClick={handleDoubleClick}
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
            <div className="font-bold text-[var(--accent)]">
              {user.displayName}
            </div>
          </div>
        )}

        {/* Edit / Save button */}
        <button
          onClick={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }
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
      </div>

      {/* Actions (appear below card only if long press / double click) */}
      {showActions && (
        <div className="flex gap-3 mt-2 w-full">
          {/* Notification button */}
          <button
            onClick={requestNotificationPermission}
            disabled={notifGranted}
            className={`border px-4 py-1 rounded transition ${
              notifGranted
                ? "border-gray-500 text-gray-400 cursor-not-allowed"
                : "border-[var(--accent)] text-[var(--accent)] hover:bg-white/10"
            }`}
          >
            {notifGranted ? "Permission Granted" : "Enable Notifications"}
          </button>

          {/* Revoke notifications */}
          <button
            onClick={revokeNotificationPermission}
            className="border border-red-500 text-red-400 px-4 py-1 rounded hover:bg-red-500/20 transition"
          >
            Revoke
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut(auth)}
            className="border border-red-500 text-red-400 px-4 py-1 rounded hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}