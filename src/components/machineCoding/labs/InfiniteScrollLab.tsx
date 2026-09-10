import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { RotateCcw, AlertTriangle, CheckCircle2, Flame, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

interface FeedPost {
  id: string;
  author: string;
  handle: string;
  avatarColor: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tag: string;
}

const AUTHORS = [
  { name: 'Sarah Chen', handle: '@sarahc_dev', color: '#3b82f6' },
  { name: 'Alex Rivera', handle: '@alex_arch', color: '#8b5cf6' },
  { name: 'David Kumar', handle: '@david_k', color: '#10b981' },
  { name: 'Elena Rostova', handle: '@elena_eng', color: '#ec4899' },
  { name: 'Marcus Brody', handle: '@marcus_perf', color: '#f59e0b' },
];

const POST_TEMPLATES = [
  { title: 'Why we migrated our critical dashboard to React 19', tag: 'Architecture' },
  { title: 'Deep dive into AbortController and microtask queues', tag: 'Async' },
  { title: 'Eliminating layout thrashing with CSS subgrid & transforms', tag: 'Performance' },
  { title: 'How to design accessible comboboxes that pass WCAG AAA', tag: 'Accessibility' },
  { title: 'State machine patterns for multi-step checkout wizards', tag: 'Design Patterns' },
];

function generateMockPage(pageNum: number, count: number): FeedPost[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = (pageNum - 1) * count + i;
    const author = AUTHORS[idx % AUTHORS.length];
    const template = POST_TEMPLATES[idx % POST_TEMPLATES.length];

    return {
      id: `post-${idx + 1}`,
      author: author.name,
      handle: author.handle,
      avatarColor: author.color,
      title: `${template.title} (Part ${idx + 1})`,
      content: `In modern frontend engineering, building high-throughput UI components requires understanding browser rendering pipelines and memory limits.`,
      likes: 12 + ((idx * 7) % 89),
      comments: 3 + ((idx * 3) % 24),
      tag: template.tag,
    };
  });
}

export const InfiniteScrollLab: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>(() => generateMockPage(1, 4));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [simulatedError, setSimulatedError] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Sentinel ref with IntersectionObserver
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || simulatedError) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { rootMargin: '150px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, simulatedError]
  );

  useEffect(() => {
    if (page === 1) return; // Initial page is already set

    setLoading(true);
    const timer = setTimeout(() => {
      if (page >= 6) {
        // Capped at 5 pages (20 posts) for the demo
        setHasMore(false);
        setLoading(false);
        return;
      }

      const nextBatch = generateMockPage(page, 4);
      setPosts((prev) => [...prev, ...nextBatch]);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [page]);

  const handleReset = () => {
    setPosts(generateMockPage(1, 4));
    setPage(1);
    setHasMore(true);
    setSimulatedError(false);
  };

  const handleTriggerError = () => {
    setSimulatedError(true);
  };

  const handleRetry = () => {
    setSimulatedError(false);
    setLoading(true);
    setTimeout(() => {
      const nextBatch = generateMockPage(page + 1, 4);
      setPosts((prev) => [...prev, ...nextBatch]);
      setPage((p) => p + 1);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Control Strip */}
      <Card variant="glass" padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="cyan" size="sm">Posts Loaded: {posts.length}</Badge>
          <Badge variant={hasMore ? 'success' : 'default'} size="sm">
            {hasMore ? 'Feed Active' : 'End Reached'}
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!simulatedError && hasMore && (
            <button
              onClick={handleTriggerError}
              style={{ background: 'none', border: 'none', color: 'var(--accent-warning)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Simulate Network Error
            </button>
          )}
          <button
            onClick={handleReset}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
          >
            <RotateCcw size={11} /> Reset Feed
          </button>
        </div>
      </Card>

      {/* Feed Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;

          return (
            <div
              key={post.id}
              ref={isLast ? sentinelRef : undefined}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: post.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                    {post.author[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{post.author}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.handle}</div>
                  </div>
                </div>
                <Badge variant="purple" size="sm">{post.tag}</Badge>
              </div>

              {/* Title & Body */}
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {post.title}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {post.content}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '11px', color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={12} /> {post.likes}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {post.comments}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Share2 size={12} /> Share</span>
              </div>
            </div>
          );
        })}

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px dashed var(--border-subtle)',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <div style={{ height: 16, width: '40%', backgroundColor: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 12, width: '85%', backgroundColor: 'var(--bg-surface)', borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 12, width: '60%', backgroundColor: 'var(--bg-surface)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {simulatedError && (
          <Card variant="elevated" padding="md" style={{ textAlign: 'center', borderColor: 'var(--accent-danger)' }}>
            <AlertTriangle size={24} style={{ color: 'var(--accent-danger)', margin: '0 auto 6px auto' }} />
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Failed to load next page</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 12px 0' }}>Network timeout occurred while fetching posts.</div>
            <Button size="xs" variant="primary" onClick={handleRetry}>
              Retry Fetch
            </Button>
          </Card>
        )}

        {/* End of Feed */}
        {!hasMore && (
          <Card variant="glass" padding="md" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--accent-success)', margin: '0 auto 4px auto' }} />
            You have reached the end of the feed! (20 posts loaded)
          </Card>
        )}
      </div>
    </div>
  );
};
