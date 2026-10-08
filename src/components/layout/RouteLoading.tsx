import { LoaderCircle, Sparkles } from "lucide-react";

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
      className="flex min-h-[70vh] items-center justify-center px-5 py-16 text-center text-slate-100"
    >
      <div className="max-w-sm">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10">
          <Sparkles aria-hidden="true" className="h-8 w-8 text-indigo-300" />
          <LoaderCircle aria-hidden="true" className="absolute -right-1 -top-1 h-6 w-6 animate-spin text-indigo-400" />
        </div>
        <p className="mt-6 text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-400" />
        </div>
      </div>
    </section>
  );
}
