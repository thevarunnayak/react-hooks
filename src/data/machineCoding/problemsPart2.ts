import { MachineCodingProblem } from '../../types/machineCoding';

export const PROBLEMS_PART2: MachineCodingProblem[] = [
  // 6. Notification / Toast System
  {
    id: 'toast-notification',
    number: 6,
    title: 'Notification / Toast System',
    difficulty: 'Intermediate',
    category: 'UI Feedback & Overlays',
    tags: ['Context API', 'Portals', 'Queue Management', 'Auto-Dismiss', 'Animations'],
    summary: 'Toast queueing, auto-dismiss countdown progress bar, pause on hover, manual close, and variant styling.',
    explanation:
      'Evaluates global overlay notification architecture, React Context or imperative toast triggers (`toast.success()`), auto-dismiss timer lifecycle, pausing countdowns on hover, and stack management.',
    requirements: {
      functional: [
        'Trigger toasts with title, message, duration (e.g. 4000ms), and variant (success, error, warning, info).',
        'Auto-dismiss with a visual shrinking countdown progress bar.',
        'Hovering over a toast pauses its countdown timer; leaving resumes it.',
        'Manual dismiss button (X) on each toast.',
        'Configurable toast stacking position (top-right, bottom-right, etc.) and maximum visible cap (e.g. 5 toasts).',
      ],
      nonFunctional: [
        'Render outside main DOM hierarchy via React Portal or top-level overlay container.',
        'ARIA live region (`aria-live="polite"` or `role="alert"`) for screen readers.',
      ],
    },
    conceptsUsed: [
      {
        name: 'React Context / Custom Hook',
        description: 'Provides a clean useToast() hook offering toast.success(), toast.error(), toast.dismiss().',
      },
      {
        name: 'Timer Management with Pause/Resume',
        description: 'Tracks remaining duration on mouseEnter and recalculates timeout on mouseLeave.',
      },
      {
        name: 'Queue & Cap Limiting',
        description: 'Slices old toasts when new notifications arrive exceeding the max limit.',
      },
    ],
    edgeCases: [
      'Triggering 20 toasts in 1 second should not overflow the screen; old toasts should evict gracefully.',
      'Unmounting a toast while hover is active should not leave orphaned timers or memory leaks.',
      'Toasts with infinite duration (manual close only) should not display countdown progress bar.',
    ],
    solutionCode: `import React, { useState, useEffect, createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(onClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div style={{ padding: '12px 16px', borderRadius: 8, background: '#1e293b', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <span>{toast.message}</span>
      <button onClick={onClose} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}`,
  },

  // 7. Modal / Dialog
  {
    id: 'modal-dialog',
    number: 7,
    title: 'Accessible Modal / Dialog Component',
    difficulty: 'Intermediate',
    category: 'UI Feedback & Overlays',
    tags: ['createPortal', 'Focus Trap', 'Escape Key', 'Body Scroll Lock', 'A11y'],
    summary: 'Portals, Escape key dismissal, backdrop click, focus trapping, scroll locking, and accessible ARIA dialog roles.',
    explanation:
      'A fundamental UI component testing deep DOM control: rendering at document body via React Portals, locking background page scroll, trapping Tab focus inside modal boundaries, and restoring focus to trigger on close.',
    requirements: {
      functional: [
        'Render modal overlay at document body level using ReactDOM.createPortal.',
        'Close modal on pressing Escape key or clicking backdrop (backdrop close can be disabled).',
        'Trap keyboard Tab focus inside modal (Tab cycles through modal elements; does not escape to background).',
        'Lock background page scrolling (`overflow: hidden` on document/body) while open.',
        'Restore keyboard focus back to the triggering element upon modal dismissal.',
      ],
      nonFunctional: [
        'WAI-ARIA compliance: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`.',
        'Smooth scale-in and fade-in entrance transitions.',
      ],
    },
    conceptsUsed: [
      {
        name: 'ReactDOM.createPortal',
        description: 'Renders DOM nodes outside parent component DOM hierarchy to prevent z-index and overflow: hidden clipping.',
      },
      {
        name: 'Focus Trapping & Focus Restoration',
        description: 'Captures first and last focusable elements (buttons, inputs, links) to loop Tab navigation safely inside dialog.',
      },
      {
        name: 'Body Scroll Lock Cleanup',
        description: 'Applies overflow locks to document body on mount and guarantees cleanup on unmount.',
      },
    ],
    edgeCases: [
      'Modal with 0 focusable form elements should focus modal container itself.',
      'Rapidly opening and closing should never leave background page permanently locked with scrollbars missing.',
      'Nested modals (e.g. confirmation dialog inside edit modal) should preserve stacked z-index order.',
    ],
    solutionCode: `import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ background: '#fff', borderRadius: 8, padding: 24, maxWidth: 500, width: '90%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}`,
  },

  // 8. Data Table / Data Grid
  {
    id: 'data-table',
    number: 8,
    title: 'Data Table / Data Grid Component',
    difficulty: 'Intermediate',
    category: 'Data & Navigation',
    tags: ['Sorting', 'Filtering', 'Pagination', 'Selection', 'Performance'],
    summary: 'Multi-column sort (asc/desc), global & column filters, client-side pagination, selectable rows, and column toggle.',
    explanation:
      'Tests tabular data processing algorithms: deterministic sorting across multiple data types (string, number, date), pagination slice calculations, multi-criteria filtering, and batch row selection (select all / deselect all).',
    requirements: {
      functional: [
        'Sort by any column header with 3-state cycling: Ascending → Descending → None.',
        'Global search bar filtering across all text columns simultaneously.',
        'Per-column filters (e.g. role dropdown, status pill filter).',
        'Client-side pagination with configurable page size (5, 10, 25) and page navigation.',
        'Selectable rows with header "Select All" checkbox supporting indeterminate state.',
      ],
      nonFunctional: [
        'Memoized filtering and sorting pipelines with useMemo.',
        'Responsive horizontal scroll wrapper for mobile screens.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Multi-Criteria Sorting Algorithm',
        description: 'Implements generic comparator handling numbers, case-insensitive strings, and dates.',
      },
      {
        name: 'useMemo Data Pipeline',
        description: 'Chains: Raw Data → Filtered Data → Sorted Data → Paginated Slice efficiently.',
      },
      {
        name: 'Indeterminate Checkbox State',
        description: 'Sets checkbox.indeterminate via ref when some but not all rows are checked.',
      },
    ],
    edgeCases: [
      'Sorting null or undefined values: should be predictably pushed to top or bottom.',
      'Filtering down to 0 matches should display an empty state and reset active page to 1.',
      'Selecting all rows, then filtering: should either select only matching rows or preserve selection correctly.',
    ],
    solutionCode: `import React, { useState, useMemo } from 'react';

export interface TableRow {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
  score: number;
}

export function DataTable({ data }: { data: TableRow[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof TableRow | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleSort = (key: keyof TableRow) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortKey(null);
      setSortOrder(null);
    }
  };

  const processedData = useMemo(() => {
    let result = [...data];
    if (search.trim()) {
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (sortKey && sortOrder) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const pageSlice = processedData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search table..." />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {sortKey === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>Role {sortKey === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>Score {sortKey === 'score' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {pageSlice.map((r) => (
            <tr key={r.id}><td>{r.name}</td><td>{r.role}</td><td>{r.score}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}`,
  },

  // 9. Image Carousel
  {
    id: 'image-carousel',
    number: 9,
    title: 'Interactive Image Carousel',
    difficulty: 'Intermediate',
    category: 'Data & Navigation',
    tags: ['Transitions', 'Auto-Play', 'Touch Gestures', 'Accessibility'],
    summary: 'Next/Previous controls, touch swipe gesture support, bullet pagination indicator, auto-play with pause-on-hover.',
    explanation:
      'Tests carousel state mechanics: index looping, touch swipe delta detection (`touchstart`, `touchend`), auto-play interval with pause on mouse hover or keyboard focus, and fluid CSS transitions.',
    requirements: {
      functional: [
        'Next and Previous navigation buttons with seamless circular looping.',
        'Bottom bullet indicator pills showing active slide and allowing direct navigation.',
        'Auto-play with configurable duration (e.g. 3000ms), paused on hover or focus.',
        'Mobile touch swipe detection (swipe left for next, swipe right for previous).',
        'Keyboard navigation via Left and Right arrow keys.',
      ],
      nonFunctional: [
        'CSS translate transitions for smooth sliding animation.',
        'Accessible slide announcements (`aria-roledescription="carousel"`).',
      ],
    },
    conceptsUsed: [
      {
        name: 'Touch Event Coordinate Deltas',
        description: 'Records touchStart X coordinate and calculates touchEnd delta to distinguish clicks from horizontal swipes.',
      },
      {
        name: 'Auto-Play Interval with Hover Pause',
        description: 'Manages setInterval lifecycle with isPaused flag toggled onMouseEnter and onMouseLeave.',
      },
      {
        name: 'Circular Modulo Indexing',
        description: 'Calculates `(curr + 1) % length` and `(curr - 1 + length) % length` for seamless infinite rotation.',
      },
    ],
    edgeCases: [
      'Carousel with only 1 image: next/prev buttons should be disabled and auto-play paused.',
      'Rapid clicking next button before transition completes should not break slide alignment.',
      'Image loading error: should display clean fallback placeholder.',
    ],
    solutionCode: `import React, { useState, useEffect, useRef } from 'react';

export function ImageCarousel({ images, intervalMs = 3000 }: { images: string[]; intervalMs?: number }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, images.length, intervalMs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 600, margin: '0 auto' }}
    >
      <div style={{ display: 'flex', transform: \`translateX(-\${current * 100}%)\`, transition: 'transform 0.4s ease' }}>
        {images.map((src, idx) => (
          <img key={idx} src={src} alt={\`Slide \${idx + 1}\`} style={{ width: '100%', flexShrink: 0, height: 320, objectFit: 'cover' }} />
        ))}
      </div>
      <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>‹</button>
      <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>›</button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{ width: 8, height: 8, borderRadius: '50%', background: idx === current ? '#3b82f6' : '#ccc', border: 'none' }}
          />
        ))}
      </div>
    </div>
  );
}`,
  },

  // 10. Multi-Step Form
  {
    id: 'multi-step-form',
    number: 10,
    title: 'Multi-Step Form Wizard',
    difficulty: 'Intermediate',
    category: 'State & CRUD',
    tags: ['Form Validation', 'Step Navigation', 'Draft Persistence', 'State Lifting'],
    summary: 'Wizard steps, per-step validation, persistent draft state, jump navigation, and final summary review.',
    explanation:
      'Evaluates complex form state management: breaking forms into discrete steps (Account, Profile, Preferences, Review), maintaining unified form state, validating fields before progressing, and persisting drafts.',
    requirements: {
      functional: [
        'Multi-step stepper (e.g. 1. Account → 2. Personal → 3. Preferences → 4. Review & Submit).',
        'Step-by-step validation: Next button disabled or shows errors until required fields are valid.',
        'Jump to previously completed steps by clicking stepper indicator.',
        'Final step displays a complete review card summarizing all entered data before submission.',
        'Persist draft data in localStorage so accidental refresh does not lose input.',
      ],
      nonFunctional: [
        'Clean step architecture with modular sub-step components.',
        'Accessible step headers with `aria-current="step"`.',
      ],
    },
    conceptsUsed: [
      {
        name: 'Compound Form State Machine',
        description: 'Centralized formData state with step-specific update handlers.',
      },
      {
        name: 'Per-Step Validation Logic',
        description: 'Validates only the active step inputs before incrementing currentStep index.',
      },
      {
        name: 'Review Summary Aggregation',
        description: 'Generates read-only confirmation layout before executing final submit API.',
      },
    ],
    edgeCases: [
      'User modifies step 1 email after completing step 3: dependencies must revalidate appropriately.',
      'Refreshing browser on step 3 should restore both step index and entered data.',
      'Form submission failure should retain all entered data and highlight failing fields.',
    ],
    solutionCode: `import React, { useState } from 'react';

interface FormData {
  fullName: string;
  email: string;
  role: string;
  newsletter: boolean;
}

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    role: 'developer',
    newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
      if (!formData.email.includes('@')) errs.email = 'Valid email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Submitted: ' + JSON.stringify(formData, null, 2));
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 20, border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span>1. Info</span>
        <span>2. Preferences</span>
        <span>3. Review</span>
      </div>

      {step === 1 && (
        <div>
          <input
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          {errors.fullName && <p style={{ color: 'red' }}>{errors.fullName}</p>}
          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>
      )}

      {step === 2 && (
        <div>
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={formData.newsletter}
              onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
            />
            Subscribe to newsletter
          </label>
        </div>
      )}

      {step === 3 && (
        <div>
          <h4>Review Details</h4>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        {step > 1 && <button onClick={handlePrev}>Back</button>}
        {step < 3 ? <button onClick={handleNext}>Next</button> : <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  );
}`,
  },
];
