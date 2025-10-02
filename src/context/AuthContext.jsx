import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          name: u.displayName || "User",
          email: u.email,
          photoURL: u.photoURL || `https://i.pravatar.cc/100?u=${u.uid}`,
          online: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else setUser(null);
    });
    return unsub;
  }, []);

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const signin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signoutUser = async () => await signOut(auth);

  return (
    <AuthContext.Provider value={{ user, signin, signup, signoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
