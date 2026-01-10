import React from 'react';

type CalloutVariant = 'info' | 'warning' | 'error' | 'success' | 'note';

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

const variantConfig: Record<CalloutVariant, { icon: React.ReactNode; color: string; bgColor: string }> = {
  info: {
    icon: <InfoIcon />,
    color: 'var(--color-info)',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  warning: {
    icon: <WarningIcon />,
    color: 'var(--color-warning)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    icon: <ErrorIcon />,
    color: 'var(--color-error)',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  success: {
    icon: <SuccessIcon />,
    color: 'var(--color-success)',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  note: {
    icon: <NoteIcon />,
    color: 'var(--docs-text-secondary)',
    bgColor: 'var(--docs-bg-secondary)',
  },
};

/**
 * Callout - Highlighted information box for important content
 *
 * Variants:
 * - info: General information
 * - warning: Caution or attention needed
 * - error: Critical errors or breaking changes
 * - success: Positive outcomes or best practices
 * - note: Additional context or tips
 */
export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <div
      className="callout"
      style={{
        '--callout-color': config.color,
        '--callout-bg': config.bgColor,
      } as React.CSSProperties}
    >
      <div className="callout__icon">{config.icon}</div>
      <div className="callout__content">
        {title && <div className="callout__title">{title}</div>}
        <div className="callout__body">{children}</div>
      </div>

      <style>{`
        .callout {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          background-color: var(--callout-bg);
          border-left: 4px solid var(--callout-color);
          margin: 1rem 0;
        }

        .callout__icon {
          flex-shrink: 0;
          color: var(--callout-color);
        }

        .callout__icon svg {
          width: 20px;
          height: 20px;
        }

        .callout__content {
          flex: 1;
          min-width: 0;
        }

        .callout__title {
          font-weight: 600;
          color: var(--docs-text);
          margin-bottom: 0.25rem;
        }

        .callout__body {
          font-size: 0.9375rem;
          color: var(--docs-text-secondary);
          line-height: 1.5;
        }

        .callout__body p:last-child {
          margin-bottom: 0;
        }

        .callout__body code {
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export default Callout;
