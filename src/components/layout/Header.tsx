import React from 'react';
import {
  Menu,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
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
      {/* Left: Mobile Menu & Brand Logo */}
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
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <BrandLogo size={28} glow={true} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: '17px',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, var(--text-primary) 30%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ReactLabz
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                letterSpacing: '0.04em',
              }}
            >
              STUDIO
            </span>
          </div>
        </div>
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
        <Search size={14} style={{ flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t('header.searchPlaceholder')}
        </span>
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
