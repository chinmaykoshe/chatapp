import ProfileCard from "./ProfileCard";
import Users from "./Users";

export default function Dashboard({ onSelectUser }) {
  return (
    <div className="w-full h-full flex flex-col gap-6 p-4">
      <ProfileCard />
      <Users onSelectUser={onSelectUser} />
    </div>
  );
}
