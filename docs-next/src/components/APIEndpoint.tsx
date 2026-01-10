import React from 'react';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface APIEndpointProps {
  method: HTTPMethod;
  path: string;
  description?: string;
  deprecated?: boolean;
  beta?: boolean;
}

const methodColors: Record<HTTPMethod, { bg: string; text: string }> = {
  GET: { bg: 'rgba(16, 185, 129, 0.15)', text: '#047857' },
  POST: { bg: 'rgba(59, 130, 246, 0.15)', text: '#1D4ED8' },
  PUT: { bg: 'rgba(245, 158, 11, 0.15)', text: '#B45309' },
  PATCH: { bg: 'rgba(139, 92, 246, 0.15)', text: '#6D28D9' },
  DELETE: { bg: 'rgba(239, 68, 68, 0.15)', text: '#B91C1C' },
};

/**
 * APIEndpoint - Display an API endpoint with method badge
 *
 * Used in API reference pages to show endpoint paths with
 * proper styling matching TBWA brand guidelines.
 */
export function APIEndpoint({
  method,
  path,
  description,
  deprecated = false,
  beta = false,
}: APIEndpointProps) {
  const colors = methodColors[method];

  return (
    <div className={`api-endpoint ${deprecated ? 'api-endpoint--deprecated' : ''}`}>
      <div className="api-endpoint__header">
        <span
          className="api-endpoint__method"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {method}
        </span>
        <code className="api-endpoint__path">{path}</code>
        {deprecated && <span className="api-endpoint__badge api-endpoint__badge--deprecated">Deprecated</span>}
        {beta && <span className="api-endpoint__badge api-endpoint__badge--beta">Beta</span>}
      </div>
      {description && (
        <p className="api-endpoint__description">{description}</p>
      )}

      <style>{`
        .api-endpoint {
          border: 1px solid var(--docs-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-4);
          margin: var(--spacing-4) 0;
          background-color: var(--docs-card-bg);
        }

        .api-endpoint--deprecated {
          opacity: 0.7;
          border-style: dashed;
        }

        .api-endpoint__header {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          flex-wrap: wrap;
        }

        .api-endpoint__method {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-mono);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .api-endpoint__path {
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          color: var(--docs-text);
          background: none;
          padding: 0;
        }

        .api-endpoint__badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 500;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .api-endpoint__badge--deprecated {
          background-color: rgba(239, 68, 68, 0.15);
          color: #B91C1C;
        }

        .api-endpoint__badge--beta {
          background-color: rgba(255, 204, 0, 0.2);
          color: #B45309;
        }

        .api-endpoint__description {
          margin-top: var(--spacing-2);
          margin-bottom: 0;
          font-size: 0.875rem;
          color: var(--docs-text-secondary);
        }
      `}</style>
    </div>
  );
}

export default APIEndpoint;
