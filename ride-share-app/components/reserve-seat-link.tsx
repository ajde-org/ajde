import Link from "next/link";

export function ReserveSeatLink({ href, route }: { href: string; route: string }) {
  const animationEnabled = (process.env.NEXT_PUBLIC_RIDE_CAR_ANIMATION_ENABLED ?? "true").trim().toLowerCase() === "true";
  if (!animationEnabled) {
    return (
      <Link href={href} className="flex min-h-11 flex-none items-center justify-center rounded-xl border-2 border-ink bg-ink px-4 py-2 text-center text-[.8125rem] font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700">
        Pick ride<span className="sr-only">{route}</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="group relative isolate flex min-h-11 min-w-40 flex-1 items-center overflow-hidden rounded-xl border-2 border-ink bg-ink py-2 pl-14 pr-3 text-center text-[.8125rem] font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700">
      <span className="w-full transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100">Pick ride</span>
      <span className="sr-only">{route}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-12 overflow-hidden rounded-lg bg-brand-100 transition-[width] duration-700 ease-in-out group-hover:w-full group-focus-visible:w-full motion-reduce:transition-none motion-reduce:group-hover:w-12 motion-reduce:group-focus-visible:w-12">
        <span className="absolute inset-y-0 left-0 flex w-full items-center justify-center whitespace-nowrap pr-12 text-brand-800 opacity-0 transition-opacity duration-200 group-hover:delay-200 group-hover:opacity-100 group-focus-visible:delay-200 group-focus-visible:opacity-100 motion-reduce:hidden">ajde</span>
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-brand-800 transition-[left] duration-700 ease-in-out group-hover:left-[calc(100%-3rem)] group-focus-visible:left-[calc(100%-3rem)] motion-reduce:transition-none motion-reduce:group-hover:left-0 motion-reduce:group-focus-visible:left-0">
        <svg viewBox="0 0 40 28" className="h-6 w-8" fill="none">
          <path d="M4 14 8 6a5 5 0 0 1 4-2h10a5 5 0 0 1 4 2l6 8 4 1a3 3 0 0 1 2 3v4H2v-5a3 3 0 0 1 2-3Z" fill="currentColor" />
          <path d="m9 12 3-5h5v5Zm11-5h3l4 5h-7Z" fill="var(--color-brand-100)" />
          <rect x="33" y="16" width="4" height="3" rx="1" fill="var(--color-brand-200)" />
          <circle cx="10" cy="22" r="5" fill="var(--color-ink)" />
          <circle cx="30" cy="22" r="5" fill="var(--color-ink)" />
          <circle cx="10" cy="22" r="2" fill="var(--color-brand-100)" />
          <circle cx="30" cy="22" r="2" fill="var(--color-brand-100)" />
        </svg>
      </span>
    </Link>
  );
}
