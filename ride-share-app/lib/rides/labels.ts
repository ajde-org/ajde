const tagKeys = {
  flexible_pickup: "tag.flexible_pickup",
  luggage_space: "tag.luggage_space",
  music: "tag.music",
  no_smoking: "tag.no_smoking",
  pets_allowed: "tag.pets_allowed",
  quiet_ride: "tag.quiet_ride",
} as const;

export function rideTagKey(tag: string) {
  return Object.hasOwn(tagKeys, tag) ? tagKeys[tag as keyof typeof tagKeys] : null;
}
