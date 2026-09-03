import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: (string | CustomSelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'subtle';
  className?: string;
  style?: React.CSSProperties;
  dropdownStyle?: React.CSSProperties;
  fullWidth?: boolean;
  ariaLabel?: string;
  renderOption?: (option: CustomSelectOption, isSelected: boolean) => React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  style = {},
  dropdownStyle = {},
  fullWidth = false,
  ariaLabel,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined ? value : defaultValue ?? (typeof options[0] === 'string' ? options[0] : options[0]?.value ?? '')
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Normalize options array into structured objects
  const normalizedOptions: CustomSelectOption[] = React.useMemo(() => {
    return options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
  }, [options]);

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = normalizedOptions.find((opt) => opt.value === currentValue);

  // Sync internal state if controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (disabled) return;
      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    },
    [disabled, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = normalizedOptions.findIndex((o) => o.value === currentValue);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
        const opt = normalizedOptions[focusedIndex];
        if (!opt.disabled) {
          handleSelect(opt.value);
        }
      }
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      const item = items[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  // Size styling tokens
  const sizeStyles = {
    sm: {
      padding: '4px 8px',
      fontSize: '11px',
      minHeight: '28px',
      iconSize: 11,
      optionPadding: '4px 8px',
      optionFontSize: '11px',
    },
    md: {
      padding: '6px 10px',
      fontSize: 'var(--text-xs)',
      minHeight: '32px',
      iconSize: 13,
      optionPadding: '6px 10px',
      optionFontSize: 'var(--text-xs)',
    },
    lg: {
      padding: '8px 12px',
      fontSize: 'var(--text-sm)',
      minHeight: '38px',
      iconSize: 14,
      optionPadding: '8px 12px',
      optionFontSize: 'var(--text-sm)',
    },
  }[size];

  // Variant background tokens
  const bgStyles = {
    default: 'var(--bg-surface)',
    elevated: 'var(--bg-surface-elevated)',
    subtle: 'var(--bg-subtle)',
  }[variant];

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        display: fullWidth ? 'flex' : 'inline-flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            const idx = normalizedOptions.findIndex((o) => o.value === currentValue);
            setFocusedIndex(idx >= 0 ? idx : 0);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          minHeight: sizeStyles.minHeight,
          backgroundColor: isOpen ? 'var(--bg-surface-hover)' : bgStyles,
          border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          width: '100%',
          textAlign: 'left',
          transition: 'all var(--transition-fast)',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px var(--accent-primary-subtle)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{selectedOption.icon}</span>}
          <span style={{ fontWeight: selectedOption ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={sizeStyles.iconSize}
          style={{
            flexShrink: 0,
            color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>

      {/* Floating Custom Options Menu */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          aria-labelledby={id}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '340px',
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface-elevated)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '4px',
            zIndex: 1050,
            animation: 'fadeIn 120ms ease-out',
            ...dropdownStyle,
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div style={{ padding: '8px 10px', fontSize: sizeStyles.optionFontSize, color: 'var(--text-muted)' }}>
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = opt.value === currentValue;
              const isFocused = idx === focusedIndex;

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) {
                      handleSelect(opt.value);
                    }
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: sizeStyles.optionPadding,
                    fontSize: sizeStyles.optionFontSize,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected
                      ? 'var(--accent-primary-subtle)'
                      : isFocused
                      ? 'var(--bg-surface-hover)'
                      : 'transparent',
                    color: opt.disabled
                      ? 'var(--text-faint)'
                      : isSelected
                      ? 'var(--accent-primary-text)'
                      : 'var(--text-primary)',
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 100ms ease',
                  }}
                >
                  {renderOption ? (
                    renderOption(opt, isSelected)
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {opt.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.label}
                        </span>
                      </div>
                      {opt.description && (
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {opt.description}
                        </span>
                      )}
                    </div>
                  )}

                  {isSelected && (
                    <Check
                      size={sizeStyles.iconSize}
                      style={{
                        flexShrink: 0,
                        color: 'var(--accent-primary)',
                        marginLeft: 'auto',
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
