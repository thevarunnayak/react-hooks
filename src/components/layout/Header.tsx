import React from 'react';
import {
  Menu,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
  Layers,
  BookOpen,
  Boxes,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { useTheme } from '../../hooks/useTheme';
import { ThemeMode } from '../../constants/enums';
import { t } from '../../i18n/i18n';
import { formatKeybinding } from '../../utils/platform';

export interface HeaderProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleMobileMenu: () => void;
  onNavigateHome: () => void;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenSettings,
  onToggleMobileMenu,
  onNavigateHome,
  currentRoute,
  onNavigate,
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === ThemeMode.LIGHT) setTheme(ThemeMode.DARK);
    else if (theme === ThemeMode.DARK) setTheme(ThemeMode.SYSTEM);
    else setTheme(ThemeMode.LIGHT);
  };

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
      }}
      className="app-header"
    >
      {/* Left: Mobile Menu & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleMobileMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
          className="show-mobile-only"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div
          onClick={onNavigateHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-blue)',
            }}
          >
            <Layers size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              React Hooks Lab
            </span>
          </div>
        </div>

        {/* Quick Nav Links on Desktop */}
        {onNavigate && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }} className="hide-mobile">
            <button
              onClick={() => onNavigate('playground')}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentRoute === 'playground' ? 'var(--accent-primary-subtle)' : 'transparent',
                color: currentRoute === 'playground' ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                border: `1px solid ${currentRoute === 'playground' ? 'var(--accent-primary)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Layers size={13} />
              <span>Builder</span>
            </button>

            <button
              onClick={() => onNavigate('examples')}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentRoute === 'examples' ? 'var(--accent-primary-subtle)' : 'transparent',
                color: currentRoute === 'examples' ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                border: `1px solid ${currentRoute === 'examples' ? 'var(--accent-primary)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Boxes size={13} />
              <span>Architectures</span>
              <span
                style={{
                  fontSize: '9.5px',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                }}
              >
                25
              </span>
            </button>
          </nav>
        )}
      </div>

      {/* Center: Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)',
          width: '100%',
          maxWidth: '320px',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-xs)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        className="hide-mobile search-bar-trigger"
      >
        <Search size={14} />
        <span style={{ flex: 1, textAlign: 'left' }}>{t('header.searchPlaceholder')}</span>
        <kbd
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {formatKeybinding(t('header.searchShortcut'))}
        </kbd>
      </button>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
          className="show-mobile-only"
          aria-label={t('header.searchMobileLabel')}
        >
          <Search size={18} />
        </button>

        <Tooltip content={t('header.toggleTheme', { theme })} placement="bottom">
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
            aria-label={t('header.toggleTheme', { theme })}
          >
            {theme === ThemeMode.DARK ? <Moon size={18} /> : theme === ThemeMode.LIGHT ? <Sun size={18} /> : <Monitor size={18} />}
          </button>
        </Tooltip>

        <Tooltip content={t('header.preferences')} placement="bottom">
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
            aria-label={t('header.preferences')}
          >
            <Settings size={18} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
