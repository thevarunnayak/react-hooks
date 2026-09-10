import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export interface GalleryImage {
  id: string;
  title: string;
  thumbnail: string;
  full: string;
}

const PRODUCT_IMAGES: GalleryImage[] = [
  {
    id: 'img-1',
    title: 'Perspective Studio Angle',
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    full: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=90',
  },
  {
    id: 'img-2',
    title: 'Top-Down Architectural View',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    full: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=90',
  },
  {
    id: 'img-3',
    title: 'Driver & Diaphragm Detail',
    thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
    full: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&auto=format&fit=crop&q=90',
  },
  {
    id: 'img-4',
    title: 'Aluminium Pivot Gimbal',
    thumbnail: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&auto=format&fit=crop&q=80',
    full: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&auto=format&fit=crop&q=90',
  },
];

const COLOR_VARIANTS = [
  { id: 'space-gray', name: 'Space Gray', hex: '#374151' },
  { id: 'obsidian', name: 'Obsidian Black', hex: '#111827' },
  { id: 'silver', name: 'Arctic Silver', hex: '#94a3b8' },
  { id: 'teal', name: 'Cyber Teal', hex: '#0f766e' },
];

export const ProductGalleryLab: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_VARIANTS[0]);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'2x' | '2.5x' | '3x'>('2.5x');

  const heroImageRef = useRef<HTMLDivElement>(null);

  // Responsive state
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 860 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeImage = PRODUCT_IMAGES[selectedIdx];
  const zoomFactor = zoomLevel === '2x' ? 2 : zoomLevel === '2.5x' ? 2.5 : 3;

  // Handle Mouse movement on Hero Image for Zoom Lens
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroImageRef.current) return;
    const rect = heroImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedIdx((p) => (p + 1) % PRODUCT_IMAGES.length);
      if (e.key === 'ArrowLeft') setSelectedIdx((p) => (p - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <Card variant="glass" padding="md" style={{ position: 'relative', zIndex: 50 }}>
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Product Image Gallery with 2.5x Precision Zoom
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Hover over the hero image to trigger real-time cursor tracking magnification. Includes fullscreen modal lightbox.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 130 }}>
              <CustomSelect
                value={zoomLevel}
                onChange={(val) => setZoomLevel(val as any)}
                options={[
                  { value: '2x', label: '2.0x Zoom' },
                  { value: '2.5x', label: '2.5x Zoom' },
                  { value: '3x', label: '3.0x Zoom' },
                ]}
              />
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={<Maximize2 size={14} />}
              onClick={() => setIsLightboxOpen(true)}
            >
              Lightbox View
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Product Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'minmax(340px, 480px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Gallery (Hero + Thumbnails) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Hero View with Lens */}
          <Card
            variant="glass"
            padding="none"
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              ref={heroImageRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              style={{
                position: 'relative',
                width: '100%',
                height: isCompact ? 'clamp(260px, 55vw, 360px)' : 380,
                cursor: 'crosshair',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={activeImage.full}
                alt={activeImage.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />

              {/* Magnifying Lens box */}
              {isZooming && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${mousePos.y}%`,
                    left: `${mousePos.x}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 120,
                    height: 120,
                    borderRadius: '8px',
                    border: '2px solid var(--primary-color, #3b82f6)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Lightbox Trigger Icon Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                title="Open fullscreen lightbox"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '11px',
                }}
              >
                <Maximize2 size={13} />
                <span>Expand</span>
              </button>
            </div>
          </Card>

          {/* Thumbnails Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {PRODUCT_IMAGES.map((img, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: 72,
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                  }}
                >
                  <img
                    src={img.thumbnail}
                    alt={img.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Zoom Window OR Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isZooming ? (
            /* High-Definition Zoom View Panel */
            <Card
              variant="glass"
              padding="none"
              style={{
                height: isCompact ? 320 : 462,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid var(--accent-primary)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: '0 12px 36px rgba(59, 130, 246, 0.25)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 14,
                  zIndex: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--primary-light, #60a5fa)',
                  fontWeight: 600,
                }}
              >
                {zoomLevel} MAGNIFICATION ACTIVE
              </div>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${activeImage.full})`,
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                  backgroundSize: `${zoomFactor * 100}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </Card>
          ) : (
            /* Product Specs & Purchasing Card */
            <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Badge variant="primary">FLAGSHIP SERIES</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Model: Studio-Apex-X9
                  </span>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700 }}>
                  AuraSound Apex Hi-Res Studio Reference Monitors
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', color: '#fbbf24' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    4.94
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    (1,482 verified studio reviews)
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  $349.00
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  $429.00
                </span>
                <Badge variant="success">SAVE $80 TODAY</Badge>
              </div>

              {/* Color Finish Swatches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Color Finish: <span style={{ color: 'var(--text-muted)' }}>{selectedColor.name}</span>
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {COLOR_VARIANTS.map((c) => {
                    const isPicked = selectedColor.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: isPicked
                            ? '3px solid var(--primary-color, #3b82f6)'
                            : '2px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          boxShadow: isPicked ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Shipping & Warranty Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Free Next-Day Air Shipping
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: '#38bdf8' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    3-Year Extended Warranty
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  size="lg"
                  variant={isAddedToCart ? 'secondary' : 'primary'}
                  icon={isAddedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                >
                  {isAddedToCart ? 'Added to Studio Bag!' : 'Add to Bag'}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setIsLightboxOpen(true)}>
                  Inspect Details
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 900,
              width: '100%',
              backgroundColor: '#0a0e1a',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                {activeImage.title} ({selectedIdx + 1} of {PRODUCT_IMAGES.length})
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Display */}
            <div
              style={{
                position: 'relative',
                height: 520,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
              }}
            >
              <img
                src={activeImage.full}
                alt={activeImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />

              {/* Prev / Next Buttons */}
              <button
                onClick={() =>
                  setSelectedIdx((p) => (p - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length)
                }
                style={{
                  position: 'absolute',
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedIdx((p) => (p + 1) % PRODUCT_IMAGES.length)}
                style={{
                  position: 'absolute',
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Normalized Coordinate Math</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Translates raw pointer clientX/clientY into 0–100% normalized percentages relative to image bounding box, preventing edge overshooting.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Decoupled Magnified Canvas</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Renders high-resolution image background-position mapping alongside the hero rather than scaling the hero itself, preserving DOM simplicity.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Accessible Keyboard Lightbox</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Full arrow key cycling and Escape key listener bindings ensure full keyboard accessibility for visually detailed inspection.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
