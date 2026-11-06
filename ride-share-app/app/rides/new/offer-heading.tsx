import { LocalizedPageHeading } from "@/components/localized-page-heading";

/** Page title block; shared with the route's loading state so the swap is seamless. */
export function OfferRideHeading() {
  return <LocalizedPageHeading title="offer.title" intro="offer.intro" />;
}
