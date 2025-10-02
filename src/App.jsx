import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import SignIn from "./components/SignIn";
import useMobileBackHandler from "./context/useMobileBackHandler";

function App() {
  const { user, loading } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  // Mobile back button handler
  useMobileBackHandler(!!selectedUser, () => setSelectedUser(null));

  if (loading) return null; // Optional: show loader while auth state initializes
  if (!user) return <SignIn />;

  return (
    <div className="w-screen h-screen bg-[#0b0b0b] text-white overflow-hidden">
      {!selectedUser && <Dashboard onSelectUser={setSelectedUser} />}
      {selectedUser && (
        <Chat
          otherUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          isOpen={!!selectedUser}
        />
      )}
    </div>
  );
}

export default App;
