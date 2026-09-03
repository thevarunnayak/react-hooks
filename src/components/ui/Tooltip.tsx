import React, { useState, useRef, useEffect, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { formatKeybinding } from '../../utils/platform';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  shortcut?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  disabled = false,
  shortcut,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; isReady: boolean }>({
    top: 0,
    left: 0,
    isReady: false,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    const margin = 8;
    const padding = 10;
    const tooltipWidth = tooltip.width;
    const tooltipHeight = tooltip.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetPlacement = placement;

    // 1. Placement boundary checks & auto-flip
    if (placement === 'top') {
      if (trigger.top - tooltipHeight - margin < padding) {
        targetPlacement = 'bottom';
      }
    } else if (placement === 'bottom') {
      if (trigger.bottom + tooltipHeight + margin > viewportHeight - padding) {
        targetPlacement = 'top';
      }
    } else if (placement === 'left') {
      if (trigger.left - tooltipWidth - margin < padding) {
        targetPlacement = 'right';
      }
    } else if (placement === 'right') {
      if (trigger.right + tooltipWidth + margin > viewportWidth - padding) {
        targetPlacement = 'left';
      }
    }

    let top = 0;
    let left = 0;

    if (targetPlacement === 'top') {
      top = trigger.top - tooltipHeight - margin;
      left = trigger.left + (trigger.width - tooltipWidth) / 2;
    } else if (targetPlacement === 'bottom') {
      top = trigger.bottom + margin;
      left = trigger.left + (trigger.width - tooltipWidth) / 2;
    } else if (targetPlacement === 'left') {
      top = trigger.top + (trigger.height - tooltipHeight) / 2;
      left = trigger.left - tooltipWidth - margin;
    } else if (targetPlacement === 'right') {
      top = trigger.top + (trigger.height - tooltipHeight) / 2;
      left = trigger.right + margin;
    }

    // 2. Strict 2D viewport clamping: Guarantee zero cutoff anywhere on screen!
    left = Math.max(padding, Math.min(viewportWidth - tooltipWidth - padding, left));
    top = Math.max(padding, Math.min(viewportHeight - tooltipHeight - padding, top));

    setCoords({ top, left, isReady: true });
  };

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setCoords((prev) => ({ ...prev, isReady: false }));
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Calculate position immediately after mount/display before paint
  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, content]);

  // Recalculate position on scroll or resize while visible
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible]);

  // Clone child to attach mouse event handlers and trigger ref
  const child = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const { ref } = children as any;
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as any).current = node;
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      handleMouseEnter();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      handleMouseLeave();
    },
    'aria-describedby': isVisible ? tooltipId : undefined,
  });

  return (
    <>
      {child}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'none',
              zIndex: 99999,
              pointerEvents: 'none',
              backgroundColor: 'var(--bg-surface-elevated, #1a1d27)',
              color: 'var(--text-primary, #ffffff)',
              border: '1px solid var(--border-strong, rgba(255, 255, 255, 0.15))',
              borderRadius: 'var(--radius-sm, 6px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
              padding: '5px 9px',
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100vw - 20px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: coords.isReady ? 1 : 0,
              transition: 'opacity 120ms ease, top 60ms ease, left 60ms ease',
            }}
          >
            <span>{content}</span>
            {shortcut && (
              <kbd
                style={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-secondary, #9ca3af)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {formatKeybinding(shortcut)}
              </kbd>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
