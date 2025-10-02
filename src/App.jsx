import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import SignIn from "./components/SignIn";
import Users from "./components/Users";
import Chat from "./components/Chat";

function App() {
  const { user } = useAuth();
  const [chatUser,setChatUser] = useState(null);

  if(!user) return <SignIn />;
  if(chatUser) return <Chat otherUser={chatUser} onClose={()=>setChatUser(null)} />;
  return <Users onSelectUser={setChatUser} />;
}

export default App;
