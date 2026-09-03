import React from 'react';
import { NodePort } from '../../../types/playground';

export interface PortHandleProps {
  port: NodePort;
  isConnecting?: boolean;
  onPortClick: (port: NodePort, e: React.MouseEvent) => void;
}

export const PortHandle: React.FC<PortHandleProps> = ({ port, isConnecting, onPortClick }) => {
  const getPortColor = () => {
    switch (port.category) {
      case 'event':
        return 'var(--accent-warning)';
      case 'data':
        return 'var(--accent-primary)';
      case 'action':
        return 'var(--accent-success)';
      case 'dependency':
        return 'var(--accent-purple)';
      default:
        return 'var(--accent-primary)';
    }
  };

  const color = getPortColor();
  const isOut = port.type === 'out';

  return (
    <div
      onMouseDown={(e) => {
        // Stop propagation so clicking a port does NOT initiate node dragging!
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPortClick(port, e);
      }}
      title={`Port: ${port.name} (${isOut ? 'Output' : 'Input'} • ${port.category}) — Click to connect`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isConnecting ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-surface-elevated)',
        border: `1px solid ${isConnecting ? color : 'var(--border-default)'}`,
        boxShadow: isConnecting ? `0 0 10px ${color}80` : '0 1px 3px rgba(0, 0, 0, 0.2)',
        transition: 'all var(--transition-fast)',
      }}
      className="port-handle"
    >
      {!isOut && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontWeight: 600,
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {port.name}
      </span>
      {isOut && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};
