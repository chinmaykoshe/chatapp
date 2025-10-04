// components/Avatar.jsx
import React from "react";

const isValidImageUrl = (url) => {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
};

const generateFallbackAvatar = (name) => {
  const initial = name?.charAt(0)?.toUpperCase() || "U";
  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6F91"];
  const bg = colors[Math.floor(Math.random() * colors.length)];
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="${bg}" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="50" fill="white" font-family="Arial">${initial}</text>
    </svg>
  `)}`;
};

export default function Avatar({ src, name, size = 40, className = "" }) {
  const avatarSrc = isValidImageUrl(src) ? src : generateFallbackAvatar(name);
  return (
    <img
      src={avatarSrc}
      alt={name || "User"}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}