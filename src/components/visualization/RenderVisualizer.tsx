import React, { useState } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CustomSelect } from '../ui/CustomSelect';
import { Tooltip } from '../ui/Tooltip';
import { t } from '../../i18n/i18n';

export interface RenderLogEntry {
  id: string;
  renderNumber: number;
  timestamp: number;
  componentName: string;
  reason: string;
  propsChanged?: Record<string, { prev: any; next: any }>;
  stateChanged?: Record<string, { prev: any; next: any }>;
  memoized?: boolean;
}

export interface RenderVisualizerProps {
  logs: RenderLogEntry[];
  onClear?: () => void;
  title?: string;
  maxLogs?: number;
}

export const RenderVisualizer: React.FC<RenderVisualizerProps> = ({
  logs,
  onClear,
  title = t('renderVisualizer.title'),
  maxLogs = 20,
}) => {
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const visibleLogs = logs
    .filter((l) => (filterComponent === 'all' ? true : l.componentName === filterComponent))
    .slice(-maxLogs);

  const uniqueComponents = Array.from(new Set(logs.map((l) => l.componentName)));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            {title}
          </span>
          <Badge variant="primary" size="sm">
            {logs.length} Renders
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {uniqueComponents.length > 1 && (
            <CustomSelect
              value={filterComponent}
              onChange={setFilterComponent}
              options={[
                { value: 'all', label: t('renderVisualizer.filterAll') },
                ...uniqueComponents.map((c) => ({ value: c, label: c })),
              ]}
              size="sm"
              variant="elevated"
            />
          )}

          {onClear && (
            <Tooltip content={t('renderVisualizer.clearTooltip')} placement="bottom">
              <Button
                size="xs"
                variant="ghost"
                icon={<RotateCcw size={12} />}
                onClick={onClear}
              >
                {t('renderVisualizer.clearBtn')}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div
        style={{
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '280px',
          overflowY: 'auto',
        }}
      >
        {visibleLogs.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
            }}
          >
            No render events captured yet. Interact with the demo above to observe render causality.
          </div>
        ) : (
          visibleLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: 'var(--text-xs)',
                animation: 'fadeIn 200ms ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  #{log.renderNumber}
                </span>

                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  &lt;{log.componentName} /&gt;
                </span>

                <span style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reason:</span> {log.reason}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {log.memoized && (
                  <Badge variant="purple" size="sm">
                    React.memo
                  </Badge>
                )}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
                  +{Math.round((Date.now() - log.timestamp) / 1000)}s
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
