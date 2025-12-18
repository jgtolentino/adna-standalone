'use client';

/**
 * React Error Boundary
 * Catches rendering errors and displays fallback UI
 * Logs errors to observability system
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to observability system
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // Fire and forget - don't break the app if logging fails
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'error',
        component: 'ErrorBoundary',
        action: 'component_error',
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        componentStack: errorInfo.componentStack?.split('\n').slice(0, 10).join('\n'),
        componentName: this.props.componentName,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silent fail
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            {this.props.componentName
              ? `The ${this.props.componentName} component encountered an error.`
              : 'An error occurred while rendering this component.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="text-sm text-red-600 cursor-pointer">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Widget-specific error fallback component
 */
interface WidgetErrorFallbackProps {
  widgetName: string;
  error?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function WidgetErrorFallback({
  widgetName,
  error,
  onRetry,
  compact = false,
}: WidgetErrorFallbackProps) {
  if (compact) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{widgetName} unavailable</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-yellow-700 hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 text-yellow-800 mb-2">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium">{widgetName} temporarily unavailable</span>
      </div>
      {error && (
        <p className="text-sm text-yellow-700 mb-3">{error}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-900"
        >
          <RefreshCw className="w-3 h-3" />
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Loading fallback component
 */
interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="p-6 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Empty state fallback component
 */
interface EmptyFallbackProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyFallback({
  title = 'No data available',
  message = 'There is no data to display at this time.',
  action,
}: EmptyFallbackProps) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
