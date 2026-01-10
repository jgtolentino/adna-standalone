import React from 'react';

interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description?: string;
  deprecated?: boolean;
}

interface SchemaTableProps {
  title?: string;
  fields: SchemaField[];
  showRequired?: boolean;
  showDefault?: boolean;
}

/**
 * SchemaTable - Display API schema fields in a table format
 *
 * Used in API reference pages to document request/response schemas
 * with types, requirements, and descriptions.
 */
export function SchemaTable({
  title,
  fields,
  showRequired = true,
  showDefault = true,
}: SchemaTableProps) {
  return (
    <div className="schema-table">
      {title && <h4 className="schema-table__title">{title}</h4>}
      <div className="schema-table__wrapper">
        <table className="schema-table__table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              {showRequired && <th>Required</th>}
              {showDefault && <th>Default</th>}
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr
                key={field.name}
                className={field.deprecated ? 'schema-table__row--deprecated' : ''}
              >
                <td>
                  <code className="schema-table__field-name">{field.name}</code>
                  {field.deprecated && (
                    <span className="schema-table__deprecated-badge">deprecated</span>
                  )}
                </td>
                <td>
                  <span className="schema-table__type">{field.type}</span>
                </td>
                {showRequired && (
                  <td>
                    {field.required ? (
                      <span className="schema-table__required">Yes</span>
                    ) : (
                      <span className="schema-table__optional">No</span>
                    )}
                  </td>
                )}
                {showDefault && (
                  <td>
                    {field.default ? (
                      <code className="schema-table__default">{field.default}</code>
                    ) : (
                      <span className="schema-table__none">—</span>
                    )}
                  </td>
                )}
                <td className="schema-table__description">
                  {field.description || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .schema-table {
          margin: var(--spacing-4) 0;
        }

        .schema-table__title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: var(--spacing-3);
          color: var(--docs-text);
        }

        .schema-table__wrapper {
          overflow-x: auto;
          border: 1px solid var(--docs-border);
          border-radius: var(--radius-md);
        }

        .schema-table__table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          font-size: 0.875rem;
        }

        .schema-table__table th {
          background-color: var(--docs-bg-secondary);
          font-weight: 600;
          text-align: left;
          padding: var(--spacing-3) var(--spacing-4);
          border-bottom: 1px solid var(--docs-border);
          white-space: nowrap;
        }

        .schema-table__table td {
          padding: var(--spacing-3) var(--spacing-4);
          border-bottom: 1px solid var(--docs-border);
          vertical-align: top;
        }

        .schema-table__table tr:last-child td {
          border-bottom: none;
        }

        .schema-table__table tr:hover {
          background-color: var(--docs-bg-secondary);
        }

        .schema-table__row--deprecated {
          opacity: 0.6;
        }

        .schema-table__field-name {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--docs-text);
          background-color: var(--docs-inline-code-bg);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }

        .schema-table__deprecated-badge {
          display: inline-block;
          margin-left: var(--spacing-2);
          padding: 0.0625rem 0.375rem;
          font-size: 0.625rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: rgba(239, 68, 68, 0.15);
          color: #B91C1C;
          border-radius: var(--radius-full);
        }

        .schema-table__type {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--color-brand-blue);
        }

        .schema-table__required {
          color: var(--color-error);
          font-weight: 500;
        }

        .schema-table__optional {
          color: var(--docs-text-muted);
        }

        .schema-table__default {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          background-color: var(--docs-inline-code-bg);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }

        .schema-table__none {
          color: var(--docs-text-muted);
        }

        .schema-table__description {
          color: var(--docs-text-secondary);
          max-width: 300px;
        }
      `}</style>
    </div>
  );
}

export default SchemaTable;
