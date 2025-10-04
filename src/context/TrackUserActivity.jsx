import { useEffect, useRef } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function TrackUserActivity({ myUid }) {
  const activityTimeout = useRef(null);
  const lastWriteTime = useRef(0);

  useEffect(() => {
    if (!myUid) return;

    const updateOnline = async () => {
      const now = Date.now();
      // Throttle writes to once every 10 sec
      if (now - lastWriteTime.current < 10000) return;
      lastWriteTime.current = now;

      await setDoc(
        doc(db, "users", myUid),
        { online: true, lastSeen: serverTimestamp() },
        { merge: true }
      );
    };

    const goOffline = async () => {
      await setDoc(
        doc(db, "users", myUid),
        { online: false, lastSeen: serverTimestamp() },
        { merge: true }
      );
    };

    // Handle user activity
    const handleActivity = () => {
      updateOnline();

      if (activityTimeout.current) clearTimeout(activityTimeout.current);

      // Set offline after 1 minute of inactivity
      activityTimeout.current = setTimeout(goOffline, 60000);
    };

    // Listen to user interactions
    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    // Listen to tab visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateOnline();
      } else {
        goOffline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Heartbeat: update online every 30 seconds if tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") updateOnline();
    }, 30000);

    // Cleanup
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
    };
  }, [myUid]);

  return null; // This component only tracks activity, no UI
}
