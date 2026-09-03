import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Drawer } from '../ui/Drawer';
import { CommandPalette } from '../ui/CommandPalette';
import { SettingsModal } from './SettingsModal';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export interface AppShellProps {
  currentRoute: string;
  currentHookId?: string;
  onNavigate: (route: string, param?: string) => void;
  bookmarks?: string[];
  completedLessons?: string[];
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  currentHookId,
  onNavigate,
  bookmarks = [],
  completedLessons = [],
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Global ⌘K keyboard shortcut
  useKeyboardShortcut('k', () => setSearchOpen(true), { meta: true });

  const handleNavigate = (route: string, param?: string) => {
    onNavigate(route, param);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
      className="app-shell"
    >
      {/* Sticky Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleMobileMenu={() => setMobileNavOpen(!mobileNavOpen)}
        onNavigateHome={() => handleNavigate('home')}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)' }}>
        {/* Desktop Sidebar (Sticky to Viewport) */}
        <div
          className="hide-mobile"
          style={{
            position: 'sticky',
            top: '56px',
            height: 'calc(100vh - 56px)',
            alignSelf: 'flex-start',
            flexShrink: 0,
            zIndex: 'var(--z-sticky)',
          }}
        >
          <Sidebar
            currentRoute={currentRoute}
            currentHookId={currentHookId}
            onNavigate={handleNavigate}
            bookmarks={bookmarks}
            completedLessons={completedLessons}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          title="React Hooks Lab Navigation"
          side="left"
          width="280px"
        >
          <Sidebar
            currentRoute={currentRoute}
            currentHookId={currentHookId}
            onNavigate={handleNavigate}
            bookmarks={bookmarks}
            completedLessons={completedLessons}
          />
        </Drawer>

        {/* Content Viewport */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            backgroundColor: 'var(--bg-app)',
          }}
          className="app-main-content"
        >
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Settings & Local Data Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
