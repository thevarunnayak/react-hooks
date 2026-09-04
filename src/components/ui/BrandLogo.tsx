import React from 'react';

export interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 28,
  className = '',
  glow = true,
}) => {
  return (
    <div
      className={`brand-logo-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glow ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.55))' : 'none',
          transition: 'filter 0.3s ease, transform 0.3s ease',
        }}
      >
        <defs>
          <linearGradient id="brandHookGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="brandOrbitGrad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="brandNodeGlow" cx="24" cy="16" r="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow Aura */}
        <circle cx="24" cy="22" r="15" fill="url(#brandNodeGlow)" opacity="0.45" />

        {/* React Orbital Ellipses */}
        <ellipse
          cx="24"
          cy="24"
          rx="19"
          ry="7.5"
          transform="rotate(-30 24 24)"
          stroke="url(#brandOrbitGrad)"
          strokeWidth="2.2"
          strokeOpacity="0.8"
          strokeDasharray="4 2"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="19"
          ry="7.5"
          transform="rotate(30 24 24)"
          stroke="url(#brandOrbitGrad)"
          strokeWidth="2.2"
          strokeOpacity="0.8"
          strokeDasharray="4 2"
        />

        {/* The Signature React Hook Path (Fluid Precision Bezier Curve) */}
        <path
          d="M16 14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14C32 20 25 24 22 28C19 32 18 36 21 39.5C24 43 29 42 32 38.5C34 36 34.5 33 33 30.5"
          stroke="url(#brandHookGrad)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Reactive Quantum Center Nucleus */}
        <circle cx="24" cy="14" r="3.2" fill="#ffffff" />
        <circle cx="24" cy="14" r="5" stroke="#38bdf8" strokeWidth="1.5" opacity="0.95" />

        {/* Barbed Anchor Glow Tip */}
        <circle cx="33" cy="30.5" r="2.2" fill="#ec4899" />
      </svg>
    </div>
  );
};
