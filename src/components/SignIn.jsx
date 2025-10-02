import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { signin, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try { await signin(email, password); } catch (e) { alert(e.message); }
  };

  const handleSignUp = async () => {
    // Extract username from email (before @)
    const defaultName = email.split("@")[0] || "NewUser";
    const name = prompt("Display name", defaultName); // pre-fill with username
    try {
      await signup(email, password, name);
    } catch (e) {
      alert(e.message);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-[var(--panel)] p-8 rounded-2xl shadow-lg w-full max-w-md text-[var(--accent)]">
        <h2 className="text-2xl font-bold mb-6 text-center">BW Chat App</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSignIn} className="flex-1 bg-[var(--accent)] text-[var(--bg)] p-3 rounded-lg font-semibold hover:bg-white/80 transition">Sign In</button>
          <button onClick={handleSignUp} className="flex-1 border border-[var(--accent)] p-3 rounded-lg font-semibold hover:bg-white/10 transition">Sign Up</button>
        </div>
      </div>
    </div>
  );
}
