import type { CSSProperties } from "react";

const paths = {
  male: "M14 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-1.5-3.5L21 3m-7 0h7v7",
  female: "M17 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 5v9m-4-4h8",
  luggage: "M8 6V3h8v3M5 6h14v14H5ZM9 10v6m6-6v6M8 20v2m8-2v2",
  music: "M9 18V5l12-2v13M9 9l12-2M9 18a3 3 0 1 1-3-3h3m12 1a3 3 0 1 1-3-3h3",
  noSmoking: "M2 2l20 20M3 14h7m4 0h7v4h-3M6 18H3v-4m14 0v3M17 10V8c0-2-3-2-3-4V2m7 8V7c0-2-2-2-2-4",
  paw: "M8 14c-1 2-4 3-3 6s5 0 7 0 6 3 7 0-2-4-3-6c-2-3-6-3-8 0ZM9 5a2 3 0 1 1-4 0 2 3 0 0 1 4 0Zm10 0a2 3 0 1 1-4 0 2 3 0 0 1 4 0ZM5 11a2 2.5 0 1 1-4 0 2 2.5 0 0 1 4 0Zm18 0a2 2.5 0 1 1-4 0 2 2.5 0 0 1 4 0Z",
  quiet: "m11 5-6 4H2v6h3l6 4V5Zm6 4 5 6m0-6-5 6",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  calendar: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 11h18",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  shield: "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Zm-4 9 3 3 5-5",
  leaf: "M20 3c-8-1-16 2-16 9a7 7 0 0 0 7 7c7 0 10-8 9-16ZM3 22 15 10",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3.87a4 4 0 0 1 0 7.75",
  city: "M3 21h18M5 21V7h8v14m0-10h6v10M8 10h2m-2 4h2m-2 4h2m6-4h1m-1 4h1M8 7V3h4v4",
  mountain: "m2 20 7-14 5 9 3-6 5 11H2Zm4-8 3 2 3-2",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
} as const;

export function UiIcon({ name, size = 20, className, style }: { name: keyof typeof paths; size?: number; className?: string; style?: CSSProperties }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d={paths[name]} /></svg>;
}
