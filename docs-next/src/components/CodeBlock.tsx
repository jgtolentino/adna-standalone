import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  tabs?: { label: string; code: string; language: string }[];
}

/**
 * CodeBlock - Syntax highlighted code block with copy functionality
 *
 * Features:
 * - Language tabs for multi-language examples
 * - Copy to clipboard
 * - Line numbers (optional)
 * - Line highlighting
 * - Filename display
 */
export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = false,
  highlightLines = [],
  tabs,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const currentCode = tabs ? tabs[activeTab].code : code;
  const currentLanguage = tabs ? tabs[activeTab].language : language;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = currentCode.split('\n');

  return (
    <div className="code-block">
      {/* Header with tabs or filename */}
      <div className="code-block__header">
        {tabs ? (
          <div className="code-block__tabs" role="tablist">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                role="tab"
                aria-selected={activeTab === index}
                className={`code-block__tab ${activeTab === index ? 'code-block__tab--active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="code-block__info">
            {filename && <span className="code-block__filename">{filename}</span>}
            <span className="code-block__language">{currentLanguage}</span>
          </div>
        )}

        <button
          className="code-block__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <CheckIcon />
          ) : (
            <CopyIcon />
          )}
          <span className="code-block__copy-text">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Code content */}
      <pre className="code-block__pre">
        <code className={`language-${currentLanguage}`}>
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightLines.includes(lineNumber);

            return (
              <div
                key={index}
                className={`code-block__line ${isHighlighted ? 'code-block__line--highlighted' : ''}`}
              >
                {showLineNumbers && (
                  <span className="code-block__line-number">{lineNumber}</span>
                )}
                <span className="code-block__line-content">{line || ' '}</span>
              </div>
            );
          })}
        </code>
      </pre>

      <style>{`
        .code-block {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--docs-border);
          margin: 1rem 0;
        }

        .code-block__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--docs-bg-secondary);
          border-bottom: 1px solid var(--docs-border);
        }

        .code-block__tabs {
          display: flex;
          gap: 0.25rem;
        }

        .code-block__tab {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-family: var(--font-sans);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--docs-text-secondary);
          transition: all var(--transition-fast);
        }

        .code-block__tab:hover {
          color: var(--docs-text);
          background-color: var(--docs-border);
        }

        .code-block__tab--active {
          color: var(--docs-text);
          background-color: var(--docs-bg);
        }

        .code-block__info {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .code-block__filename {
          font-size: 0.8125rem;
          font-family: var(--font-mono);
          color: var(--docs-text);
        }

        .code-block__language {
          font-size: 0.75rem;
          color: var(--docs-text-muted);
          text-transform: uppercase;
        }

        .code-block__copy {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-family: var(--font-sans);
          background: none;
          border: 1px solid var(--docs-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--docs-text-secondary);
          transition: all var(--transition-fast);
        }

        .code-block__copy:hover {
          color: var(--docs-text);
          border-color: var(--docs-text-secondary);
        }

        .code-block__copy svg {
          width: 14px;
          height: 14px;
        }

        .code-block__pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          background-color: var(--docs-code-bg);
        }

        .code-block__pre code {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          line-height: 1.625;
        }

        .code-block__line {
          display: flex;
        }

        .code-block__line--highlighted {
          background-color: rgba(255, 107, 0, 0.1);
          margin: 0 -1rem;
          padding: 0 1rem;
        }

        .code-block__line-number {
          user-select: none;
          text-align: right;
          color: var(--docs-text-muted);
          min-width: 2rem;
          padding-right: 1rem;
        }

        .code-block__line-content {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

export default CodeBlock;
