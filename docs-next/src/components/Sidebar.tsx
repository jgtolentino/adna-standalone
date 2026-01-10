import React, { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  items?: NavItem[];
  badge?: string;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
}

/**
 * Sidebar - Navigation sidebar matching Suqi Analytics design
 *
 * Features:
 * - Collapsible sections
 * - Active state highlighting
 * - Icon support
 * - Badge support (for version indicators, etc.)
 */
export function Sidebar({ items, logo, subtitle, footer }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Header with logo */}
      <div className="sidebar__header">
        {logo && <div className="sidebar__logo">{logo}</div>}
        {subtitle && <span className="sidebar__subtitle">{subtitle}</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {items.map((item, index) => (
          <NavSection key={index} item={item} />
        ))}
      </nav>

      {/* Footer */}
      {footer && <div className="sidebar__footer">{footer}</div>}

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          background-color: var(--docs-sidebar-bg);
          border-right: 1px solid var(--docs-border);
          overflow: hidden;
        }

        .sidebar__header {
          padding: var(--spacing-4) var(--spacing-4);
          border-bottom: 1px solid var(--docs-border);
        }

        .sidebar__logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }

        .sidebar__subtitle {
          display: block;
          font-size: 0.75rem;
          color: var(--color-brand-teal);
          margin-top: var(--spacing-1);
        }

        .sidebar__nav {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-3) 0;
        }

        .sidebar__footer {
          padding: var(--spacing-4);
          border-top: 1px solid var(--docs-border);
        }

        /* Nav Section */
        .nav-section {
          margin-bottom: var(--spacing-1);
        }

        .nav-section__header {
          display: flex;
          align-items: center;
          width: 100%;
          padding: var(--spacing-2) var(--spacing-4);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--docs-sidebar-text);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .nav-section__header:hover {
          background-color: var(--docs-sidebar-hover);
        }

        .nav-section__header--active {
          color: var(--docs-sidebar-active);
          background-color: var(--docs-sidebar-active-bg);
        }

        .nav-section__icon {
          width: 20px;
          height: 20px;
          margin-right: var(--spacing-3);
          flex-shrink: 0;
        }

        .nav-section__label {
          flex: 1;
        }

        .nav-section__badge {
          font-size: 0.6875rem;
          padding: 0.0625rem 0.375rem;
          background-color: rgba(255, 204, 0, 0.2);
          color: #B45309;
          border-radius: var(--radius-full);
          margin-left: var(--spacing-2);
        }

        .nav-section__chevron {
          width: 16px;
          height: 16px;
          color: var(--docs-sidebar-text-muted);
          transition: transform var(--transition-fast);
        }

        .nav-section__chevron--open {
          transform: rotate(90deg);
        }

        /* Sub items */
        .nav-section__items {
          margin-left: calc(var(--spacing-4) + 20px + var(--spacing-3));
          padding-left: var(--spacing-3);
          border-left: 1px solid var(--docs-border);
        }

        .nav-section__item {
          display: block;
          padding: var(--spacing-1) var(--spacing-3);
          font-size: 0.8125rem;
          color: var(--docs-sidebar-text-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .nav-section__item:hover {
          color: var(--docs-sidebar-text);
        }

        .nav-section__item--active {
          color: var(--docs-sidebar-active);
          font-weight: 500;
        }
      `}</style>
    </aside>
  );
}

function NavSection({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(
    item.active || item.items?.some((i) => i.active) || false
  );
  const hasItems = item.items && item.items.length > 0;

  if (!hasItems && item.href) {
    return (
      <div className="nav-section">
        <a
          href={item.href}
          className={`nav-section__header ${item.active ? 'nav-section__header--active' : ''}`}
        >
          {item.icon && <span className="nav-section__icon">{item.icon}</span>}
          <span className="nav-section__label">{item.label}</span>
          {item.badge && <span className="nav-section__badge">{item.badge}</span>}
        </a>
      </div>
    );
  }

  return (
    <div className="nav-section">
      <button
        className={`nav-section__header ${item.active ? 'nav-section__header--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {item.icon && <span className="nav-section__icon">{item.icon}</span>}
        <span className="nav-section__label">{item.label}</span>
        {item.badge && <span className="nav-section__badge">{item.badge}</span>}
        {hasItems && (
          <ChevronIcon className={`nav-section__chevron ${isOpen ? 'nav-section__chevron--open' : ''}`} />
        )}
      </button>

      {hasItems && isOpen && (
        <div className="nav-section__items">
          {item.items!.map((subItem, index) => (
            <a
              key={index}
              href={subItem.href}
              className={`nav-section__item ${subItem.active ? 'nav-section__item--active' : ''}`}
            >
              {subItem.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}

export default Sidebar;
