import { useState, useEffect } from "react";
import "./NotificationBanner.css";

function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="global-notification-banner">
      <div className="banner-content">
        <span className="banner-badge">NEW</span>
        <span className="banner-text">Welcome to the upgraded Digital Talent Management platform! Enjoy the new Orange Glow Dashboard.</span>
      </div>
      <button className="banner-close" onClick={() => setIsVisible(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}

export default NotificationBanner;
