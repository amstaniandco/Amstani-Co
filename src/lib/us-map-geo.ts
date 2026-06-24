import { geoCentroid } from "d3-geo";
import type { GeoGeometryObjects } from "d3-geo";

export type Position = [number, number];

export type StateFeature = {
  rsmKey: string;
  geometry?: GeoGeometryObjects;
  properties?: {
    NAME?: string;
  };
};

// DC and Puerto Rico aren't part of the geoAlbersUsa projection's continental
// US + Alaska/Hawaii insets, so their geometry gets misplaced if rendered
// (often overlapping the small Northeast states).
export const EXCLUDED_US_MAP_REGIONS = new Set(["District of Columbia", "Puerto Rico"]);

// d3-geo's spherical area-weighted centroid — far more reliable than a
// bounding-box center for concave/multi-part shapes (e.g. Michigan's two
// peninsulas), which can otherwise place labels outside the actual outline.
export function getStateLabelPosition(feature: StateFeature): Position | null {
  if (!feature.geometry) return null;
  const centroid = geoCentroid(feature.geometry);
  if (!centroid || centroid.some((value) => Number.isNaN(value))) return null;
  return centroid;
}

type GeographyStyle = {
  fill: string;
  outline: string;
  stroke: string;
  strokeWidth: number;
  cursor?: string;
};

type GeographyStyleSet = { default: GeographyStyle; hover: GeographyStyle; pressed: GeographyStyle };

// The neon cyan glow only reads well against a dark background, so it's used
// in dark mode; light mode falls back to the original solid-blue palette.
export function getStateGeographyStyle(theme: "light" | "dark", isSelected: boolean): GeographyStyleSet {
  if (theme === "dark") {
    return {
      default: {
        fill: isSelected ? "rgba(102, 229, 255, 0.3)" : "rgba(0, 207, 255, 0.06)",
        outline: "none",
        stroke: isSelected ? "#66E5FF" : "#00CFFF",
        strokeWidth: isSelected ? 1.4 : 1,
      },
      hover: { fill: "rgba(51, 217, 255, 0.18)", outline: "none", stroke: "#33D9FF", strokeWidth: 1.4, cursor: "pointer" },
      pressed: { fill: "rgba(102, 229, 255, 0.25)", outline: "none", stroke: "#66E5FF", strokeWidth: 1.4 },
    };
  }

  return {
    default: {
      fill: isSelected ? "#2f8ea3" : "#38aac4",
      outline: "none",
      stroke: "#68c4d8",
      strokeWidth: isSelected ? 0.85 : 0.75,
    },
    hover: { fill: "#4db8cf", outline: "none", stroke: "#79cada", strokeWidth: 0.85, cursor: "pointer" },
    pressed: { fill: "#2f8ea3", outline: "none", stroke: "#68c4d8", strokeWidth: 0.8 },
  };
}

export function getStateLabelStyle(theme: "light" | "dark"): { fill: string; filter: string } {
  if (theme === "dark") {
    return { fill: "#66E5FF", filter: "drop-shadow(0 0 3px #00CFFF)" };
  }
  return { fill: "#d7f5fb", filter: "none" };
}

export const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};
