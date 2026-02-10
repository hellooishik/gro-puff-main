import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">We're sorry, but an unexpected error has occurred.</p>
                        {this.state.error && (
                            <details className="text-left bg-gray-100 p-4 rounded mb-6 overflow-auto max-h-48 text-sm">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <pre className="whitespace-pre-wrap text-red-500">{this.state.error.toString()}</pre>
                                <br />
                                <pre className="whitespace-pre-wrap text-gray-500">{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#00ADEF] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0092ca] transition"
                        >
                            Reload Page
                        </button>
                        <div className="mt-4">
                            <a href="/" className="text-blue-500 hover:underline">Go to Home</a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
