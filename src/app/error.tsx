"use client";

import ErrorAlert from "@/components/ui/ErrorAlert";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <ErrorAlert
        title="This page couldn't load"
        description="Something went wrong. Please try again."
        onDismiss={reset}
      />
    </main>
  );
}
