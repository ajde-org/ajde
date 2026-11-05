import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RideFeatures } from "./ride-features";
import { RIDE_TAGS } from "@/lib/rides/ride-draft";

const render = (tags: string[]) => renderToStaticMarkup(createElement(RideFeatures, { tags }));

describe("RideFeatures", () => {
  it("labels every supported ride feature with a decorative icon", () => {
    const html = render([...RIDE_TAGS]);
    for (const label of ["Flexible pickup", "Luggage space", "Music welcome", "No smoking", "Pets allowed", "Quiet ride"]) {
      expect(html).toContain(label);
    }
    expect(html.match(/<li /g)).toHaveLength(RIDE_TAGS.length);
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(RIDE_TAGS.length);
  });

  it("shows only selected features, once, without inferring missing preferences", () => {
    const html = render(["pets_allowed", "pets_allowed", "unknown_tag", "toString"]);
    expect(html).toContain("Pets allowed");
    expect(html.match(/<li /g)).toHaveLength(1);
    expect(html).not.toContain("No smoking");
    expect(html).not.toContain("unknown_tag");
  });

  it("leaves no empty row when features are absent or unrecognized", () => {
    expect(render([])).toBe("");
    expect(render(["unknown_tag"])).toBe("");
  });
});
