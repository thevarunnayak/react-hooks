import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { ChevronLeft, ChevronRight, Play, Pause, Smartphone, LayoutGrid, Eye, Square } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

export type CarouselMode = 'single' | 'peek' | 'multi';

const CAROUSEL_SLIDES = [
  {
    title: 'Distributed System Architecture',
    subtitle: 'Event-driven streaming with sub-millisecond guarantees and partition tolerance',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    tag: 'Cloud & Infra',
  },
  {
    title: 'React 19 Concurrent Reconciliation',
    subtitle: 'Selective hydration, action states, and optimistic UI transitions',
    gradient: 'linear-gradient(135deg, #581c87 0%, #a855f7 100%)',
    tag: 'Frontend Engine',
  },
  {
    title: 'WebAssembly SIMD Matrix Computing',
    subtitle: 'Near-native client-side tensor processing without server roundtrips',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    tag: 'WASM & Performance',
  },
  {
    title: 'Zero-Trust Edge Security & Auth',
    subtitle: 'Cryptographically signed JWT rotation and ephemeral session cookies',
    gradient: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
    tag: 'Security & Auth',
  },
  {
    title: 'Real-Time Canvas Graphics DSP',
    subtitle: 'Hardware-accelerated audio waveform analyzers and custom WebGL shaders',
    gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    tag: 'Creative Tech',
  },
  {
    title: 'High-Throughput Microfrontends',
    subtitle: 'Isolated module federation with runtime dependency de-duplication',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    tag: 'Architecture',
  },
];

const MODE_OPTIONS = [
  { value: 'single', label: 'Single Slide (Full)' },
  { value: 'peek', label: 'Center Stage Peek (Sides Preview)' },
  { value: 'multi', label: 'Multi-Card (3 Slides Visible)' },
];

