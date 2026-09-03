import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  Smartphone,
  Monitor,
  MousePointerClick,
  Database,
  Search,
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { usePrevious } from '../../../hooks/usePrevious';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useClickOutside } from '../../../hooks/useClickOutside';

export interface CustomHookInteractiveLabProps {
  hookId: string;
}

export const CustomHookInteractiveLab: React.FC<CustomHookInteractiveLabProps> = ({ hookId }) => {
  switch (hookId) {
    case 'useDebounce':
      return <DebounceDemo />;
    case 'useLocalStorage':
      return <LocalStorageDemo />;
    case 'usePrevious':
      return <PreviousDemo />;
    case 'useToggle':
      return <ToggleDemo />;
    case 'useInterval':
      return <IntervalDemo />;
    case 'useMediaQuery':
      return <MediaQueryDemo />;
    case 'useClickOutside':
      return <ClickOutsideDemo />;
    case 'useClipboard':
      return <ClipboardDemo />;
    default:
      return <GenericCustomHookDemo hookId={hookId} />;
  }
};

// 1. useDebounce Demo
function DebounceDemo() {
  const [text, setText] = useState('');
  const [delay, setDelay] = useState(500);
  const debouncedText = useDebounce(text, delay);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<any>(null);

  const handleChange = (val: string) => {
    setText(val);
    setIsTyping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsTyping(false), delay);
  };

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
          Live Interactive Experiment: useDebounce
        </span>
        <Badge variant={isTyping ? 'warning' : 'success'} size="sm">
          {isTyping ? 'Debounce Timer Running...' : 'Settled & Debounced'}
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          TYPE RAPIDLY IN THIS INPUT:
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type quickly here to observe the debounced lag..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Debounce Delay:</span>
        {[200, 500, 1000].map((d) => (
          <Button
            key={d}
            size="xs"
            variant={delay === d ? 'primary' : 'outline'}
            onClick={() => setDelay(d)}
          >
            {d}ms
          </Button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Immediate State (Every Keystroke)
          </div>
          <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning-text)', marginTop: '4px', minHeight: '20px' }}>
            "{text || '...'}"
          </div>
        </div>

        <div style={{ padding: '10px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Debounced Value (After {delay}ms pause)
          </div>
          <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--accent-success-text)', marginTop: '4px', minHeight: '20px' }}>
            "{debouncedText || '...'}"
          </div>
        </div>
      </div>
    </Card>
  );
}

// 2. useLocalStorage Demo
function LocalStorageDemo() {
  const [storedValue, setStoredValue] = useLocalStorage<string>('demo_user_name', 'Alex Mercer');
  const [editVal, setEditVal] = useState(storedValue);
  const [syncedEvent, setSyncedEvent] = useState(false);

  const handleSave = () => {
    setStoredValue(editVal);
    setSyncedEvent(true);
    setTimeout(() => setSyncedEvent(false), 1500);
  };

  const handleClear = () => {
    localStorage.removeItem('demo_user_name');
    setStoredValue('');
    setEditVal('');
  };

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
            Live Interactive Experiment: useLocalStorage
          </span>
        </div>
        <Badge variant={syncedEvent ? 'success' : 'default'} size="sm">
          {syncedEvent ? 'Persisted to LocalStorage' : 'localStorage Key: demo_user_name'}
        </Badge>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          placeholder="Enter name to persist..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
          }}
        />
        <Button size="sm" variant="primary" onClick={handleSave}>
          Update Storage
        </Button>
        <Button size="sm" variant="danger" onClick={handleClear}>
          Clear
        </Button>
      </div>

      <div style={{ padding: '10px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: 'var(--text-muted)' }}>// Real localStorage inspect:</div>
        <div>localStorage.getItem('demo_user_name') =&gt; <strong style={{ color: 'var(--accent-success)' }}>"{storedValue}"</strong></div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '10px' }}>
          Tip: Refresh the browser page or open in a second tab. This state persists automatically!
        </div>
      </div>
    </Card>
  );
}

// 3. usePrevious Demo
function PreviousDemo() {
  const [count, setCount] = useState(1);
  const prevCount = usePrevious(count);

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
        Live Interactive Experiment: usePrevious
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button size="sm" variant="secondary" onClick={() => setCount((c) => c - 1)}>
          Decrement (-1)
        </Button>
        <Button size="sm" variant="primary" onClick={() => setCount((c) => c + 1)}>
          Increment (+1)
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCount((c) => c * 2)}>
          Double (*2)
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Value</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-text)' }}>
            {count}
          </div>
        </div>

        <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Previous Render Value</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple-text)' }}>
            {prevCount !== undefined ? prevCount : 'undefined (mount)'}
          </div>
        </div>
      </div>
    </Card>
  );
}

