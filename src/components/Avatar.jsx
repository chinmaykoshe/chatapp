// components/Avatar.jsx
import React from "react";

const isValidImageUrl = (url) => {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
};

// ✅ Convert string → hash → HSL color (always same for same name)
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360; // hue: 0-359 (full color wheel)
  const saturation = 60 + (Math.abs(hash) % 20); // 60–80%
  const lightness = 45 + (Math.abs(hash) % 10); // 45–55%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const generateFallbackAvatar = (name) => {
  const initial = name?.charAt(0)?.toUpperCase() || "U";
  const bg = stringToColor(name || "User");
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="${bg}" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="white" font-family="Arial">${initial}</text>
    </svg>
  `)}`;
};

export default function Avatar({ src, name = "User", size = 40, className = "" }) {
  const avatarSrc = isValidImageUrl(src) ? src : generateFallbackAvatar(name);
  return (
    <img
      src={avatarSrc}
      alt={name}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
