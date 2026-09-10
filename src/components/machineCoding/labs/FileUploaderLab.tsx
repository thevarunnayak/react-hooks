import React, { useState, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Pause, Play, X, RotateCcw, Image as ImageIcon } from 'lucide-react';

export interface UploadItem {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  progress: number;
  status: 'queued' | 'uploading' | 'paused' | 'completed' | 'error';
  previewUrl?: string;
}

export const FileUploaderLab: React.FC = () => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [maxSizeMb] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalsRef = useRef<Record<string, any>>({});

  const startSimulatedUpload = (id: string) => {
    if (intervalsRef.current[id]) clearInterval(intervalsRef.current[id]);

    intervalsRef.current[id] = setInterval(() => {
      setQueue((prev) =>
        prev.map((item) => {
          if (item.id !== id || item.status !== 'uploading') return item;
          if (item.progress >= 100) {
            clearInterval(intervalsRef.current[id]);
            return { ...item, progress: 100, status: 'completed' };
          }
          return { ...item, progress: Math.min(100, item.progress + 15) };
        })
      );
    }, 300);
  };

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newItems: UploadItem[] = [];
    Array.from(fileList).forEach((file) => {
      const isOversized = file.size > maxSizeMb * 1024 * 1024;
      const isImg = file.type.startsWith('image/');
      const id = String(Date.now() + Math.random());

      const item: UploadItem = {
        id,
        name: file.name,
        sizeBytes: file.size,
        type: file.type || 'file',
        progress: 0,
        status: isOversized ? 'error' : 'uploading',
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
      };

      newItems.push(item);
      if (!isOversized) {
        startSimulatedUpload(id);
      }
    });

    setQueue((prev) => [...newItems, ...prev]);
  };

  const handlePause = (id: string) => {
    clearInterval(intervalsRef.current[id]);
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'paused' } : item)));
  };

  const handleResume = (id: string) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'uploading' } : item)));
    startSimulatedUpload(id);
  };

  const handleCancel = (id: string) => {
    clearInterval(intervalsRef.current[id]);
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRetry = (id: string) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, progress: 0, status: 'uploading' } : item)));
    startSimulatedUpload(id);
  };

  const handleClearAll = () => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};
    setQueue([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Dropzone Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleAddFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isDragging ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
          padding: '36px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <UploadCloud size={36} style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)', margin: '0 auto 10px auto' }} />
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Drag & drop files here, or browse
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Supports images, PDFs, videos up to {maxSizeMb}MB
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleAddFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Queue Summary & Clear */}
      {queue.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Upload Queue ({queue.length} files)
          </span>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleClearAll}
            style={{ color: 'var(--accent-danger)' }}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* File List Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queue.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {item.previewUrl ? (
                  <img src={item.previewUrl} alt={item.name} style={{ width: 34, height: 34, borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 4, backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={18} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'clamp(120px, 35vw, 260px)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatSize(item.sizeBytes)} • {item.status}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {item.status === 'completed' && <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />}
                {item.status === 'error' && <AlertCircle size={16} style={{ color: 'var(--accent-danger)' }} />}

                {item.status === 'uploading' && (
                  <Button size="xs" variant="ghost" icon={<Pause size={13} />} onClick={() => handlePause(item.id)} aria-label="Pause" />
                )}

                {item.status === 'paused' && (
                  <Button size="xs" variant="ghost" icon={<Play size={13} style={{ color: 'var(--accent-primary)' }} />} onClick={() => handleResume(item.id)} aria-label="Resume" />
                )}

                {item.status === 'error' && (
                  <Button size="xs" variant="ghost" icon={<RotateCcw size={13} style={{ color: 'var(--accent-warning)' }} />} onClick={() => handleRetry(item.id)} aria-label="Retry" />
                )}

                <Button size="xs" variant="ghost" icon={<X size={13} />} onClick={() => handleCancel(item.id)} aria-label="Cancel" />
              </div>
            </div>

            {/* Progress Bar */}
            {item.status !== 'error' && (
              <div style={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.progress}%`,
                    height: '100%',
                    backgroundColor: item.status === 'completed' ? 'var(--accent-success)' : 'var(--accent-primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
