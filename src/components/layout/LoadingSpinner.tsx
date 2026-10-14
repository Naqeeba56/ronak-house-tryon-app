export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="vton-spinner animate-spin origin-center" aria-hidden="true">
        <span>{label}</span>
      </div>
    </div>
  );
}
