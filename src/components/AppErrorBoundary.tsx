import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface State { hasError: boolean }

/** Top-level safety net: shows a friendly message instead of a blank page. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected app error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main role="alert" className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page hit an unexpected problem. Reloading usually fixes it.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </main>
    );
  }
}
