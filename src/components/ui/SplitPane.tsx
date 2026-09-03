import React from 'react';

export interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number; // e.g. 0.5 for 50/50, 0.6 for 60/40
  minLeftWidth?: string;
  minRightWidth?: string;
  stackBreakpoint?: number; // width in px below which panes stack vertically
  style?: React.CSSProperties;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  defaultRatio = 0.5,
  minLeftWidth = '300px',
  minRightWidth = '300px',
  style,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `minmax(${minLeftWidth}, ${defaultRatio * 100}%) 1fr`,
        gap: '1px',
        backgroundColor: 'var(--border-subtle)',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        ...style,
      }}
      className="split-pane-container"
    >
      <div style={{ backgroundColor: 'var(--bg-app)', overflow: 'auto', height: '100%' }}>
        {left}
      </div>
      <div style={{ backgroundColor: 'var(--bg-app)', overflow: 'auto', height: '100%' }}>
        {right}
      </div>
    </div>
  );
};
