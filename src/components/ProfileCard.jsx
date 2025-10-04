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
<<<<<<< HEAD
=======
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
>>>>>>> f0528b5165e0ecb4c1adc872c6de4112d7dc4ab1

  const handleSave = async () => {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name, photoURL: photo },
        { merge: true }
      );
<<<<<<< HEAD
      await updateProfile(auth.currentUser, { displayName: name, photoURL: photo });
=======

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });

>>>>>>> f0528b5165e0ecb4c1adc872c6de4112d7dc4ab1
      setEditing(false);
      alert("Profile updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
  };

<<<<<<< HEAD
  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
=======
  // Toggle notifications
  const toggleNotificationPermission = () => {
    if (Notification.permission === "granted") {
      alert(
        "Permission already granted. To revoke, please disable notifications from your browser settings."
      );
    } else {
      Notification.requestPermission().then((permission) => {
>>>>>>> f0528b5165e0ecb4c1adc872c6de4112d7dc4ab1
        if (permission === "granted") {
          setNotifGranted(true);
          alert("Notifications enabled!");
        }
      });
    }
  };

<<<<<<< HEAD
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
=======
  // Confirm logout
  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut(auth);
    }
  };

  // Double click to toggle panel
  const handleDoubleClick = () => {
    setShowActions((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Profile Card */}
      <div className="bg-[var(--panel)] p-4 rounded-xl flex items-center gap-4 w-full">
        <img
          src={preview}
          alt={name || "User"}
          className="w-16 h-16 rounded-full object-cover cursor-pointer"
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
      </div>

      {/* Action Panel (toggles with double click) */}
      {showActions && (
        <div className="flex items-center gap-4 mt-3 w-full border-t border-[#222] pt-3">
          {/* ✏️ Edit / Save */}
          <button
            onClick={() => {
              if (editing) {
                handleSave();
              } else {
                setEditing(true);
              }
            }}
            className="border border-[var(--accent)] text-[var(--accent)] px-4 py-1 rounded hover:bg-white/10 transition"
          >
            {editing ? "Save" : "Edit"}
          </button>

          {/* 🔔 Notification Bell */}
          <button
            onClick={toggleNotificationPermission}
            className="text-2xl text-[var(--accent)] hover:scale-110 transition"
            title={
              notifGranted
                ? "Permission granted (click to see revoke info)"
                : "Enable notifications"
            }
          >
            {notifGranted ? (
              <i className="fa-solid fa-bell"></i>
            ) : (
              <i className="fa-regular fa-bell"></i>
            )}
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={confirmLogout}
            className="border border-red-500 text-red-400 px-4 py-1 rounded hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
>>>>>>> f0528b5165e0ecb4c1adc872c6de4112d7dc4ab1
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