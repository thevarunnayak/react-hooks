import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'subtle';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  padding = 'md',
  style,
  className = '',
  ...props
}) => {
  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
    },
    elevated: {
      backgroundColor: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-md)',
    },
    glass: {
      backgroundColor: 'var(--bg-glass-card)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)',
    },
    subtle: {
      backgroundColor: 'var(--bg-subtle)',
      border: '1px solid var(--border-subtle)',
    },
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: paddingStyles[padding],
        transition: 'all var(--transition-normal)',
        cursor: interactive ? 'pointer' : 'default',
        ...variantStyles[variant],
        ...style,
      }}
      className={`card-ui ${interactive ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
