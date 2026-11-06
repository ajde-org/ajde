import type { ComponentProps } from "react";

import { UiIcon } from "@/components/ui-icon";
import type { RIDE_TAGS } from "@/lib/rides/ride-draft";

const features = {
  flexible_pickup: { label: "Flexible pickup", icon: "pin" },
  luggage_space: { label: "Luggage space", icon: "luggage" },
  music: { label: "Music welcome", icon: "music" },
  no_smoking: { label: "No smoking", icon: "noSmoking" },
  pets_allowed: { label: "Pets allowed", icon: "paw" },
  quiet_ride: { label: "Quiet ride", icon: "quiet" },
} satisfies Record<(typeof RIDE_TAGS)[number], {
  label: string;
  icon: ComponentProps<typeof UiIcon>["name"];
}>;

export function RideFeatures({ tags }: { tags: string[] }) {
  const selected = Object.entries(features).filter(([tag]) => tags.includes(tag));
  if (!selected.length) return <p className="text-xs leading-5 text-slate-500">No special requests</p>;

  return (
    <ul aria-label="Ride features" className="flex flex-wrap gap-x-3 gap-y-1 py-1 text-xs leading-5 text-slate-500">
      {selected.map(([tag, feature]) => (
        <li key={tag} className="flex items-center gap-1.5">
          <UiIcon name={feature.icon} size={16} className="shrink-0" />
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}
