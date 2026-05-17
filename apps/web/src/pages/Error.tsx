import React, { ReactNode } from 'react';

import { VoiceButton } from '@/components/common/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Une erreur s'est produite
            </h1>
            <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
            <VoiceButton
              variant={'ghost'}
              voiceText="Actualiser la page"
              onClick={() => window.location.reload()}
              className="mt-4 p-4! bg-red-600! text-white! rounded"
            >
              Actualiser la page
            </VoiceButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
