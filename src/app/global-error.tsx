"use client";

import ErrorAlert from "@/components/ui/ErrorAlert";
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <ErrorAlert
          title="Something went wrong"
          description="The app hit an unexpected error. Please try again."
          onDismiss={reset}
        />
      </body>
    </html>
  );
}
