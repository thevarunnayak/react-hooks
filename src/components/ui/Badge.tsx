import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  style,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--bg-subtle)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
    },
    primary: {
      backgroundColor: 'var(--accent-primary-subtle)',
      color: 'var(--accent-primary-text)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
    },
    success: {
      backgroundColor: 'var(--accent-success-subtle)',
      color: 'var(--accent-success-text)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
    },
    warning: {
      backgroundColor: 'var(--accent-warning-subtle)',
      color: 'var(--accent-warning-text)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
    },
    danger: {
      backgroundColor: 'var(--accent-danger-subtle)',
      color: 'var(--accent-danger-text)',
      border: '1px solid rgba(244, 63, 94, 0.25)',
    },
    purple: {
      backgroundColor: 'var(--accent-purple-subtle)',
      color: 'var(--accent-purple-text)',
      border: '1px solid rgba(139, 92, 246, 0.25)',
    },
    cyan: {
      backgroundColor: 'var(--accent-cyan-subtle)',
      color: 'var(--accent-cyan-text)',
      border: '1px solid rgba(6, 182, 212, 0.25)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '2px 8px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-full)' },
    md: { padding: '4px 10px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-full)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
};
