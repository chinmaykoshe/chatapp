import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { signin, signup } = useAuth();
  const [tab, setTab] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSignIn = async () => {
    try {
      await signin(email, password);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    const defaultName = email.split("@")[0] || "NewUser";
    const name = prompt("Display name", defaultName);
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

        {/* Tabs */}
        <div className="flex mb-6 border-b border-[#222]">
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 py-2 font-semibold transition ${tab === "signin"
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
              }`}
          >
            Log In
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-2 font-semibold transition ${tab === "signup"
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        {tab === "signup" && (
          <div className="relative mb-6">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 rounded-lg bg-[#0b0b0b] placeholder-[var(--muted)] outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        )}

        <button
          onClick={tab === "signin" ? handleSignIn : handleSignUp}
          className={`w-full p-3 rounded-lg font-semibold transition ${tab === "signin"
              ? "bg-[var(--accent)] text-[var(--bg)] hover:bg-white/80"
              : "border border-[var(--accent)] text-[var(--accent)] hover:bg-white/10"
            }`}
        >
          {tab === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}