import React from 'react';

const Logo = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-40 h-40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g fill="url(#logoGradient)">
        {/* Globe */}
        <circle cx="50" cy="50" r="20" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" />
        <path d="M50,30 V70" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" />
        <path d="M30,50 H70" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" />
        <ellipse cx="50" cy="50" rx="10" ry="19.5" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" />
        <ellipse cx="50" cy="50" rx="18" ry="9" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" />

        {/* Nodes */}
        <circle cx="20" cy="25" r="5" />
        <circle cx="80" cy="25" r="5" />
        <circle cx="20" cy="75" r="5" />
        <circle cx="80" cy="75" r="5" />
        <circle cx="50" cy="10" r="5" />
        <circle cx="50" cy="90" r="5" />

        {/* Connections */}
        <path d="M50,30 C40,20 30,20 25,23" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M50,30 C60,20 70,20 75,23" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M32,40 C25,35 22,30 21,29" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M68,40 C75,35 78,30 79,29" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M32,60 C25,65 22,70 21,71" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M68,60 C75,65 78,70 79,71" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M45,20 C48,15 49,12 50,15" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <path d="M45,80 C48,85 49,88 50,85" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
      </g>
    </svg>
  );
};

export default Logo;