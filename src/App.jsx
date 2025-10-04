import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import SignIn from "./components/SignIn";
import useMobileBackHandler from "./context/useMobileBackHandler";
import TrackUserActivity from "./context/TrackUserActivity.jsx";


function ChatWrapper() {
  const { chatId } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const navigate = useNavigate();

  // Fetch the otherUser data using chatId
  // Assuming chatId is "uid1_uid2" and user.uid is one of them
  const { user } = useAuth();
  useEffect(() => {
    if (!chatId || !user) return;

    const [uid1, uid2] = chatId.split("_");
    const otherUid = uid1 === user.uid ? uid2 : uid1;

    // Fetch other user's info from Firestore
    import("./firebase").then(({ db }) => {
      import("firebase/firestore").then(async ({ doc, getDoc }) => {
        const docSnap = await getDoc(doc(db, "users", otherUid));
        if (docSnap.exists()) {
          setOtherUser({ uid: otherUid, ...docSnap.data() });
        } else {
          navigate("/"); // fallback if user not found
        }
      });
    });
  }, [chatId, user, navigate]);

  if (!otherUser) return null;
  return <Chat otherUser={otherUser} onClose={() => navigate("/")} />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  useMobileBackHandler(!!selectedUser, () => setSelectedUser(null));

  if (loading) return null;
  if (!user) return <SignIn />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            {!selectedUser && <Dashboard onSelectUser={setSelectedUser} />}
            {selectedUser && (
              <Chat
                otherUser={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            )}
          </>
        }
      />
      <Route path="/chat/:chatId" element={<ChatWrapper />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="w-screen h-screen bg-[#0b0b0b] text-white overflow-hidden">
        <AppRoutes />
        <TrackUserActivity myUid={useAuth()?.user?.uid} />
      </div>
    </Router>
  );
}

export default App;