export const ImageCarouselLab: React.FC = () => {
  const [mode, setMode] = useState<CarouselMode>('peek');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTiny = useMediaQuery('(max-width: 420px)');
  const touchStartX = useRef(0);

  const total = CAROUSEL_SLIDES.length;
  const cardsPerView = mode === 'multi' ? (isTiny ? 1 : isMobile ? 2 : 3) : 1;
  const maxIndex = mode === 'multi' ? Math.max(0, total - cardsPerView) : total - 1;

  const nextSlide = () => {
    setActiveSlide((prev) => {
      if (mode === 'multi') {
        return prev >= maxIndex ? 0 : prev + 1;
      }
      return (prev + 1) % total;
    });
  };

  const prevSlide = () => {
    setActiveSlide((prev) => {
      if (mode === 'multi') {
        return prev <= 0 ? maxIndex : prev - 1;
      }
      return (prev - 1 + total) % total;
    });
  };

  // Auto-play interval with hover-pause
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const timer = setInterval(nextSlide, 3500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, mode, total, maxIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) {
      prevSlide();
    } else if (delta < -40) {
      nextSlide();
    }
  };

  // Reset or adjust index when changing mode
  const handleModeChange = (val: string) => {
    const newMode = val as CarouselMode;
    setMode(newMode);
    if (newMode === 'multi' && activeSlide > maxIndex) {
      setActiveSlide(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 840, margin: '0 auto' }}>
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
          zIndex: 50,
          overflow: 'visible',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 51 }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Layout Mode:
          </span>
          <CustomSelect
            value={mode}
            onChange={handleModeChange}
            options={MODE_OPTIONS}
            style={{ width: isMobile ? '100%' : 220 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="xs"
            variant="secondary"
            icon={isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
          </Button>
          {isHovered && isAutoPlaying && (
            <Badge variant="warning" size="sm">Hover Paused</Badge>
          )}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 4 }}>
            Slide <strong>{activeSlide + 1}</strong> of {mode === 'multi' ? `${maxIndex + 1} views` : total}
          </div>
        </div>
      </Card>

      {/* Carousel Outer Row with External Navigation Chevrons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isTiny ? 6 : isMobile ? 8 : 14, width: '100%' }}>
        {/* External Previous Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{
            flexShrink: 0,
            width: isTiny ? 32 : isMobile ? 36 : 42,
            height: isTiny ? 32 : isMobile ? 36 : 42,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronLeft size={isMobile ? 16 : 20} />
        </button>

        {/* Viewport Frame - Seamless without outer border or background */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            aspectRatio: mode === 'multi' && !isMobile ? '16 / 8' : '16 / 9',
            minHeight: isMobile ? 220 : 260,
            userSelect: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          {/* Slides Track */}
          <div
            style={{
              display: 'flex',
              height: '100%',
              gap: mode === 'single' ? 0 : 16,
              transform:
                mode === 'single'
                  ? `translateX(-${activeSlide * 100}%)`
                  : mode === 'peek'
                  ? `translateX(calc(${isMobile ? '8%' : '15%'} - ${activeSlide} * (${isMobile ? '84%' : '70%'} + 16px)))`
                  : `translateX(calc(-${activeSlide} * ((100% - ${(cardsPerView - 1) * 16}px) / ${cardsPerView} + 16px)))`,
              transition: 'transform 0.45s cubic-bezier(0.2, 1, 0.3, 1)',
              boxSizing: 'border-box',
            }}
          >
            {CAROUSEL_SLIDES.map((slide, idx) => {
              const isActive = idx === activeSlide;
              const isPeekSide = mode === 'peek' && (idx === activeSlide - 1 || idx === activeSlide + 1);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (mode === 'peek' && isPeekSide) {
                      setActiveSlide(idx);
                    } else if (mode === 'multi') {
                      setActiveSlide(Math.min(idx, maxIndex));
                    }
                  }}
                  style={{
                    flexShrink: 0,
                    width:
                      mode === 'single'
                        ? '100%'
                        : mode === 'peek'
                        ? isMobile ? '84%' : '70%'
                        : `calc((100% - ${(cardsPerView - 1) * 16}px) / ${cardsPerView})`,
                    height: '100%',
                    background: slide.gradient,
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: mode === 'multi' && !isMobile ? '14px' : 'clamp(14px, 3.5vw, 32px)',
                    boxSizing: 'border-box',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    transform:
                      mode === 'peek'
                        ? isActive
                          ? 'scale(1)'
                          : 'scale(0.92)'
                        : 'scale(1)',
                    opacity:
                      mode === 'peek'
                        ? isActive
                          ? 1
                          : 0.65
                        : mode === 'multi' && idx < activeSlide
                        ? 0.4
                        : 1,
                    transition: 'transform 0.4s ease, opacity 0.4s ease',
                    cursor: (mode === 'peek' && isPeekSide) || mode === 'multi' ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ position: 'absolute', top: mode === 'multi' && !isMobile ? 10 : 16, right: mode === 'multi' && !isMobile ? 10 : 16 }}>
                    <Badge variant="default" size="sm">{slide.tag}</Badge>
                  </div>

                  <h2
                    style={{
                      fontSize:
                        mode === 'multi' && !isMobile
                          ? '14px'
                          : 'clamp(16px, 3.5vw, 24px)',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 6px 0',
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      lineHeight: 1.25,
                    }}
                  >
                    {slide.title}
                  </h2>
                  <p
                    style={{
                      fontSize:
                        mode === 'multi' && !isMobile
                          ? '11px'
                          : 'clamp(11px, 2vw, 14px)',
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                      lineHeight: 1.35,
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      display: mode === 'multi' && !isMobile ? '-webkit-box' : 'block',
                      WebkitLineClamp: mode === 'multi' && !isMobile ? 2 : undefined,
                      WebkitBoxOrient: mode === 'multi' && !isMobile ? 'vertical' : undefined,
                      overflow: mode === 'multi' && !isMobile ? 'hidden' : 'visible',
                    }}
                  >
                    {slide.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* External Next Button */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          style={{
            flexShrink: 0,
            width: isTiny ? 32 : isMobile ? 36 : 42,
            height: isTiny ? 32 : isMobile ? 36 : 42,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronRight size={isMobile ? 16 : 20} />
        </button>
      </div>

      {/* Bullet Pagination Indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Jump to slide ${idx + 1}`}
            style={{
              width: idx === activeSlide ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === activeSlide ? 'var(--accent-primary)' : 'var(--border-strong)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Helper Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: '11px', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Smartphone size={13} />
          <span>Supports swipe on touchscreens</span>
        </div>
        <div>
          {mode === 'peek' && 'Click the peeked side cards to navigate'}
          {mode === 'multi' && (isMobile ? 'Responsive multi-card view with step scrolling' : 'Shows 3 cards at a time with smooth step scrolling')}
          {mode === 'single' && 'Standard full-width slide carousel'}
        </div>
      </div>
    </div>
  );
};

