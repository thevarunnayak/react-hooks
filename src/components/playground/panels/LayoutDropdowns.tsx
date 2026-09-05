import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Minimize2,
  Columns,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';

// ==========================================
// 1. CUSTOM JUSTIFY DROPDOWN
// ==========================================

export interface JustifyOption {
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export const JUSTIFY_OPTIONS: JustifyOption[] = [
  { value: 'flex-start', label: 'Start (Left / Top)', shortLabel: 'Start', icon: <AlignLeft size={13} /> },
  { value: 'center', label: 'Center', shortLabel: 'Center', icon: <AlignCenter size={13} /> },
  { value: 'flex-end', label: 'End (Right / Bottom)', shortLabel: 'End', icon: <AlignRight size={13} /> },
  { value: 'space-between', label: 'Space Between', shortLabel: 'Between', icon: <AlignJustify size={13} /> },
  { value: 'space-around', label: 'Space Around', shortLabel: 'Around', icon: <AlignJustify size={13} /> },
  { value: 'space-evenly', label: 'Space Evenly', shortLabel: 'Evenly', icon: <AlignJustify size={13} /> },
  { value: 'stretch', label: 'Stretch', shortLabel: 'Stretch', icon: <Maximize2 size={13} /> },
];

export interface JustifyDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const JustifyDropdown: React.FC<JustifyDropdownProps> = ({
  value = 'flex-start',
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [customVal, setCustomVal] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  const selectedPreset = JUSTIFY_OPTIONS.find((opt) => opt.value === value);
  const isCustom = !selectedPreset && Boolean(value);

  // Position calculation with boundary detection
  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 290;

    let left = rect.left;
    let top = rect.bottom + 4;

    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 4);
    }

    setMenuCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setCustomVal(isCustom ? value : '');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleSelectPreset = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    const trimmed = customVal.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        data-no-drag="true"
        onClick={handleToggle}
        title={`Justify Content: ${selectedPreset ? selectedPreset.label : value}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10.5px',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isOpen ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
          border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          color: isCustom ? 'var(--accent-primary)' : 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'all var(--transition-fast)',
        }}
      >
        {selectedPreset?.icon || <AlignLeft size={11} />}
        <span>Justify: {selectedPreset ? selectedPreset.shortLabel : value}</span>
        <ChevronDown
          size={10}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
            color: 'var(--text-muted)',
          }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            data-no-drag="true"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuCoords.top,
              left: menuCoords.left,
              width: '190px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: '6px',
              zIndex: 99999,
              fontSize: '11px',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              animation: 'fadeIn 120ms ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)',
                padding: '4px 6px',
                marginBottom: '2px',
              }}
            >
              Justify Content
            </div>

            {/* Presets List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {JUSTIFY_OPTIONS.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectPreset(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {opt.icon}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={12} style={{ color: 'var(--accent-primary)' }} />}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border-subtle)',
                margin: '6px 0',
              }}
            />

            {/* Custom Justify Input */}
            <div style={{ padding: '2px 4px' }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                }}
              >
                Custom Value
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={customVal}
                  placeholder="e.g. space-evenly"
                  onChange={(e) => setCustomVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustom();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '10.5px',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  Set
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// ==========================================
// 2. CUSTOM GAP DROPDOWN
// ==========================================

export const GAP_PRESETS: string[] = ['0px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px'];

export interface GapDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const GapDropdown: React.FC<GapDropdownProps> = ({
  value = '12px',
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [customVal, setCustomVal] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  const isPreset = GAP_PRESETS.includes(value);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 240;

    let left = rect.left;
    let top = rect.bottom + 4;

    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 4);
    }

    setMenuCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setCustomVal(value || '12px');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleSelectPreset = (gapVal: string) => {
    onChange(gapVal);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    let raw = customVal.trim();
    if (!raw) return;
    // Automatically append px if user just typed a number like "18"
    if (/^\d+(\.\d+)?$/.test(raw)) {
      raw = `${raw}px`;
    }
    onChange(raw);
    setIsOpen(false);
  };

  const handleStepCustom = (step: number) => {
    // Parse current numeric value
    const match = (customVal || value).match(/^(\d+)/);
    const curr = match ? parseInt(match[1], 10) : 12;
    const next = Math.max(0, curr + step);
    const formatted = `${next}px`;
    setCustomVal(formatted);
    onChange(formatted);
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        data-no-drag="true"
        onClick={handleToggle}
        title={`Flex Gap: ${value || '12px'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10.5px',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isOpen ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
          border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          color: !isPreset ? 'var(--accent-primary)' : 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'all var(--transition-fast)',
        }}
      >
        <SlidersHorizontal size={11} style={{ color: !isPreset ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
        <span>Gap: {value || '12px'}</span>
        <ChevronDown
          size={10}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
            color: 'var(--text-muted)',
          }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            data-no-drag="true"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuCoords.top,
              left: menuCoords.left,
              width: '190px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: '6px',
              zIndex: 99999,
              fontSize: '11px',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              animation: 'fadeIn 120ms ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)',
                padding: '4px 6px',
                marginBottom: '2px',
              }}
            >
              Flex Gap Presets
            </div>

            {/* Presets Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '2px 4px',
              }}
            >
              {GAP_PRESETS.map((gap) => {
                const isSelected = gap === value;
                return (
                  <button
                    key={gap}
                    type="button"
                    onClick={() => handleSelectPreset(gap)}
                    style={{
                      padding: '4px 2px',
                      fontSize: '10.5px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 600 : 500,
                      textAlign: 'center',
                      outline: 'none',
                      transition: 'all 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }}
                  >
                    {gap}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border-subtle)',
                margin: '6px 0',
              }}
            />

            {/* Custom Gap Input */}
            <div style={{ padding: '2px 4px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                }}
              >
                <span>Custom Gap</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    type="button"
                    onClick={() => handleStepCustom(-2)}
                    title="Decrease by 2px"
                    style={{
                      padding: '1px 5px',
                      fontSize: '9px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '2px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    -2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepCustom(2)}
                    title="Increase by 2px"
                    style={{
                      padding: '1px 5px',
                      fontSize: '9px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '2px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    +2
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={customVal}
                  placeholder="e.g. 18px or 1.5rem"
                  onChange={(e) => setCustomVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustom();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '10.5px',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: !isPreset ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  Set
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// ==========================================
// 3. CUSTOM ITEM SIZING DROPDOWN
// ==========================================

export interface SizingPreset {
  value: string;
  label: string;
  shortLabel: string;
  icon?: React.ReactNode;
}

export const SIZING_PRESETS: SizingPreset[] = [
  { value: 'flex-1', label: 'flex-1 (Auto-Fill Space)', shortLabel: 'flex-1 (Auto)', icon: <Maximize2 size={12} /> },
  { value: 'auto', label: 'auto (Fit Content)', shortLabel: 'auto', icon: <Minimize2 size={12} /> },
  { value: 'full', label: '100% Width (Full Row)', shortLabel: '100% Width', icon: <Columns size={12} /> },
  { value: '1/2', label: '50% Width (Half Row)', shortLabel: '50% Width', icon: <Percent size={12} /> },
  { value: '1/3', label: '33.3% Width (One-Third)', shortLabel: '33% Width', icon: <Percent size={12} /> },
  { value: '1/4', label: '25% Width (One-Fourth)', shortLabel: '25% Width', icon: <Percent size={12} /> },
];

export const QUICK_CUSTOM_SIZES = ['120px', '160px', '200px', '250px', '320px', '75%'];

export interface ItemSizingDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ItemSizingDropdown: React.FC<ItemSizingDropdownProps> = ({
  value = 'flex-1',
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [customVal, setCustomVal] = useState('');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  const selectedPreset = SIZING_PRESETS.find((p) => p.value === value);
  const isCustom = !selectedPreset && Boolean(value);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 205;
    const menuHeight = 310;

    let left = rect.left;
    let top = rect.bottom + 4;

    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 4);
    }

    setMenuCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setCustomVal(isCustom ? value : '');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleSelectPreset = (presetVal: string) => {
    onChange(presetVal);
    setIsOpen(false);
  };

  const handleApplyCustom = (valToApply?: string) => {
    let raw = (valToApply !== undefined ? valToApply : customVal).trim();
    if (!raw) return;
    if (/^\d+(\.\d+)?$/.test(raw)) {
      raw = `${raw}px`;
    }
    onChange(raw);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (selectedPreset) return selectedPreset.shortLabel;
    if (value) return value;
    return 'flex-1 (Auto)';
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        data-no-drag="true"
        onClick={handleToggle}
        title={`Item Flex Sizing: ${selectedPreset ? selectedPreset.label : value}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '10px',
          padding: '2px 5px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: isOpen ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
          border: `1px solid ${isOpen ? 'var(--accent-primary)' : isCustom ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
          color: isCustom ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          maxWidth: '120px',
          transition: 'all var(--transition-fast)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayLabel()}</span>
        <ChevronDown
          size={9}
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
            color: 'var(--text-muted)',
          }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            data-no-drag="true"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuCoords.top,
              left: menuCoords.left,
              width: '205px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: '6px',
              zIndex: 99999,
              fontSize: '11px',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              animation: 'fadeIn 120ms ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)',
                padding: '4px 6px',
                marginBottom: '2px',
              }}
            >
              Item Flex Sizing
            </div>

            {/* Presets List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {SIZING_PRESETS.map((p) => {
                const isSelected = p.value === value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSelectPreset(p.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left',
                      transition: 'background-color 100ms ease',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {p.icon}
                      </span>
                      <span>{p.label}</span>
                    </div>
                    {isSelected && <Check size={12} style={{ color: 'var(--accent-primary)' }} />}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border-subtle)',
                margin: '6px 0',
              }}
            />

            {/* Quick Sizing Chips */}
            <div style={{ padding: '2px 4px', marginBottom: '6px' }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                }}
              >
                Quick Fixed Widths
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {QUICK_CUSTOM_SIZES.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleApplyCustom(chip)}
                    style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      backgroundColor: value === chip ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: value === chip ? '#ffffff' : 'var(--text-secondary)',
                      border: value === chip ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Section */}
            <div style={{ padding: '2px 4px' }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                }}
              >
                Custom Width (px, %, fr)
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={customVal}
                  placeholder="e.g. 180px or 75%"
                  onChange={(e) => setCustomVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustom();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '10.5px',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: isCustom ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCustom()}
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  Set
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

