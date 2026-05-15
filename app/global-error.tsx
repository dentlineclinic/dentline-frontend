"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-10 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Critical error
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {error.message || "A critical error occurred. Please refresh."}
            </p>
            <button
              onClick={reset}
              className="bg-teal-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
