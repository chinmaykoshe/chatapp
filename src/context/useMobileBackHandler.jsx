import { useEffect } from "react";

/**
 * Intercepts the mobile back button (popstate) to close a modal/chat instead of leaving the app.
 * @param {boolean} isChatOpen - Whether chat/modal is currently open
 * @param {function} onCloseChat - Callback to close the chat/modal
 */
export default function useMobileBackHandler(isChatOpen, onCloseChat) {
  useEffect(() => {
    const handlePopState = (e) => {
      if (isChatOpen) {
        e.preventDefault();
        onCloseChat(); // Close the chat
        window.history.pushState(null, ""); // Add dummy state to prevent leaving
      }
    };

    if (isChatOpen) window.history.pushState(null, ""); // Add dummy state

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (isChatOpen) window.history.back(); // Clean up history state
    };
  }, [isChatOpen, onCloseChat]);
}
