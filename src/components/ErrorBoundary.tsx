// Basit hata sınırı — render sırasında atılan hatalarda beyaz ekran yerine TR mesaj.
import React from 'react';

interface State { hasError: boolean }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Render hatası:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Bir hata oluştu</h1>
            <p className="text-gray-600 mb-6">
              Beklenmeyen bir sorun nedeniyle sayfa görüntülenemedi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Yeniden dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
