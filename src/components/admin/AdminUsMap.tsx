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
      fontSize={4.5}
      fontWeight={700}
      fill="#ffffff"
      pointerEvents="none"
    >
      {name}
    </text>
  );
}

export default function AdminUsMap() {
  const [geoData, setGeoData] = useState<object | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

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
    <div className="rounded-xl border border-[#d6e3e8] bg-[#39abc4] p-3 sm:p-5">
      <div className="rounded-lg border border-[#d2dde3] bg-[#e7edf1] p-3 sm:p-4">
        {geoData ? (
          <ComposableMap
            projection="geoAlbersUsa"
            width={980}
            height={540}
            className="h-auto w-full"
          >
            <Geographies geography={geoData}>
              {({ geographies }: { geographies: StateFeature[] }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties?.NAME ?? "Unknown state";
                  const labelPosition = getStateLabelPosition(geo);

                  return (
                    <Fragment key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        onMouseEnter={() => setHoveredState(stateName)}
                        onMouseLeave={() => setHoveredState(null)}
                        style={{
                          default: {
                            fill: "#56bfd3",
                            outline: "none",
                            stroke: "#2f8ea3",
                            strokeWidth: 0.75,
                          },
                          hover: {
                            fill: "#73cfe0",
                            outline: "none",
                            stroke: "#2a8196",
                            strokeWidth: 0.9,
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#49b4ca",
                            outline: "none",
                            stroke: "#2f8ea3",
                            strokeWidth: 0.85,
                          },
                        }}
                      />

                      {labelPosition ? (
                        <StateLabel coordinates={labelPosition} name={stateName} />
                      ) : null}
                    </Fragment>
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        ) : (
          <div className="h-[230px] w-full animate-pulse rounded-lg bg-cyan-800/30 sm:h-[290px]" />
        )}

        <div className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 shadow-md">
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400">Total revenue in state</p>
            <p className="text-xs font-semibold text-slate-700">{hoveredState || "Name of the state"}</p>
            <p className="text-2xl font-extrabold text-slate-900">$450,230</p>
          </div>
        </div>
      </div>
    </div>
  );
}
