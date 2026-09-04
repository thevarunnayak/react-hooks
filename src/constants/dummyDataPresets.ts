export interface DummyDataItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  value?: string;
  valueColor?: string;
  category?: string;
}

export interface DummyDataPreset {
  id: string;
  label: string;
  iconName: string;
  defaultTitle: string;
  defaultStyle: 'cards' | 'pills' | 'grid' | 'table';
  description: string;
  items: string[];
  richItems: DummyDataItem[];
}

export const DUMMY_DATA_PRESETS: Record<string, DummyDataPreset> = {
  products: {
    id: 'products',
    label: 'E-Commerce Products',
    iconName: 'ShoppingBag',
    defaultTitle: 'Product Catalog',
    defaultStyle: 'cards',
    description: 'Hardware, electronics, and digital licenses with prices and inventory',
    items: [
      'Pro Developer License ($49)',
      'MacBook Pro 16" M3 Max ($2,499)',
      'Sony WH-1000XM5 Headphones ($349)',
      'Keychron Q1 Pro Mechanical Keyboard ($199)',
      'Dell UltraSharp 32" 4K Monitor ($649)',
      'Herman Miller Aeron Ergonomic Chair ($1,395)',
      'CalDigit TS4 Thunderbolt 4 Dock ($399)',
      'Apple MagSafe Duo Wireless Charger ($129)',
      'Logitech MX Master 3S Mouse ($99)',
      'Elgato Stream Deck MK.2 ($149)',
    ],
    richItems: [
      { id: 'p1', title: 'Pro Developer License', subtitle: 'Annual Team Subscription', badge: 'Software', badgeColor: '#6366f1', value: '$49.00', valueColor: '#10b981' },
      { id: 'p2', title: 'MacBook Pro 16" M3 Max', subtitle: '48GB Unified Memory, 1TB SSD', badge: 'Hardware', badgeColor: '#3b82f6', value: '$2,499.00', valueColor: '#10b981' },
      { id: 'p3', title: 'Sony WH-1000XM5', subtitle: 'Active Noise-Cancelling Headphones', badge: 'Audio', badgeColor: '#8b5cf6', value: '$349.00', valueColor: '#10b981' },
      { id: 'p4', title: 'Keychron Q1 Pro', subtitle: 'Wireless Custom Mechanical Keyboard', badge: 'Peripherals', badgeColor: '#ec4899', value: '$199.00', valueColor: '#10b981' },
      { id: 'p5', title: 'Dell UltraSharp 32" 4K', subtitle: 'IPS Black, USB-C 90W Power Hub', badge: 'Display', badgeColor: '#06b6d4', value: '$649.00', valueColor: '#10b981' },
      { id: 'p6', title: 'Herman Miller Aeron', subtitle: 'PostureFit SL, Fully Adjustable', badge: 'Furniture', badgeColor: '#f59e0b', value: '$1,395.00', valueColor: '#10b981' },
      { id: 'p7', title: 'CalDigit TS4 Dock', subtitle: '18 Ports, 98W Power Delivery', badge: 'Accessories', badgeColor: '#10b981', value: '$399.00', valueColor: '#10b981' },
      { id: 'p8', title: 'Logitech MX Master 3S', subtitle: '8K DPI Any-Surface Quiet Click', badge: 'Peripherals', badgeColor: '#64748b', value: '$99.00', valueColor: '#10b981' },
    ],
  },
  frameworks: {
    id: 'frameworks',
    label: 'Tech Stack & Frameworks',
    iconName: 'Code',
    defaultTitle: 'Developer Frameworks',
    defaultStyle: 'pills',
    description: 'Modern frontend, backend, and cloud technologies',
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'GraphQL',
      'Vite',
      'Zustand',
      'Node.js',
      'PostgreSQL',
      'Docker',
      'Kubernetes',
      'Redis',
      'Rust',
      'Go',
    ],
    richItems: [
      { id: 'f1', title: 'React 19', subtitle: 'Actions & Server Components', badge: 'Frontend', badgeColor: '#06b6d4', value: 'v19.0.0', valueColor: '#06b6d4' },
      { id: 'f2', title: 'Next.js 15', subtitle: 'Turbopack & App Router', badge: 'Fullstack', badgeColor: '#000000', value: 'v15.1.0', valueColor: '#64748b' },
      { id: 'f3', title: 'TypeScript', subtitle: 'Static Type Checking for JS', badge: 'Language', badgeColor: '#3178c6', value: 'v5.6.0', valueColor: '#3178c6' },
      { id: 'f4', title: 'Tailwind CSS', subtitle: 'Zero-runtime utility CSS engine', badge: 'Styling', badgeColor: '#38bdf8', value: 'v4.0.0', valueColor: '#38bdf8' },
      { id: 'f5', title: 'Zustand', subtitle: 'Bear-bones state management', badge: 'State', badgeColor: '#475569', value: 'v5.0.0', valueColor: '#475569' },
      { id: 'f6', title: 'Vite', subtitle: 'Next Generation Frontend Tooling', badge: 'Bundler', badgeColor: '#bd34fe', value: 'v6.0.0', valueColor: '#bd34fe' },
      { id: 'f7', title: 'PostgreSQL', subtitle: 'Advanced Open Source Database', badge: 'Database', badgeColor: '#336791', value: 'v17.0', valueColor: '#336791' },
      { id: 'f8', title: 'GraphQL', subtitle: 'Declarative Data Fetching Query API', badge: 'API', badgeColor: '#e10098', value: 'Spec 2024', valueColor: '#e10098' },
    ],
  },
  team: {
    id: 'team',
    label: 'Team & Directory',
    iconName: 'Users',
    defaultTitle: 'Engineering Team',
    defaultStyle: 'cards',
    description: 'User profiles with roles, statuses, and avatar initials',
    items: [
      'Alex Johnson · Staff Engineering Lead (Active)',
      'Sarah Chen · Principal Product Designer (Active)',
      'Michael Davis · Senior DevOps Architect (Away)',
      'Emily Taylor · Senior Frontend Specialist (Active)',
      'David Kim · Application Security Lead (Offline)',
      'Jessica Martinez · Full-Stack Systems Engineer (Active)',
      'Brian Miller · Senior QA Automation Engineer (Active)',
      'Chloe Bennett · Engineering Manager (Active)',
    ],
    richItems: [
      { id: 'u1', title: 'Alex Johnson', subtitle: 'Engineering Lead · Platform', badge: 'Active', badgeColor: '#10b981', value: 'Austin, TX', valueColor: '#94a3b8' },
      { id: 'u2', title: 'Sarah Chen', subtitle: 'Staff Product Designer · Design Systems', badge: 'Active', badgeColor: '#10b981', value: 'San Francisco, CA', valueColor: '#94a3b8' },
      { id: 'u3', title: 'Michael Davis', subtitle: 'Senior DevOps Architect · Cloud Infra', badge: 'In Meeting', badgeColor: '#f59e0b', value: 'Seattle, WA', valueColor: '#94a3b8' },
      { id: 'u4', title: 'Emily Taylor', subtitle: 'Frontend Specialist · Core UI', badge: 'Active', badgeColor: '#10b981', value: 'New York, NY', valueColor: '#94a3b8' },
      { id: 'u5', title: 'David Kim', subtitle: 'Security Lead · AppSec & Compliance', badge: 'Offline', badgeColor: '#64748b', value: 'Chicago, IL', valueColor: '#94a3b8' },
      { id: 'u6', title: 'Jessica Martinez', subtitle: 'Full-Stack Engineer · APIs & Data', badge: 'Active', badgeColor: '#10b981', value: 'Denver, CO', valueColor: '#94a3b8' },
    ],
  },
  finance: {
    id: 'finance',
    label: 'Stocks & Crypto Telemetry',
    iconName: 'TrendingUp',
    defaultTitle: 'Market Telemetry',
    defaultStyle: 'grid',
    description: 'Financial assets, prices, and 24-hour performance deltas',
    items: [
      'Bitcoin (BTC) — $64,280 (+3.4%)',
      'Ethereum (ETH) — $3,480 (+2.1%)',
      'Solana (SOL) — $148.50 (+5.8%)',
      'Apple (AAPL) — $189.50 (+0.8%)',
      'NVIDIA (NVDA) — $124.80 (+4.2%)',
      'Google (GOOGL) — $176.20 (-0.5%)',
      'Tesla (TSLA) — $214.30 (+1.7%)',
      'Microsoft (MSFT) — $448.90 (+1.2%)',
    ],
    richItems: [
      { id: 'c1', title: 'Bitcoin', subtitle: 'BTC · Crypto', badge: '+3.4%', badgeColor: '#10b981', value: '$64,280.00', valueColor: 'var(--text-primary)' },
      { id: 'c2', title: 'Ethereum', subtitle: 'ETH · Smart Contracts', badge: '+2.1%', badgeColor: '#10b981', value: '$3,480.50', valueColor: 'var(--text-primary)' },
      { id: 'c3', title: 'Solana', subtitle: 'SOL · High Throughput', badge: '+5.8%', badgeColor: '#10b981', value: '$148.50', valueColor: 'var(--text-primary)' },
      { id: 'c4', title: 'NVIDIA Corp', subtitle: 'NVDA · AI Hardware', badge: '+4.2%', badgeColor: '#10b981', value: '$124.80', valueColor: 'var(--text-primary)' },
      { id: 'c5', title: 'Apple Inc', subtitle: 'AAPL · Consumer Tech', badge: '+0.8%', badgeColor: '#10b981', value: '$189.50', valueColor: 'var(--text-primary)' },
      { id: 'c6', title: 'Alphabet Inc', subtitle: 'GOOGL · Cloud & Search', badge: '-0.5%', badgeColor: '#ef4444', value: '$176.20', valueColor: 'var(--text-primary)' },
    ],
  },
  tasks: {
    id: 'tasks',
    label: 'Sprint Backlog & Tasks',
    iconName: 'CheckSquare',
    defaultTitle: 'Sprint Task Backlog',
    defaultStyle: 'cards',
    description: 'Agile tasks, issue trackers, and priority tickets',
    items: [
      'Fix auth state race condition [P0 / Critical]',
      'Optimize bundle split chunking [P1 / High]',
      'Implement dark mode CSS tokens [P2 / Normal]',
      'Audit keyboard navigation focus traps [P1 / High]',
      'Add Web Speech voice input dictation [P2 / Normal]',
      'Upgrade core to React 19 Actions [P1 / High]',
      'Add offline IndexedDB synchronization [P3 / Low]',
      'Virtualize catalog data grid [P2 / Normal]',
    ],
    richItems: [
      { id: 't1', title: 'Fix auth state race condition', subtitle: 'Task #482 · Authentication', badge: 'P0 / Critical', badgeColor: '#ef4444', value: 'In Progress', valueColor: '#f59e0b' },
      { id: 't2', title: 'Optimize bundle split chunking', subtitle: 'Task #485 · Build Pipeline', badge: 'P1 / High', badgeColor: '#f97316', value: 'Todo', valueColor: '#64748b' },
      { id: 't3', title: 'Implement dark mode tokens', subtitle: 'Task #490 · Design System', badge: 'P2 / Normal', badgeColor: '#3b82f6', value: 'Done', valueColor: '#10b981' },
      { id: 't4', title: 'Audit keyboard focus traps', subtitle: 'Task #492 · Accessibility', badge: 'P1 / High', badgeColor: '#f97316', value: 'In Review', valueColor: '#8b5cf6' },
      { id: 't5', title: 'Add Web Speech voice input', subtitle: 'Task #498 · Search Features', badge: 'P2 / Normal', badgeColor: '#3b82f6', value: 'Done', valueColor: '#10b981' },
      { id: 't6', title: 'Upgrade to React 19 Actions', subtitle: 'Task #503 · Core Framework', badge: 'P1 / High', badgeColor: '#f97316', value: 'Todo', valueColor: '#64748b' },
    ],
  },
  countries: {
    id: 'countries',
    label: 'Countries & Timezones',
    iconName: 'Globe',
    defaultTitle: 'Global Regions',
    defaultStyle: 'table',
    description: 'International regions, capital hubs, and UTC offsets',
    items: [
      'United States (New York, UTC-5)',
      'United Kingdom (London, UTC+0)',
      'Germany (Berlin, UTC+1)',
      'Japan (Tokyo, UTC+9)',
      'Australia (Sydney, UTC+11)',
      'India (Bangalore, UTC+5:30)',
      'Singapore (Singapore, UTC+8)',
      'Canada (Toronto, UTC-5)',
      'Brazil (São Paulo, UTC-3)',
      'France (Paris, UTC+1)',
    ],
    richItems: [
      { id: 'g1', title: 'United States', subtitle: 'Capital: Washington, D.C.', badge: 'Americas', badgeColor: '#3b82f6', value: 'UTC-5', valueColor: '#6366f1' },
      { id: 'g2', title: 'United Kingdom', subtitle: 'Capital: London', badge: 'Europe', badgeColor: '#8b5cf6', value: 'UTC+0', valueColor: '#6366f1' },
      { id: 'g3', title: 'Germany', subtitle: 'Capital: Berlin', badge: 'Europe', badgeColor: '#8b5cf6', value: 'UTC+1', valueColor: '#6366f1' },
      { id: 'g4', title: 'Japan', subtitle: 'Capital: Tokyo', badge: 'Asia-Pacific', badgeColor: '#ec4899', value: 'UTC+9', valueColor: '#6366f1' },
      { id: 'g5', title: 'Australia', subtitle: 'Capital: Canberra', badge: 'Oceania', badgeColor: '#f59e0b', value: 'UTC+11', valueColor: '#6366f1' },
      { id: 'g6', title: 'India', subtitle: 'Capital: New Delhi', badge: 'South Asia', badgeColor: '#10b981', value: 'UTC+5:30', valueColor: '#6366f1' },
    ],
  },
  articles: {
    id: 'articles',
    label: 'Knowledge Articles & Posts',
    iconName: 'BookOpen',
    defaultTitle: 'Engineering Blog',
    defaultStyle: 'cards',
    description: 'Technical articles, guides, and architectural case studies',
    items: [
      'Deep Dive into React 19 useActionState & Transitions (12 min)',
      'Avoiding Stale Closures in useEffect & useCallback (8 min)',
      'Mastering Complex State with useReducer & Context (15 min)',
      'Building Production-Grade Accessible Design Systems (10 min)',
      'Zero-Runtime CSS Design Tokens in Modern Web Apps (7 min)',
      'Concurrent Rendering & Fiber Reconciliation Explained (20 min)',
    ],
    richItems: [
      { id: 'a1', title: 'Deep Dive into React 19 Actions', subtitle: 'Seamless optimistic mutations and server transitions', badge: 'React 19', badgeColor: '#06b6d4', value: '12 min read', valueColor: '#94a3b8' },
      { id: 'a2', title: 'Avoiding Stale Closures in useEffect', subtitle: 'Understanding lexical scope and dependency arrays', badge: 'Internals', badgeColor: '#f59e0b', value: '8 min read', valueColor: '#94a3b8' },
      { id: 'a3', title: 'Mastering useReducer & Context', subtitle: 'Predictable centralized domain logic without boilerplate', badge: 'Architecture', badgeColor: '#8b5cf6', value: '15 min read', valueColor: '#94a3b8' },
      { id: 'a4', title: 'Accessible Design Systems', subtitle: 'ARIA semantics, keyboard focus traps, and WCAG AAA', badge: 'Design System', badgeColor: '#10b981', value: '10 min read', valueColor: '#94a3b8' },
      { id: 'a5', title: 'Zero-Runtime CSS Tokens', subtitle: 'Eliminating runtime style recalculations with design tokens', badge: 'Performance', badgeColor: '#ec4899', value: '7 min read', valueColor: '#94a3b8' },
    ],
  },
  colors: {
    id: 'colors',
    label: 'Design Tokens & Colors',
    iconName: 'Palette',
    defaultTitle: 'Color Tokens',
    defaultStyle: 'pills',
    description: 'HSL theme swatches, semantic tokens, and brand palettes',
    items: [
      'Electric Indigo (#6366f1)',
      'Emerald Green (#10b981)',
      'Cyber Cyan (#06b6d4)',
      'Sunset Amber (#f59e0b)',
      'Crimson Rose (#f43f5e)',
      'Deep Violet (#8b5cf6)',
      'Midnight Slate (#0f172a)',
      'Pure Snow (#ffffff)',
    ],
    richItems: [
      { id: 'cl1', title: 'Electric Indigo', subtitle: 'var(--accent-primary)', badge: '#6366f1', badgeColor: '#6366f1', value: 'Brand Primary', valueColor: '#6366f1' },
      { id: 'cl2', title: 'Emerald Green', subtitle: 'var(--accent-success)', badge: '#10b981', badgeColor: '#10b981', value: 'Success State', valueColor: '#10b981' },
      { id: 'cl3', title: 'Cyber Cyan', subtitle: 'var(--accent-cyan)', badge: '#06b6d4', badgeColor: '#06b6d4', value: 'Telemetry', valueColor: '#06b6d4' },
      { id: 'cl4', title: 'Sunset Amber', subtitle: 'var(--accent-warning)', badge: '#f59e0b', badgeColor: '#f59e0b', value: 'Attention', valueColor: '#f59e0b' },
      { id: 'cl5', title: 'Crimson Rose', subtitle: 'var(--accent-danger)', badge: '#f43f5e', badgeColor: '#f43f5e', value: 'Critical Error', valueColor: '#f43f5e' },
      { id: 'cl6', title: 'Deep Violet', subtitle: 'var(--accent-purple)', badge: '#8b5cf6', badgeColor: '#8b5cf6', value: 'Special Hook', valueColor: '#8b5cf6' },
    ],
  },
};

export function getDummyDataPreset(presetId?: string): DummyDataPreset {
  if (presetId && DUMMY_DATA_PRESETS[presetId]) {
    return DUMMY_DATA_PRESETS[presetId];
  }
  return DUMMY_DATA_PRESETS.products;
}
