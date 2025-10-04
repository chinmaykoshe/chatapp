import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Avatar from "./Avatar";

// ✅ Font Awesome Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell as faSolidBell,
  faRightFromBracket,
  faPen,
  faXmark,
  faEllipsis
} from "@fortawesome/free-solid-svg-icons";
import { faBell as faRegularBell } from "@fortawesome/free-regular-svg-icons";

export default function ProfileCard() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.displayName || "");
  const [photo, setPhoto] = useState(user.photoURL || "");
  const [preview, setPreview] = useState(
    user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`
  );
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
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
  };

  const toggleNotificationPermission = () => {
    if (Notification.permission === "granted") {
      alert(
        "Permission already granted. To revoke, please disable notifications from your browser settings."
      );
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifGranted(true);
          alert("Notifications enabled!");
        }
      });
    }
  };

  const confirmLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        alert("Logged out successfully!");
      } catch (e) {
        console.error(e);
        alert("Logout failed");
      }
    }
  };

  // ✅ Toggle actions with 3-dots button
  const toggleActions = () => {
    setShowActions((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {/* ✅ Profile Card */}
      <div
        className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4 w-full select-none"
      >
        {/* 3 Dots Button on Far Left */}
        <button
          onClick={toggleActions}
          className="text-[var(--accent)] text-xl p-2 rounded hover:bg-white/10 transition"
          title="Options"
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>

        <Avatar src={preview} name={name} size={64} />

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
      </div>

      {/* ✅ Action Panel (toggles with 3-dots) */}
      {showActions && (
        <div
          className="flex items-center gap-4 mt-3 w-full border-t border-[#222] pt-3 animate-fadeIn"
          style={{ animation: "fadeIn 0.3s ease" }}
        >
          {/* ✏️ Edit / Save */}
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] px-4 py-4 rounded hover:bg-white/10 transition"
          >
            <FontAwesomeIcon icon={faPen} />
            {editing ? "Save" : ""}
          </button>

          {/* 🔔 Notification Bell */}
          <button
            onClick={toggleNotificationPermission}
            className="flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] px-4 py-4 rounded hover:bg-white/10 transition"
            title={
              notifGranted
                ? "Permission granted (click to see revoke info)"
                : "Enable notifications"
            }
          >
            <FontAwesomeIcon
              icon={notifGranted ? faSolidBell : faRegularBell}
            />
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={confirmLogout}
            className="flex items-center gap-2 border border-red-500 text-red-400 px-4 py-4 rounded hover:bg-red-500/20 transition"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            
          </button>

          {/* ❌ Cancel Edit (only if editing) */}
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 border border-gray-500 text-gray-400 px-4 py-1 rounded hover:bg-gray-500/20 transition"
            >
              <FontAwesomeIcon icon={faXmark} />
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
