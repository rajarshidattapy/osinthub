import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm max-w-xl mx-auto mt-12 rounded-lg border border-red-700 bg-red-900/20 text-red-200">
          <h2 className="text-lg font-semibold mb-2 text-red-300">Something went wrong.</h2>
          <p className="mb-3">The view failed to load. Try refreshing or returning to the dashboard.</p>
          {this.state.error && (
            <details className="whitespace-pre-wrap text-xs opacity-70">
              {this.state.error.message}\n{this.state.error.stack}
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 inline-flex items-center px-3 py-1.5 rounded-md bg-red-700/40 hover:bg-red-700/60 text-red-50 text-xs font-medium"
          >Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
