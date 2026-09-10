import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

export const DatePickerLab: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 4);
  });
  const [mode, setMode] = useState<'single' | 'range'>('range');
  const [shape, setShape] = useState<'rounded' | 'circle'>('rounded');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const toMidnight = (d: Date | null) => {
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const isInsideRange = (target: Date) => {
    if (mode !== 'range' || !selectedStart || !selectedEnd) return false;
    const t = toMidnight(target)!;
    const s = toMidnight(selectedStart)!;
    const e = toMidnight(selectedEnd)!;
    const min = Math.min(s, e);
    const max = Math.max(s, e);
    return t > min && t < max;
  };

  const handleDayClick = (dayNum: number) => {
    const clicked = new Date(year, month, dayNum);

    if (mode === 'single') {
      setSelectedStart(clicked);
      setSelectedEnd(null);
      return;
    }

    // Range selection logic
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(clicked);
      setSelectedEnd(null);
    } else {
      if (clicked.getTime() < selectedStart.getTime()) {
        setSelectedEnd(selectedStart);
        setSelectedStart(clicked);
      } else {
        setSelectedEnd(clicked);
      }
    }
  };

  const handleModeChange = (newMode: 'single' | 'range') => {
    setMode(newMode);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (newMode === 'single') {
      setSelectedStart(today);
      setSelectedEnd(null);
      setCurrentMonth(today);
    } else {
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
      setSelectedStart(today);
      setSelectedEnd(end);
      setCurrentMonth(today);
    }
  };

  const setPreset = (preset: 'today' | 'week' | 'month') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (preset === 'today') {
      setSelectedStart(today);
      setSelectedEnd(null);
      setCurrentMonth(today);
    } else if (preset === 'week') {
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
      setSelectedStart(today);
      setSelectedEnd(end);
      setCurrentMonth(today);
    } else if (preset === 'month') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      setSelectedStart(start);
      setSelectedEnd(end);
    }
  };

  const formatDateString = (d: Date | null) => {
    if (!d) return 'None';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 440, margin: '0 auto' }}>
      {/* Mode Selector & Presets */}
      <Card
        variant="glass"
        padding="sm"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          position: 'relative',
          zIndex: 20,
          overflow: 'visible',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => handleModeChange('single')}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: mode === 'single' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'single' ? '#fff' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Single Date
          </button>
          <button
            onClick={() => handleModeChange('range')}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: mode === 'range' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'range' ? '#fff' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Date Range
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Shape:</span>
          <CustomSelect
            value={shape}
            onChange={(val) => setShape(val as 'rounded' | 'circle')}
            options={[
              { value: 'rounded', label: 'Rounded Square' },
              { value: 'circle', label: 'Circular' },
            ]}
            style={{ width: 145 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setPreset('today')}
          >
            Today
          </Button>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setPreset('week')}
          >
            +7 Days
          </Button>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setPreset('month')}
          >
            This Month
          </Button>
        </div>
      </Card>

      {/* Calendar Surface */}
      <Card variant="elevated" padding="md" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Button
            size="xs"
            variant="ghost"
            icon={<ChevronLeft size={16} />}
            onClick={prevMonth}
            aria-label="Previous month"
          />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentMonth.toLocaleString('default', { month: 'long' })} {year}
          </span>
          <Button
            size="xs"
            variant="ghost"
            icon={<ChevronRight size={16} />}
            onClick={nextMonth}
            aria-label="Next month"
          />
        </div>

        {/* Day of Week Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 6 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
          {paddingDays.map((p) => (
            <div key={`pad-${p}`} style={{ height: 36 }} />
          ))}

          {days.map((dayNum) => {
            const thisDate = new Date(year, month, dayNum);
            const isStart = isSameDay(selectedStart, thisDate);
            const isEnd = mode === 'range' && isSameDay(selectedEnd, thisDate);
            const inRange = mode === 'range' && isInsideRange(thisDate) && !isStart && !isEnd;
            const isToday = isSameDay(new Date(), thisDate);

            const hasActiveRange = mode === 'range' && selectedStart && selectedEnd && !isSameDay(selectedStart, selectedEnd);

            return (
              <div
                key={dayNum}
                style={{
                  position: 'relative',
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Connected range connector track */}
                {hasActiveRange && inRange && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      bottom: 2,
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--accent-primary-subtle)',
                      zIndex: 1,
                    }}
                  />
                )}
                {hasActiveRange && isStart && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      bottom: 2,
                      left: '50%',
                      right: 0,
                      backgroundColor: 'var(--accent-primary-subtle)',
                      zIndex: 1,
                    }}
                  />
                )}
                {hasActiveRange && isEnd && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      bottom: 2,
                      left: 0,
                      right: '50%',
                      backgroundColor: 'var(--accent-primary-subtle)',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Day Interactive Cell */}
                <button
                  onClick={() => handleDayClick(dayNum)}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    width: 34,
                    height: 34,
                    borderRadius: isStart || isEnd
                      ? shape === 'circle' ? '50%' : '8px'
                      : shape === 'circle' ? '50%' : '6px',
                    backgroundColor: isStart || isEnd ? 'var(--accent-primary)' : 'transparent',
                    color: isStart || isEnd ? '#ffffff' : inRange ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                    border: isToday && !isStart && !isEnd ? '1px dashed var(--accent-primary)' : 'none',
                    fontWeight: isStart || isEnd || isToday ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {dayNum}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Range Status Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
        <span>
          {mode === 'single' ? (
            <>Selected: <strong>{formatDateString(selectedStart)}</strong></>
          ) : (
            <>
              Range: <strong>{formatDateString(selectedStart)}</strong> → <strong>{formatDateString(selectedEnd)}</strong>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
