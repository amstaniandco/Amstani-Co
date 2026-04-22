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
      fill="#d7f5fb"
      pointerEvents="none"
    >
      {name}
    </text>
  );
}

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
              geographies.map((geo) => {
                const stateName = geo.properties?.NAME ?? "Unknown state";
                const labelPosition = getStateLabelPosition(geo);

                return (
                  <Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={() => onStateSelect?.(stateName)}
                      style={{
                        default: {
                          fill: selectedState === stateName ? "#2f8ea3" : "#38aac4",
                          outline: "none",
                          stroke: "#68c4d8",
                          strokeWidth: 0.75,
                        },
                        hover: {
                          fill: "#4db8cf",
                          outline: "none",
                          stroke: "#79cada",
                          strokeWidth: 0.85,
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#2f8ea3",
                          outline: "none",
                          stroke: "#68c4d8",
                          strokeWidth: 0.8,
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
        <div className="h-[210px] w-full animate-pulse rounded-lg bg-[#d9edf2] dark:bg-slate-800 sm:h-[250px]" />
      )}
    </div>
  );
}
