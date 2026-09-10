import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Drawer } from '../ui/Drawer';
import { CommandPalette } from '../ui/CommandPalette';
import { SettingsModal } from './SettingsModal';
import { ScrollToTopNotch } from '../ui/ScrollToTopNotch';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reactlabz_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('reactlabz_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Global ⌘K keyboard shortcut for search
  useKeyboardShortcut('k', () => setSearchOpen(true), { meta: true });

  // Global ⌘B keyboard shortcut for toggling sidebar
  useKeyboardShortcut('b', handleToggleSidebar, { meta: true });

  const handleNavigate = (route: string, param?: string) => {
    onNavigate(route, param);
    setMobileNavOpen(false);
    // When navigating back to the machine-coding list from a lab, allow MachineCodingPage to scroll directly to the card
    if (route !== 'machine-coding' || param) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        {/* Desktop Sidebar (Sticky to Viewport with Smooth Collapse) */}
        <div
          className="hide-mobile"
          style={{
            position: 'sticky',
            top: '56px',
            height: 'calc(100vh - 56px)',
            alignSelf: 'flex-start',
            flexShrink: 0,
            zIndex: 'var(--z-sticky)',
            width: sidebarCollapsed ? '56px' : '260px',
            transition: 'width 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Sidebar
            currentRoute={currentRoute}
            currentHookId={currentHookId}
            onNavigate={handleNavigate}
            bookmarks={bookmarks}
            completedLessons={completedLessons}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        <Drawer
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          title="ReactLabz Navigation"
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

      {/* Global Floating Scroll-To-Top Notch */}
      <ScrollToTopNotch />
    </div>
  );
};
