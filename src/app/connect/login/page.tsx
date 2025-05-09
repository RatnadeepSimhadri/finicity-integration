'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Connect, ConnectEventHandlers, ConnectOptions, ConnectDoneEvent,
    ConnectCancelEvent, ConnectErrorEvent, ConnectRouteEvent
} from 'connect-web-sdk';

export default function ConnectLoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectInstance, setConnectInstance] = useState<any>(null);

    // Extract institution ID from search params
    const institutionId = searchParams.get('institutionId');

    useEffect(() => {
        // Ensure we have an institution ID
        if (!institutionId) {
            setError("No institution selected. Please go back and select an institution.");
            setLoading(false);
            return;
        }

        // We need a customer ID to continue - for demo purposes we'll use a fixed ID
        // In a real app, you'd get this from your user management system
        const customerId = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID || '7045095418';
        const redirectUri = `${window.location.origin}/callback`;

        const fetchConnectUrl = async () => {
            try {
                const response = await fetch('/api/finicity/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerId,
                        redirectUri,
                        institutionId
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to generate connect URL');
                }

                const data = await response.json();

                if (!data.link) {
                    throw new Error('No connect URL returned from API');
                }

                // Initialize the Connect SDK with the generated URL
                initializeConnectSdk(data.link);
            } catch (err) {
                console.error('Error generating connect URL:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize Connect');
                setLoading(false);
            }
        };

        fetchConnectUrl();

        // Cleanup function to handle SDK disposal
        return () => {
            if (connectInstance) {
                try {
                    connectInstance.close();
                } catch (e) {
                    console.error('Error closing Connect SDK:', e);
                }
            }
        };
    }, [institutionId]);

    // Initialize the Connect SDK
    const initializeConnectSdk = (connectUrl: string) => {
        try {
            const connectEventHandlers: ConnectEventHandlers = {
                onDone: (event: ConnectDoneEvent) => {
                    console.log(event);
                    router.push(`/callback?status=success`);
                },
                onCancel: (event: ConnectCancelEvent) => {
                    console.log(event);
                    router.push('/connect/search');
                },
                onError: (event: ConnectErrorEvent) => {
                    console.log(event);
                    setError('An error occurred during connection');
                    setLoading(false);
                },
                onRoute: (event: ConnectRouteEvent) => { console.log(event); },
                onUser: (event: any) => { console.log(event); },
                onLoad: () => {
                    console.log('loaded');
                    setLoading(false);
                },
                onUrl: (type, url) => {
                    if (type === 'OPEN' && url) {
                        console.log(`Opening URL: ${url}`);
                        // Custom logic to open a URL
                        window.open(url, 'targetWindow', 'width=600,height=600');
                    } else if (type === 'CLOSE') {
                        console.log('Closing..');
                        // Custom logic to close
                    }
                }
            };

            const connectOptions: ConnectOptions = {
                overlay: 'rgba(199,201,199, 0.5)'
            };

            Connect.launch(connectUrl, connectEventHandlers, connectOptions);
        } catch (err) {
            console.error('Error initializing Connect SDK:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize Connect SDK');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-center">Connect to Your Account</h1>
                </header>

                {/* Error message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                        <button
                            onClick={() => router.push('/connect/search')}
                            className="mt-2 text-blue-500 hover:underline"
                        >
                            Back to search
                        </button>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && !error && (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                        <p>Connecting to your financial institution...</p>
                    </div>
                )}

                {/* Connect SDK Container */}
                <div
                    id="finicity-connect-container"
                    className="w-full min-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                ></div>
            </div>
        </div>
    );
}