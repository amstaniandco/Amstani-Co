"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  useMapContext,
} from "react-simple-maps";

type Position = [number, number];

type StateFeature = {
  rsmKey: string;
  geometry?: {
    type?: "Polygon" | "MultiPolygon";
    coordinates?: Position[][] | Position[][][];
  };
  properties?: {
    NAME?: string;
  };
};

type SignupUsMapProps = {
  selectedState?: string;
  onStateSelect?: (state: string) => void;
};

const GEO_URL = "/us-states.json";

let geoJsonPromise: Promise<unknown> | null = null;

function loadGeoJson(): Promise<unknown> {
  if (!geoJsonPromise) {
    geoJsonPromise = fetch(GEO_URL).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load map data");
      }
      return res.json();
    });
  }

  return geoJsonPromise;
}

function ringArea(ring: Position[]): number {
  let area = 0;

  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
}

function polygonCenter(polygon: Position[][]): Position | null {
  const outerRing = polygon[0];
  if (!outerRing || outerRing.length === 0) {
    return null;
  }

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lon, lat] of outerRing) {
    if (lon < minLon) {
      minLon = lon;
    }
    if (lon > maxLon) {
      maxLon = lon;
    }
    if (lat < minLat) {
      minLat = lat;
    }
    if (lat > maxLat) {
      maxLat = lat;
    }
  }

  return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
}

function getStateLabelPosition(feature: StateFeature): Position | null {
  const geometry = feature.geometry;
  if (!geometry || !geometry.coordinates || !geometry.type) {
    return null;
  }

  if (geometry.type === "Polygon") {
    return polygonCenter(geometry.coordinates as Position[][]);
  }

  const multipolygon = geometry.coordinates as Position[][][];
  if (multipolygon.length === 0) {
    return null;
  }

  let bestPolygon: Position[][] | null = null;
  let bestArea = -1;

  for (const polygon of multipolygon) {
    const outerRing = polygon[0];
    if (!outerRing || outerRing.length === 0) {
      continue;
    }

    const area = ringArea(outerRing);
    if (area > bestArea) {
      bestArea = area;
      bestPolygon = polygon;
    }
  }

  if (!bestPolygon) {
    return null;
  }

  return polygonCenter(bestPolygon);
}

function StateLabel({
  coordinates,
  name,
}: {
  coordinates: Position;
  name: string;
}) {
  const { projection } = useMapContext();
  const projected = projection(coordinates);

  if (!projected || !Array.isArray(projected) || projected.length < 2) {
    return null;
  }

  const [x, y] = projected;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={4.6}
      fontWeight={700}
      fill="#66E5FF"
      style={{ filter: "drop-shadow(0 0 3px #00CFFF)" }}
      pointerEvents="none"
    >
      {name}
    </text>
  );
}

const STATE_ABBREVIATIONS: Record<string, string> = {
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

export default function SignupUsMap({
  selectedState,
  onStateSelect,
}: SignupUsMapProps = {}) {
  const [geoData, setGeoData] = useState<object | null>(null);

  useEffect(() => {
    let active = true;

    loadGeoJson()
      .then((data) => {
        if (active) {
          setGeoData(data as object);
        }
      })
      .catch(() => {
        if (active) {
          setGeoData(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full">
      {geoData ? (
        <ComposableMap
          projection="geoAlbersUsa"
          width={980}
          height={540}
          className="h-auto w-full"
        >
          <Geographies geography={geoData}>
            {({ geographies }: { geographies: StateFeature[] }) =>
              geographies
                .filter(
                  (geo) => geo.properties?.NAME !== "District of Columbia"
                )
                .map((geo) => {
                const stateName = geo.properties?.NAME ?? "Unknown state";
                const isSelected = selectedState === stateName;
                const stateLabel = STATE_ABBREVIATIONS[stateName] ?? stateName;
                const labelPosition = getStateLabelPosition(geo);

                return (
                  <Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      className="am-map-state"
                      onClick={() => onStateSelect?.(stateName)}
                      style={{
                        default: {
                          fill: isSelected
                            ? "rgba(102, 229, 255, 0.3)"
                            : "rgba(0, 207, 255, 0.06)",
                          outline: "none",
                          stroke: isSelected ? "#66E5FF" : "#00CFFF",
                          strokeWidth: isSelected ? 1.4 : 1,
                        },
                        hover: {
                          fill: "rgba(51, 217, 255, 0.18)",
                          outline: "none",
                          stroke: "#33D9FF",
                          strokeWidth: 1.4,
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "rgba(102, 229, 255, 0.25)",
                          outline: "none",
                          stroke: "#66E5FF",
                          strokeWidth: 1.4,
                        },
                      }}
                    />

                    {labelPosition ? (
                      <StateLabel coordinates={labelPosition} name={stateLabel} />
                    ) : null}
                  </Fragment>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      ) : (
        <div className="h-[210px] w-full animate-pulse rounded-lg bg-[#d9edf2] dark:bg-slate-800 sm:h-[250px]" />
      )}
    </div>
  );
}
