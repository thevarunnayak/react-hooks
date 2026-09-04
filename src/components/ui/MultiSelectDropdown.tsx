import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  fontFamily?: string;
}

export interface MultiSelectDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  style?: React.CSSProperties;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = 'All',
  searchPlaceholder = 'Search...',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on inner search
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const clearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
  };

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;
  const isNoneSelected = selectedValues.length === 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: '220px',
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isOpen ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--accent-primary)' : selectedValues.length > 0 ? 'var(--accent-primary)' : 'var(--border-default)',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          boxShadow: isOpen ? '0 0 0 2px var(--accent-primary-subtle)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
          {icon && (
            <span style={{ color: selectedValues.length > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex' }}>
              {icon}
            </span>
          )}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {label}:
          </span>
          <span
            style={{
              fontWeight: 700,
              color: selectedValues.length > 0 ? 'var(--accent-primary)' : 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isNoneSelected
              ? placeholder
              : selectedValues.length === 1
              ? options.find((o) => o.value === selectedValues[0])?.label || selectedValues[0]
              : `${selectedValues.length} selected`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {selectedValues.length > 0 && (
            <span
              onClick={clearAll}
              title="Clear selection"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              }}
            >
              <X size={11} />
            </span>
          )}
          <ChevronDown
            size={14}
            style={{
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: '280px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 120ms ease-out',
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '18px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Action Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '11px',
            }}
          >
            <button
              type="button"
              onClick={selectAll}
              disabled={isAllSelected}
              style={{
                background: 'none',
                border: 'none',
                color: isAllSelected ? 'var(--text-muted)' : 'var(--accent-primary)',
                fontWeight: 600,
                cursor: isAllSelected ? 'default' : 'pointer',
                padding: 0,
              }}
            >
              Select All ({options.length})
            </button>
            <button
              type="button"
              onClick={() => clearAll()}
              disabled={isNoneSelected}
              style={{
                background: 'none',
                border: 'none',
                color: isNoneSelected ? 'var(--text-muted)' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: isNoneSelected ? 'default' : 'pointer',
                padding: 0,
              }}
            >
              Clear All
            </button>
          </div>

          {/* Options List */}
          <div
            style={{
              maxHeight: '250px',
              overflowY: 'auto',
              padding: '4px 0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                No matching options
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {/* Custom Checkbox */}
                      <div
                        style={{
                          width: '15px',
                          height: '15px',
                          borderRadius: '3px',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          flexShrink: 0,
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>

                      {/* Color dot if specified */}
                      {option.color && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: option.color,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      {/* Option Label */}
                      <span
                        style={{
                          fontFamily: option.fontFamily || 'inherit',
                          fontWeight: isSelected ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.label}
                      </span>
                    </div>

                    {/* Count Badge */}
                    {option.count !== undefined && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-subtle)',
                          color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          marginLeft: '8px',
                          flexShrink: 0,
                        }}
                      >
                        {option.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