// 4. useToggle Demo
function ToggleDemo() {
  const [isOn, setIsOn] = useState(false);
  const toggle = () => setIsOn((v) => !v);

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
          Live Interactive Experiment: useToggle
        </span>
        <Badge variant={isOn ? 'success' : 'default'} size="sm">
          State: {isOn ? 'TRUE (Active)' : 'FALSE (Inactive)'}
        </Badge>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button size="sm" variant="primary" onClick={toggle}>
          Toggle State
        </Button>
        <Button size="sm" variant="outline" onClick={() => setIsOn(true)}>
          Set True
        </Button>
        <Button size="sm" variant="outline" onClick={() => setIsOn(false)}>
          Set False
        </Button>
      </div>

      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isOn ? 'var(--accent-success-subtle)' : 'var(--bg-code)',
          border: isOn ? '1px solid var(--accent-success)' : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all var(--transition-fast)',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isOn ? 'var(--accent-success)' : 'var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {isOn && <Check size={14} />}
        </div>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {isOn ? 'The switch is currently ON' : 'The switch is currently OFF'}
        </span>
      </div>
    </Card>
  );
}

// 5. useInterval Demo
function IntervalDemo() {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState<number | null>(1000);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || delay === null) return;
    const id = setInterval(() => setCount((c) => c + 1), delay);
    return () => clearInterval(id);
  }, [isRunning, delay]);

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
          Live Interactive Experiment: useInterval
        </span>
        <Badge variant={isRunning ? 'success' : 'warning'} size="sm">
          {isRunning ? `Ticking every ${delay}ms` : 'Paused'}
        </Badge>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          size="sm"
          variant={isRunning ? 'outline' : 'primary'}
          icon={isRunning ? <Pause size={14} /> : <Play size={14} />}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause Interval' : 'Resume Interval'}
        </Button>
        <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={() => setCount(0)}>
          Reset Count
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Interval Speed:</span>
        {[200, 500, 1000, 2000].map((d) => (
          <Button
            key={d}
            size="xs"
            variant={delay === d ? 'primary' : 'outline'}
            onClick={() => setDelay(d)}
          >
            {d}ms
          </Button>
        ))}
      </div>

      <div style={{ padding: '16px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tick Counter</div>
        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-text)' }}>
          {count}
        </div>
      </div>
    </Card>
  );
}

// 6. useMediaQuery Demo
function MediaQueryDemo() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isDarkPreferred = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
        Live Interactive Experiment: useMediaQuery
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDesktop ? <Monitor size={20} style={{ color: 'var(--accent-primary)' }} /> : <Smartphone size={20} style={{ color: 'var(--accent-purple)' }} />}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Query: (min-width: 768px)</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isDesktop ? 'Desktop Viewport' : 'Mobile Viewport'}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} style={{ color: 'var(--accent-warning)' }} />
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>prefers-color-scheme: dark</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isDarkPreferred ? 'Dark Preference' : 'Light Preference'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        Try resizing your browser window or switching screen sizes to see these media queries update in real time.
      </div>
    </Card>
  );
}

// 7. useClickOutside Demo
function ClickOutsideDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useClickOutside(boxRef, () => {
    if (isOpen) {
      setIsOpen(false);
      setClickCount((c) => c + 1);
    }
  });

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
          Live Interactive Experiment: useClickOutside
        </span>
        <Badge variant="cyan" size="sm">
          Dismissed Count: {clickCount}
        </Badge>
      </div>

      <div>
        <Button size="sm" variant="primary" onClick={() => setIsOpen(true)}>
          Open Modal / Popover Box
        </Button>
      </div>

      {isOpen ? (
        <div
          ref={boxRef}
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MousePointerClick size={16} style={{ color: 'var(--accent-primary)' }} />
            <strong style={{ color: 'var(--text-primary)' }}>Click Inside Or Outside Me!</strong>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Clicks inside this box will NOT close it. Clicks anywhere outside this box will trigger the handler and dismiss it.
          </p>
        </div>
      ) : (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Box is currently closed. Click "Open Modal" above, then click anywhere outside the box to test dismissal.
        </div>
      )}
    </Card>
  );
}

// 8. useClipboard Demo
function ClipboardDemo() {
  const [copyText, setCopyText] = useState('React Hooks Lab rocks!');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
        Live Interactive Experiment: useClipboard
      </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={copyText}
          onChange={(e) => setCopyText(e.target.value)}
          placeholder="Text to copy..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
          }}
        />
        <Button
          size="sm"
          variant="primary"
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={handleCopy}
        >
          {copied ? 'Copied to Clipboard!' : 'Copy Text'}
        </Button>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        Status: {copied ? <strong style={{ color: 'var(--accent-success)' }}>Copied! (Resets in 2 seconds)</strong> : 'Waiting for copy trigger.'}
      </div>
    </Card>
  );
}

// Generic Fallback Demo for other custom hooks
function GenericCustomHookDemo({ hookId }: { hookId: string }) {
  const [executed, setExecuted] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary-text)' }}>
          Live Interactive Sandbox: {hookId}
        </span>
        <Badge variant={executed ? 'success' : 'default'} size="sm">
          {executed ? 'Simulated Execution Active' : 'Ready'}
        </Badge>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          size="sm"
          variant="primary"
          icon={<Zap size={14} />}
          onClick={() => {
            setExecuted(true);
            setCount((c) => c + 1);
          }}
        >
          Simulate Hook Call #{count + 1}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>

      <div style={{ padding: '12px', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: 'var(--text-muted)' }}>// Simulated runtime state:</div>
        <div>executions: {count}</div>
        <div>status: {executed ? '"mounted & subscribed"' : '"idle"'}</div>
      </div>
    </Card>
  );
}
