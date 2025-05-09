import React, { Component } from "react";

class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
                    <h2>Something went wrong.</h2>
                    <p>{this.state.error?.toString()}</p>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                    <button
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;