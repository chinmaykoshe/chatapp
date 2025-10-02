import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase";

export default function ProfileModal({ userObj, onClose }) {
  const [name, setName] = useState(userObj.name);
  const [photo, setPhoto] = useState(userObj.photoURL);

  const handleSave = async () => {
    try {
      // 1️⃣ Update Firestore
      await setDoc(doc(db, 'users', userObj.uid), { name, photoURL: photo }, { merge: true });

      // 2️⃣ Update Firebase Auth if the current user
      if (auth.currentUser && auth.currentUser.uid === userObj.uid) {
        await updateProfile(auth.currentUser, { displayName: name, photoURL: photo });
      }

      alert('Profile updated successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--panel)] p-6 rounded-2xl w-full max-w-md text-[var(--accent)]">
        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Display name" 
          className="w-full p-3 mb-3 rounded-lg bg-[#0b0b0b] outline-none placeholder-[var(--muted)]" 
        />
        <input 
          value={photo} 
          onChange={e => setPhoto(e.target.value)} 
          placeholder="Photo URL" 
          className="w-full p-3 mb-4 rounded-lg bg-[#0b0b0b] outline-none placeholder-[var(--muted)]" 
        />
        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-[var(--accent)] text-[var(--bg)] p-3 rounded-lg font-semibold hover:bg-white/80 transition">Save</button>
          <button onClick={onClose} className="flex-1 border border-[var(--accent)] p-3 rounded-lg hover:bg-white/10 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}
