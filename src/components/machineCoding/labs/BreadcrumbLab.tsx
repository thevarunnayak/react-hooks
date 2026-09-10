import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  Home,
  ChevronRight,
  MoreHorizontal,
  Code2,
  CheckCircle,
  Navigation,
  Layers,
  ShoppingBag,
  Cloud,
  BookOpen,
  Compass,
} from 'lucide-react';

export interface BreadcrumbSegment {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

interface NavNode {
  id: string;
  label: string;
  description?: string;
  children?: NavNode[];
}

interface DomainSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  nodes: NavNode[];
}

const DOMAIN_SECTIONS: DomainSection[] = [
  {
    id: 'cloud',
    label: 'Cloud Console',
    icon: <Cloud size={16} />,
    nodes: [
      {
        id: 'compute',
        label: 'Compute',
        description: 'Virtual machines and containers',
        children: [
          {
            id: 'vms',
            label: 'Virtual Machines',
            children: [
              { id: 'vm-prod-1', label: 'prod-api-worker-01', description: 'c6g.4xlarge • us-east-1a • 99.9% health' },
              { id: 'vm-prod-2', label: 'prod-db-replica-02', description: 'r6g.8xlarge • us-east-1b • Standby' },
              { id: 'vm-stage-1', label: 'staging-test-runner', description: 't4g.xlarge • us-east-1a • Idle' },
            ],
          },
          {
            id: 'k8s',
            label: 'Kubernetes Engine',
            children: [
              { id: 'k8s-prod', label: 'production-us-east-cluster', description: 'v1.31 • 24 Nodes • Healthy' },
              { id: 'k8s-edge', label: 'edge-gateway-eu-central', description: 'v1.31 • 6 Nodes • Healthy' },
            ],
          },
          {
            id: 'serverless',
            label: 'Serverless Functions',
            children: [
              { id: 'fn-auth', label: 'auth-jwt-verifier', description: 'Node.js 22 • 128MB • 14ms avg' },
              { id: 'fn-image', label: 'image-optimizer-pipeline', description: 'Rust / WASM • 512MB • 85ms avg' },
            ],
          },
        ],
      },
      {
        id: 'networking',
        label: 'Networking & VPC',
        description: 'Subnets, routes, and security gates',
        children: [
          {
            id: 'vpcs',
            label: 'Virtual Private Clouds',
            children: [
              { id: 'vpc-main', label: 'vpc-enterprise-prod-01', description: '10.0.0.0/16 • 6 Subnets attached' },
              { id: 'vpc-dev', label: 'vpc-sandbox-dev-02', description: '172.16.0.0/16 • 2 Subnets attached' },
            ],
          },
          {
            id: 'subnets',
            label: 'Private Subnets',
            children: [
              { id: 'sub-prod-a', label: 'subnet-prod-private-1a', description: '10.0.1.0/24 • NAT Gateway routed' },
              { id: 'sub-prod-b', label: 'subnet-prod-private-1b', description: '10.0.2.0/24 • Multi-AZ redundancy' },
            ],
          },
          {
            id: 'dns',
            label: 'DNS & Edge CDN',
            children: [
              { id: 'dns-zone-main', label: 'api.production.global', description: 'Anycast DNS • Route 53 Healthchecked' },
            ],
          },
        ],
      },
      {
        id: 'storage',
        label: 'Storage & DB',
        description: 'Relational data and object storage',
        children: [
          {
            id: 'postgres',
            label: 'Managed PostgreSQL',
            children: [
              { id: 'pg-orders', label: 'orders-cluster-primary', description: 'PostgreSQL 17 • 32 vCPU • 128GB RAM' },
              { id: 'pg-users', label: 'users-auth-db-ha', description: 'PostgreSQL 17 • 16 vCPU • Multi-AZ' },
            ],
          },
          {
            id: 's3',
            label: 'Object Storage Buckets',
            children: [
              { id: 's3-assets', label: 'static-media-assets-prod', description: 'Global Read • SSE-KMS Encrypted' },
              { id: 's3-backups', label: 'disaster-recovery-snapshots', description: 'Cold Archive • 99.999999999% SLA' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce Store',
    icon: <ShoppingBag size={16} />,
    nodes: [
      {
        id: 'electronics',
        label: 'Electronics',
        description: 'Computers, phones, and high-end audio',
        children: [
          {
            id: 'laptops',
            label: 'Laptops & Workstations',
            children: [
              { id: 'mbp16', label: 'MacBook Pro 16" M4 Max', description: '48GB Unified RAM • 1TB SSD • Space Black' },
              { id: 'thinkpad', label: 'ThinkPad X1 Carbon Gen 12', description: 'Intel Core Ultra 7 • 32GB RAM • 2.8K OLED' },
              { id: 'xps15', label: 'Dell XPS 16 Developer Edition', description: 'Core Ultra 9 • RTX 4070 • 4K Touch' },
            ],
          },
          {
            id: 'smartphones',
            label: 'Smartphones & Mobile',
            children: [
              { id: 'iphone16', label: 'iPhone 16 Pro Max 512GB', description: 'Titanium Finish • A18 Pro • 48MP Fusion' },
              { id: 'pixel9', label: 'Google Pixel 9 Pro XL', description: 'Tensor G4 • Gemini Nano Integrated' },
              { id: 's24ultra', label: 'Samsung Galaxy S24 Ultra', description: 'Snapdragon 8 Gen 3 • S-Pen Stylus' },
            ],
          },
          {
            id: 'audio',
            label: 'Pro Audio & Headphones',
            children: [
              { id: 'sony-wh', label: 'Sony WH-1000XM5', description: 'Industry Leading Noise Canceling • LDAC' },
              { id: 'airpods-max', label: 'Apple AirPods Max (USB-C)', description: 'Spatial Audio • Computational Acoustics' },
            ],
          },
        ],
      },
      {
        id: 'fashion',
        label: 'Fashion & Apparel',
        description: 'Designer apparel and premium outerwear',
        children: [
          {
            id: 'mens',
            label: "Men's Collection",
            children: [
              { id: 'mens-coat', label: 'Merino Wool Overcoat', description: '100% Italian Wool • Charcoal Grey' },
              { id: 'mens-boots', label: 'Goodyear Welted Derby Boots', description: 'Full-Grain Calfskin • Vibram Lug Sole' },
            ],
          },
          {
            id: 'womens',
            label: "Women's Collection",
            children: [
              { id: 'womens-trench', label: 'Waterproof Heritage Trench', description: 'Double-breasted • Weatherproof Gabardine' },
              { id: 'womens-cashmere', label: 'Cashmere Ribbed Knit Sweater', description: 'Grade-A Mongolian Cashmere • Oatmeal' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'docs',
    label: 'Developer Documentation',
    icon: <BookOpen size={16} />,
    nodes: [
      {
        id: 'react19',
        label: 'React 19 Architecture',
        description: 'Server actions, compiler, and new hooks',
        children: [
          {
            id: 'hooks',
            label: 'Modern Hook Reference',
            children: [
              { id: 'useactionstate', label: 'useActionState', description: 'Manages pending state & errors during async actions' },
              { id: 'useoptimistic', label: 'useOptimistic', description: 'Provides instantaneous UI feedback before server responses' },
              { id: 'usetransition', label: 'useTransition', description: 'Marks non-urgent UI updates to keep the thread responsive' },
            ],
          },
          {
            id: 'compiler',
            label: 'React Compiler (Forget)',
            children: [
              { id: 'auto-memo', label: 'Automatic Memoization', description: 'Eliminates manual useMemo and useCallback boilerplate' },
              { id: 'rules-of-react', label: 'Static Analysis & Linter', description: 'Ensures pure render functions without side-effects' },
            ],
          },
        ],
      },
      {
        id: 'styling',
        label: 'Design Systems & CSS',
        description: 'Token pipelines, tokens, and modern layouts',
        children: [
          {
            id: 'tokens',
            label: 'Design Tokens',
            children: [
              { id: 'color-palette', label: 'HSL Semantic Colors', description: 'Light & dark balanced luminance contrast ratios' },
              { id: 'typography', label: 'Fluid Type Scales', description: 'CSS clamp() responsive modular typography' },
            ],
          },
          {
            id: 'a11y',
            label: 'Accessibility Guidelines',
            children: [
              { id: 'wai-aria', label: 'WAI-ARIA Breadcrumb Landmark', description: 'aria-current="page", role="navigation", and screen-reader anchors' },
            ],
          },
        ],
      },
    ],
  },
];

export const BreadcrumbLab: React.FC = () => {
  // Navigation hierarchy state
  const [activeDomainId, setActiveDomainId] = useState<string>('cloud');
  const [hoveredLevel1, setHoveredLevel1] = useState<string | null>(null);
  const [hoveredLevel2, setHoveredLevel2] = useState<string | null>(null);

  // Active path segments (defaults to a cloud subnet)
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([
    { id: 'cloud', label: 'Cloud Console', category: 'Domain' },
    { id: 'networking', label: 'Networking & VPC', category: 'Category' },
    { id: 'subnets', label: 'Private Subnets', category: 'Service' },
    { id: 'sub-prod-a', label: 'subnet-prod-private-1a', description: '10.0.1.0/24 • NAT Gateway routed', category: 'Resource' },
  ]);

  const [activeSegmentId, setActiveSegmentId] = useState<string>('sub-prod-a');
  const [maxVisible, setMaxVisible] = useState<number>(4);
  const [separator, setSeparator] = useState<'chevron' | 'slash' | 'arrow' | 'bullet'>('chevron');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Responsive state
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [mobileNavTab, setMobileNavTab] = useState<'categories' | 'sections' | 'endpoints'>('categories');

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dropdownRef = useRef<HTMLLIElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  // Current domain config
  const currentDomain = DOMAIN_SECTIONS.find((d) => d.id === activeDomainId) || DOMAIN_SECTIONS[0];
  const activeLevel1Node = currentDomain.nodes.find((n) => n.id === (hoveredLevel1 || currentDomain.nodes[0]?.id));
  const activeLevel2Node = activeLevel1Node?.children?.find((c) => c.id === (hoveredLevel2 || activeLevel1Node.children?.[0]?.id));

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select a leaf or intermediate path node
  const selectNavPath = (domain: DomainSection, l1: NavNode, l2?: NavNode, l3?: NavNode) => {
    const newPath: BreadcrumbSegment[] = [
      { id: domain.id, label: domain.label, category: 'Domain' },
      { id: l1.id, label: l1.label, description: l1.description, category: 'Category' },
    ];
    if (l2) {
      newPath.push({ id: l2.id, label: l2.label, description: l2.description, category: 'Service' });
    }
    if (l3) {
      newPath.push({ id: l3.id, label: l3.label, description: l3.description, category: 'Resource' });
    }

    setSegments(newPath);
    const leaf = newPath[newPath.length - 1];
    setActiveSegmentId(leaf.id);
    setIsNavOpen(false);
  };

  // Jump to an ancestor segment directly from breadcrumb click
  const navigateToSegment = (seg: BreadcrumbSegment) => {
    const index = segments.findIndex((s) => s.id === seg.id);
    if (index !== -1) {
      const truncated = segments.slice(0, index + 1);
      setSegments(truncated);
      setActiveSegmentId(seg.id);
    }
    setDropdownOpen(false);
  };

  // Render Separator
  const renderSeparatorIcon = () => {
    switch (separator) {
      case 'slash':
        return <span style={{ color: 'var(--text-muted)', userSelect: 'none', padding: '0 2px' }}>/</span>;
      case 'arrow':
        return <span style={{ color: 'var(--text-muted)', userSelect: 'none', padding: '0 2px' }}>→</span>;
      case 'bullet':
        return <span style={{ color: 'var(--text-muted)', userSelect: 'none', padding: '0 2px' }}>•</span>;
      case 'chevron':
      default:
        return <ChevronRight size={14} style={{ color: 'var(--text-muted)', userSelect: 'none' }} />;
    }
  };

  // Partition items into head, collapsed, tail
  const shouldCollapse = segments.length > maxVisible && maxVisible >= 2;
  let headItems: BreadcrumbSegment[] = [];
  let collapsedItems: BreadcrumbSegment[] = [];
  let tailItems: BreadcrumbSegment[] = [];

  if (shouldCollapse) {
    headItems = [segments[0]];
    const tailCount = maxVisible - 1;
    collapsedItems = segments.slice(1, segments.length - tailCount);
    tailItems = segments.slice(segments.length - tailCount);
  } else {
    headItems = segments;
  }

  // Schema.org JSON-LD Generation
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://example.com/${segments.slice(0, index + 1).map((s) => encodeURIComponent(s.label.toLowerCase())).join('/')}`,
    })),
  };

  const activeLeaf = segments[segments.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <Card variant="glass" padding="md" style={{ position: 'relative', zIndex: 60 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Compass size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Hierarchical Breadcrumb Navigator
              </h3>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Interactive multi-tier navigation menu with live cascading hover previews, dynamic breadcrumbs, and WCAG/WAI-ARIA semantics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 140 }}>
              <CustomSelect
                value={String(maxVisible)}
                onChange={(val) => setMaxVisible(parseInt(val, 10))}
                options={[
                  { value: '2', label: 'Max 2 Items' },
                  { value: '3', label: 'Max 3 Items' },
                  { value: '4', label: 'Max 4 Items' },
                  { value: '5', label: 'Max 5 Items' },
                  { value: '99', label: 'No Collapse' },
                ]}
              />
            </div>

            <div style={{ width: 135 }}>
              <CustomSelect
                value={separator}
                onChange={(val) => setSeparator(val as any)}
                options={[
                  { value: 'chevron', label: 'Chevron (›)' },
                  { value: 'slash', label: 'Slash (/)' },
                  { value: 'arrow', label: 'Arrow (→)' },
                  { value: 'bullet', label: 'Bullet (•)' },
                ]}
              />
            </div>

            <Button
              size="sm"
              variant={showJsonLd ? 'primary' : 'ghost'}
              icon={<Code2 size={14} />}
              onClick={() => setShowJsonLd((p) => !p)}
            >
              SEO Schema
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Interactive Navigator Card */}
      <Card variant="glass" padding="lg" style={{ position: 'relative', zIndex: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Interactive Navigation Menu Bar */}
          <div
            ref={navMenuRef}
            style={{
              position: 'relative',
              borderRadius: '10px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Top Domain Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    marginRight: 6,
                  }}
                >
                  Domain Hub:
                </span>
                {DOMAIN_SECTIONS.map((domain) => {
                  const isActive = activeDomainId === domain.id;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => {
                        setActiveDomainId(domain.id);
                        setHoveredLevel1(null);
                        setHoveredLevel2(null);
                        setIsNavOpen(true);
                      }}
                      onMouseEnter={() => {
                        setActiveDomainId(domain.id);
                        setHoveredLevel1(null);
                        setHoveredLevel2(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        border: '1px solid',
                        borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                        backgroundColor: isActive
                          ? 'rgba(59, 130, 246, 0.12)'
                          : 'transparent',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {domain.icon}
                      <span>{domain.label}</span>
                    </button>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant={isNavOpen ? 'secondary' : 'ghost'}
                icon={<Layers size={14} />}
                onClick={() => setIsNavOpen((p) => !p)}
              >
                {isNavOpen ? 'Hide Sub-Options' : 'Explore Sub-Options'}
              </Button>
            </div>

            {/* Hierarchical Cascading Dropdown / Sub-Option Drawer */}
            {isNavOpen && (
              isCompact ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--bg-surface)',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    padding: '12px',
                    gap: 12,
                  }}
                >
                  {/* Compact Tabs Switcher */}
                  <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                    <button
                      onClick={() => setMobileNavTab('categories')}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: mobileNavTab === 'categories' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: mobileNavTab === 'categories' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      1. Categories
                    </button>
                    <button
                      onClick={() => setMobileNavTab('sections')}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: mobileNavTab === 'sections' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: mobileNavTab === 'sections' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      2. Sub-Sections
                    </button>
                    <button
                      onClick={() => setMobileNavTab('endpoints')}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: mobileNavTab === 'endpoints' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: mobileNavTab === 'endpoints' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      3. Endpoints
                    </button>
                  </div>

                  {/* Tab 1: Categories */}
                  {mobileNavTab === 'categories' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
                      {currentDomain.nodes.map((node) => {
                        const isSelected = (hoveredLevel1 || currentDomain.nodes[0]?.id) === node.id;
                        return (
                          <button
                            key={node.id}
                            onClick={() => {
                              setHoveredLevel1(node.id);
                              setHoveredLevel2(null);
                              setMobileNavTab('sections');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                              color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '13px',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{node.label}</span>
                              {node.description && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{node.description}</span>
                              )}
                            </div>
                            <ChevronRight size={15} style={{ opacity: 0.7 }} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 2: Sub-Sections */}
                  {mobileNavTab === 'sections' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 2 }}>
                        Category: <strong style={{ color: 'var(--text-primary)' }}>{activeLevel1Node?.label}</strong>
                      </div>
                      {activeLevel1Node?.children?.map((subNode) => {
                        const isSelected = (hoveredLevel2 || activeLevel1Node.children?.[0]?.id) === subNode.id;
                        return (
                          <button
                            key={subNode.id}
                            onClick={() => {
                              setHoveredLevel2(subNode.id);
                              setMobileNavTab('endpoints');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                              color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '13px',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{subNode.label}</span>
                            <ChevronRight size={15} style={{ opacity: 0.7 }} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 3: Endpoints */}
                  {mobileNavTab === 'endpoints' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 2 }}>
                        Sub-Section: <strong style={{ color: 'var(--text-primary)' }}>{activeLevel2Node?.label}</strong>
                      </div>
                      {activeLevel2Node?.children?.map((leaf) => {
                        const isSelected = activeSegmentId === leaf.id;
                        return (
                          <div
                            key={leaf.id}
                            onClick={() => {
                              if (activeLevel1Node && activeLevel2Node) {
                                selectNavPath(currentDomain, activeLevel1Node, activeLevel2Node, leaf);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                              backgroundColor: isSelected
                                ? 'rgba(59, 130, 246, 0.12)'
                                : 'var(--bg-surface-elevated)',
                              cursor: 'pointer',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                marginBottom: 2,
                              }}
                            >
                              {leaf.label}
                            </div>
                            {leaf.description && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {leaf.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 240px 1fr',
                    minHeight: 280,
                    backgroundColor: 'var(--bg-surface)',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Column 1: Categories (Level 1) */}
                  <div
                    style={{
                      borderRight: '1px solid var(--border-subtle)',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Categories
                    </div>
                    {currentDomain.nodes.map((node) => {
                      const isHovered = (hoveredLevel1 || currentDomain.nodes[0]?.id) === node.id;
                      return (
                        <button
                          key={node.id}
                          onMouseEnter={() => {
                            setHoveredLevel1(node.id);
                            setHoveredLevel2(null);
                          }}
                          onClick={() => selectNavPath(currentDomain, node)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            color: isHovered ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: isHovered ? 600 : 400,
                            fontSize: '13px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{node.label}</span>
                            {node.description && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {node.description}
                              </span>
                            )}
                          </div>
                          <ChevronRight size={14} style={{ opacity: isHovered ? 1 : 0.4 }} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Column 2: Sub-Categories / Services (Level 2) */}
                  <div
                    style={{
                      borderRight: '1px solid var(--border-subtle)',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Sub-Sections
                    </div>
                    {activeLevel1Node?.children?.map((subNode) => {
                      const isHovered = (hoveredLevel2 || activeLevel1Node.children?.[0]?.id) === subNode.id;
                      return (
                        <button
                          key={subNode.id}
                          onMouseEnter={() => setHoveredLevel2(subNode.id)}
                          onClick={() => selectNavPath(currentDomain, activeLevel1Node, subNode)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            color: isHovered ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontWeight: isHovered ? 600 : 400,
                            fontSize: '13px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <span>{subNode.label}</span>
                          <ChevronRight size={14} style={{ opacity: isHovered ? 1 : 0.4 }} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Column 3: Leaf Items / Resources (Level 3) */}
                  <div
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      overflowY: 'auto',
                      maxHeight: 320,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.05em',
                        marginBottom: 2,
                      }}
                    >
                      Target Endpoints / Products
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                      {activeLevel2Node?.children?.map((leaf) => {
                        const isSelected = activeSegmentId === leaf.id;
                        return (
                          <div
                            key={leaf.id}
                            onClick={() => {
                              if (activeLevel1Node && activeLevel2Node) {
                                selectNavPath(currentDomain, activeLevel1Node, activeLevel2Node, leaf);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                              backgroundColor: isSelected
                                ? 'rgba(59, 130, 246, 0.12)'
                                : 'var(--bg-surface-elevated)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                                marginBottom: 2,
                              }}
                            >
                              {leaf.label}
                            </div>
                            {leaf.description && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {leaf.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Breadcrumb Navigation Bar */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>ACTIVE BREADCRUMB TRAIL</span>
              <span style={{ fontSize: '11px' }}>Click any segment to jump back</span>
            </div>

            <nav
              aria-label="Breadcrumb"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <ol
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {/* Head Items */}
                {headItems.map((item, idx) => {
                  const isLast = !shouldCollapse && idx === headItems.length - 1;
                  const isActive = activeSegmentId === item.id;

                  return (
                    <li
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '14px',
                      }}
                    >
                      <button
                        onClick={() => navigateToSegment(item)}
                        aria-current={isLast ? 'page' : undefined}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isLast
                            ? 'var(--accent-primary)'
                            : isActive
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                          fontWeight: isLast ? 600 : 400,
                          cursor: isLast ? 'default' : 'pointer',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'color 0.15s ease',
                        }}
                      >
                        {idx === 0 && <Home size={14} style={{ color: 'var(--accent-primary)' }} />}
                        <span>{item.label}</span>
                      </button>
                      {(!isLast || shouldCollapse) && renderSeparatorIcon()}
                    </li>
                  );
                })}

                {/* Collapsed Ellipsis Dropdown */}
                {shouldCollapse && (
                  <li
                    ref={dropdownRef}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => setDropdownOpen((p) => !p)}
                      aria-label={`${collapsedItems.length} hidden path items`}
                      style={{
                        backgroundColor: dropdownOpen
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '12px',
                      }}
                    >
                      <MoreHorizontal size={14} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        +{collapsedItems.length}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 6,
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 70,
                          minWidth: 200,
                          overflow: 'hidden',
                          padding: 4,
                        }}
                      >
                        <div
                          style={{
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            borderBottom: '1px solid var(--border-subtle)',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}
                        >
                          Intermediary Breadcrumbs
                        </div>
                        {collapsedItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => navigateToSegment(item)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              color:
                                activeSegmentId === item.id
                                  ? 'var(--accent-primary)'
                                  : 'var(--text-primary)',
                              fontSize: '13px',
                              textAlign: 'left',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronRight size={12} style={{ opacity: 0.5 }} />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {renderSeparatorIcon()}
                  </li>
                )}

                {/* Tail Items */}
                {shouldCollapse &&
                  tailItems.map((item, idx) => {
                    const isLast = idx === tailItems.length - 1;
                    const isActive = activeSegmentId === item.id;

                    return (
                      <li
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '14px',
                        }}
                      >
                        <button
                          onClick={() => navigateToSegment(item)}
                          aria-current={isLast ? 'page' : undefined}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isLast
                              ? 'var(--accent-primary)'
                              : isActive
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                            fontWeight: isLast ? 600 : 400,
                            cursor: isLast ? 'default' : 'pointer',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'color 0.15s ease',
                          }}
                        >
                          <span>{item.label}</span>
                        </button>
                        {!isLast && renderSeparatorIcon()}
                      </li>
                    );
                  })}
              </ol>
            </nav>
          </div>

          {/* Active Target Content / Simulation Preview */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Navigation size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Active Route Resource
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {activeLeaf?.label || 'Overview'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant="cyan">{segments.length} Path Depth</Badge>
                {activeLeaf?.category && <Badge variant="default">{activeLeaf.category}</Badge>}
              </div>
            </div>

            {activeLeaf?.description && (
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {activeLeaf.description}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quick Preset Scenarios:</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSegments([
                    { id: 'cloud', label: 'Cloud Console' },
                    { id: 'compute', label: 'Compute' },
                    { id: 'vms', label: 'Virtual Machines' },
                    { id: 'vm-prod-1', label: 'prod-api-worker-01', description: 'c6g.4xlarge • us-east-1a • 99.9% health' },
                  ])
                }
              >
                Cloud VM
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSegments([
                    { id: 'ecommerce', label: 'E-Commerce' },
                    { id: 'electronics', label: 'Electronics' },
                    { id: 'laptops', label: 'Laptops' },
                    { id: 'mbp16', label: 'MacBook Pro 16" M4 Max', description: '48GB Unified RAM • 1TB SSD • Space Black' },
                  ])
                }
              >
                E-Commerce Laptop
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSegments([
                    { id: 'docs', label: 'Documentation' },
                    { id: 'react19', label: 'React 19' },
                    { id: 'hooks', label: 'Modern Hooks' },
                    { id: 'useactionstate', label: 'useActionState', description: 'Manages pending state & errors during async actions' },
                  ])
                }
              >
                React 19 Hook
              </Button>
            </div>
          </div>

          {/* JSON-LD Schema Drawer */}
          {showJsonLd && (
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-code)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Schema.org BreadcrumbList JSON-LD
                </span>
                <Badge variant="success">SEO READY</Badge>
              </div>
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(jsonLdData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                WAI-ARIA Breadcrumb Landmark
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Renders inside &lt;nav aria-label="Breadcrumb"&gt; with &lt;ol&gt; list items and aria-current="page" on the terminal active route.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Ellipsis Window Partitioning
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Clean head and tail partitioning preserves immediate root context and active leaf page while stashing overflowing intermediate items in a portal dropdown.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Interactive Cascading Sync
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Hovering and navigating multi-tier categories updates the breadcrumb in real time, with clickable ancestors to jump back effortlessly.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
