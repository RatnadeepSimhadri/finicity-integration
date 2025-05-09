"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Extract all query parameters
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    
    setParams(allParams);
    
    // You could also handle any API calls here that need to be made
    // after the Connect flow completes (e.g., retrieving accounts)
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect Flow Completed</h1>
            <p className="text-gray-600 dark:text-gray-300">
              You have successfully completed the Finicity Connect flow.
            </p>
          </div>

          {/* Display returned parameters */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Returned Parameters</h2>
            {Object.keys(params).length > 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <dl className="divide-y divide-gray-200 dark:divide-gray-600">
                  {Object.entries(params).map(([key, value]) => (
                    <div key={key} className="py-3 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0 sm:w-40">{key}</dt>
                      <dd className="text-sm text-gray-900 dark:text-white break-all">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No parameters were returned.</p>
            )}
          </div>

          {/* Important parameters explanation */}
          <div className="mb-8 text-sm text-gray-600 dark:text-gray-300">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">What do these parameters mean?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>code:</strong> Success code from the Connect flow</li>
              <li><strong>state:</strong> The state parameter passed for security validation</li>
              <li><strong>partnerId:</strong> Your Finicity partner ID</li>
              <li><strong>customerId:</strong> The customer ID for whom accounts were connected</li>
            </ul>
          </div>

          {/* Next steps */}
          <div className="text-center">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md">
              Return to Dashboard
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              You can now use the Finicity API to access the connected accounts and their data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

