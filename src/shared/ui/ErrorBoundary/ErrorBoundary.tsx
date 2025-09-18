import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Fallback component to render on error */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error?: Error;
}

/**
 * ErrorBoundary component for catching and handling React errors
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @class ErrorBoundary
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /** Display name for debugging */
  static displayName = 'ErrorBoundary';

  /**
   * Creates a new ErrorBoundary instance
   *
   * @param props - Component props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state so the next render will show the fallback UI
   *
   * @param error - The error that was thrown
   * @returns {ErrorBoundaryState} New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Called when an error is caught by the error boundary
   *
   * @param error - The error that was thrown
   * @param errorInfo - Information about the error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Render the component
   *
   * @returns {ReactNode} Rendered component or fallback UI
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-300 mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-red-200 mb-4">
              Произошла ошибка при отображении компонента. Пожалуйста,
              попробуйте обновить страницу.
            </p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              aria-label="Try to recover from error"
            >
              Попробовать снова
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-300 font-medium">
                  Детали ошибки (только в режиме разработки)
                </summary>
                <pre className="mt-2 p-3 bg-gray-800 rounded text-red-200 text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
