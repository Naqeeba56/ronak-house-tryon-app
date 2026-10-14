import LoadingSpinner from "@/components/layout/LoadingSpinner";

export default function RouteLoading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="vton-route-loading text-center text-slate-100"
    >
      <div className="max-w-sm">
        <LoadingSpinner />
        <p className="mt-6 text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </section>
  );
}
