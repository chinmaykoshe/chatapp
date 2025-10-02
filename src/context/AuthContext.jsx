import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await setDoc(
          doc(db, "users", u.uid),
          {
            uid: u.uid,
            name: u.displayName || "User",
            email: u.email,
            username: u.username || "",
            photoURL: u.photoURL || `https://i.pravatar.cc/100?u=${u.uid}`,
            online: true,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      } else setUser(null);

      setLoading(false); // ✅ Set loading false after auth resolves
    });
    return unsub;
  }, []);

  // Signup now accepts username
  const signup = async (email, password, displayName, username) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: displayName,
      email,
      username: username.toLowerCase(),
      photoURL: `https://i.pravatar.cc/100?u=${cred.user.uid}`,
      online: true,
      lastSeen: serverTimestamp(),
    });

    return cred.user;
  };

  const signin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signoutUser = async () => await signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
