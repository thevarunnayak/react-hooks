import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { Layers, Plus, X, Laptop, Shield, Zap, Database, Terminal, Settings } from 'lucide-react';

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  closable?: boolean;
  content: {
    title: string;
    description: string;
    metrics: { label: string; value: string }[];
  };
}

const INITIAL_TABS: TabData[] = [
  {
    id: 'overview',
    label: 'Architecture',
    icon: <Layers size={14} />,
    badge: 'Live',
    content: {
      title: 'Distributed Event-Driven Architecture',
      description:
        'Decoupled microfrontends orchestrated via asynchronous publish-subscribe buses with dead-letter queue recovery and automated circuit breaking.',
      metrics: [
        { label: 'P99 Latency', value: '4.2ms' },
        { label: 'Uptime', value: '99.99%' },
        { label: 'RPS Throughput', value: '185k req/s' },
      ],
    },
  },
  {
    id: 'security',
    label: 'Edge Security',
    icon: <Shield size={14} />,
    content: {
      title: 'Zero-Trust Identity & Ephemeral JWTs',
      description:
        'Hardware security key WebAuthn authentication paired with automated cryptographic signature rotation at edge CDN PoPs.',
      metrics: [
        { label: 'Blocked Exploits', value: '2,410' },
        { label: 'Auth Handshake', value: '18ms' },
        { label: 'Cert Expiry', value: '64 days' },
      ],
    },
  },
  {
    id: 'database',
    label: 'Storage & Cache',
    icon: <Database size={14} />,
    content: {
      title: 'Multi-Region In-Memory Tiering',
      description:
        'Predictive L1 in-process caching with L2 distributed Redis clusters and automated write-behind cache invalidation channels.',
      metrics: [
        { label: 'Cache Hit Ratio', value: '94.8%' },
        { label: 'Sync Replication', value: '< 1ms' },
        { label: 'Eviction Rate', value: '0.001%' },
      ],
    },
  },
  {
    id: 'performance',
    label: 'Core Web Vitals',
    icon: <Zap size={14} />,
    badge: '99/100',
    content: {
      title: 'Browser Runtime & Concurrency Engine',
      description:
        'Selective server hydration with off-main-thread Web Worker computation ensuring zero Interaction to Next Paint (INP) input blocking.',
      metrics: [
        { label: 'LCP Hero', value: '0.82s' },
        { label: 'INP Budget', value: '16ms' },
        { label: 'CLS Score', value: '0.000' },
      ],
    },
  },
  {
    id: 'staging',
    label: 'Staging Env (Locked)',
    icon: <Settings size={14} />,
    disabled: true,
    content: {
      title: 'Staging Cluster Sandbox',
      description: 'Currently undergoing scheduled deployment.',
      metrics: [],
    },
  },
];

export const TabsLab: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('overview');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number }>({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });

  // Responsive state
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate sliding pill coordinates
  useEffect(() => {
    const el = tabRefs.current.get(activeTabId);
    if (el) {
      if (orientation === 'horizontal' || isMobile) {
        setIndicatorStyle({
          left: el.offsetLeft,
          width: el.clientWidth,
          top: el.offsetTop,
          height: el.clientHeight,
        });
      } else {
        setIndicatorStyle({
          left: 0,
          width: 3,
          top: el.offsetTop,
          height: el.clientHeight,
        });
      }
    }
  }, [activeTabId, orientation, tabs, isMobile]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleAddTab = () => {
    const newId = `custom-${Date.now()}`;
    const newTab: TabData = {
      id: newId,
      label: `Custom ${tabs.length + 1}`,
      icon: <Terminal size={14} />,
      closable: true,
      content: {
        title: `Dynamic Module #${tabs.length + 1}`,
        description: 'Dynamically injected tab module verifying runtime tab addition and layout recalculation.',
        metrics: [
          { label: 'Memory Allocated', value: '1.2 MB' },
          { label: 'Thread ID', value: 'worker-4' },
          { label: 'Active Tasks', value: '12' },
        ],
      },
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      const nextActive = remaining.find((t) => !t.disabled);
      if (nextActive) setActiveTabId(nextActive.id);
    }
  };

  const handleReset = () => {
    setTabs(INITIAL_TABS);
    setActiveTabId('overview');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 760, margin: '0 auto' }}>
      {/* Controls Bar */}
      <Card
        variant="glass"
        padding="sm"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Orientation:
          </span>
          <CustomSelect
            value={orientation}
            onChange={(val) => setOrientation(val as 'horizontal' | 'vertical')}
            options={[
              { value: 'horizontal', label: 'Horizontal (Top Bar)' },
              { value: 'vertical', label: 'Vertical (Sidebar Tabs)' },
            ]}
            style={{ width: 210 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="xs" variant="secondary" icon={<Plus size={12} />} onClick={handleAddTab}>
            Add Tab
          </Button>
          <Button size="xs" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Main Tabs Surface */}
      <div
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' && !isMobile ? 'row' : 'column',
          gap: 16,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          padding: 16,
          boxSizing: 'border-box',
          minHeight: 320,
        }}
      >
        {/* Tab List Header */}
        <div
          role="tablist"
          aria-orientation={orientation}
          style={{
            display: 'flex',
            flexDirection: orientation === 'vertical' && !isMobile ? 'column' : 'row',
            position: 'relative',
            backgroundColor: orientation === 'horizontal' || isMobile ? 'var(--bg-subtle)' : 'transparent',
            borderRadius: 'var(--radius-lg)',
            padding: orientation === 'horizontal' || isMobile ? 4 : 0,
            gap: 4,
            overflowX: 'auto',
            borderRight: orientation === 'vertical' && !isMobile ? '1px solid var(--border-subtle)' : 'none',
            borderBottom: orientation === 'vertical' && isMobile ? '1px solid var(--border-subtle)' : 'none',
            paddingRight: orientation === 'vertical' && !isMobile ? 12 : 0,
            paddingBottom: orientation === 'vertical' && isMobile ? 8 : 0,
            width: orientation === 'vertical' && !isMobile ? 220 : 'auto',
            flexShrink: 0,
          }}
        >
          {/* Animated Pill / Underline Indicator */}
          <div
            style={{
              position: 'absolute',
              backgroundColor: orientation === 'horizontal' || isMobile ? 'var(--bg-surface)' : 'var(--accent-primary)',
              borderRadius: orientation === 'horizontal' || isMobile ? 'var(--radius-md)' : 2,
              boxShadow: orientation === 'horizontal' || isMobile ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              ...indicatorStyle,
            }}
          />

          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(tab.id, node);
                  else tabRefs.current.delete(tab.id);
                }}
                role="tab"
                aria-selected={isActive}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTabId(tab.id)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'none',
                  border: 'none',
                  color: tab.disabled
                    ? 'var(--text-muted)'
                    : isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  opacity: tab.disabled ? 0.45 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {tab.badge && (
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 4, backgroundColor: 'var(--accent-primary-subtle)', color: 'var(--accent-primary-text)', fontWeight: 700 }}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.closable && (
                    <span
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <X size={11} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Panel Body */}
        {activeTab && (
          <div
            role="tabpanel"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: '6px 8px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                {activeTab.content.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {activeTab.content.description}
              </p>
            </div>

            {activeTab.content.metrics.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 8 }}>
                {activeTab.content.metrics.map((m) => (
                  <div
                    key={m.label}
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: 4 }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
