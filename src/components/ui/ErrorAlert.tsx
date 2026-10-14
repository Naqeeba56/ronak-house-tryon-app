"use client";

import { useState, type ReactNode } from "react";
import { CircleAlert, X } from "lucide-react";

export default function ErrorAlert({
  description,
  title = "Please try again",
  className = "",
  onDismiss,
  details,
}: {
  description: string;
  title?: string;
  className?: string;
  onDismiss?: () => void;
  details?: ReactNode;
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const dismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`error-alert z-50 flex w-60 items-center justify-between gap-2 rounded-lg px-[10px] py-2 text-[10px] shadow-xl sm:w-72 sm:text-xs ${className}`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="error-alert-icon shrink-0 rounded-lg p-1 backdrop-blur-xl">
          <CircleAlert className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="error-alert-title font-medium">{title}</p>
          <p className="error-alert-description break-words leading-4">{description}</p>
          {details}
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss error"
        onClick={dismiss}
        className="error-alert-dismiss shrink-0 rounded-md p-1 transition-colors ease-linear"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
