import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export interface ScrollToTopNotchProps {
  /** Scroll distance threshold in pixels before the notch appears (default: 240) */
  threshold?: number;
}

export const ScrollToTopNotch: React.FC<ScrollToTopNotchProps> = ({ threshold = 240 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop || 0;
          setIsVisible(currentY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      aria-label="Scroll to top of page"
      title="Scroll to top"
      className="scroll-top-notch"
      style={{
        width: isHovered ? '136px' : '34px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible
          ? isPressed
            ? 'translateX(0) scale(0.96)'
            : 'translateX(0)'
          : 'translateX(100%)',
      }}
    >
      {/* Icon Area: Exactly 34px wide so it is ALWAYS dead-center in closed state and never clipped */}
      <div
        className="scroll-top-notch-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          minWidth: '34px',
          flexShrink: 0,
          transform: isHovered ? 'translateY(-1px)' : 'none',
          transition: 'transform 0.15s ease',
        }}
      >
        <ArrowUp size={15} strokeWidth={2.6} />
      </div>

      {/* Label: Only takes width when hovered, zero width and padding in closed state */}
      <div
        style={{
          width: isHovered ? 'auto' : '0px',
          maxWidth: isHovered ? '100px' : '0px',
          opacity: isHovered ? 1 : 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          paddingRight: isHovered ? '12px' : '0px',
          transition: 'max-width 0.2s ease, opacity 0.16s ease, padding 0.16s ease',
          pointerEvents: 'none',
        }}
      >
        <span
          className="scroll-top-notch-label"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
            transform: isHovered ? 'translateX(0)' : 'translateX(6px)',
            transition: 'transform 0.18s ease',
          }}
        >
          Scroll to top
        </span>
      </div>
    </button>
  );
};
