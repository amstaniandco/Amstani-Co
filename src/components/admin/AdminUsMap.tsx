"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  useMapContext,
} from "react-simple-maps";
import { EXCLUDED_US_MAP_REGIONS, getStateLabelPosition, STATE_ABBREVIATIONS, type Position, type StateFeature } from "../../lib/us-map-geo";

type StateRevenueEntry = { revenue: number; formatted: string; orderCount: number };

type AdminUsMapProps = {
  selectedState?: string;
  onStateSelect?: (state: string) => void;
  stateRevenueMap?: Record<string, StateRevenueEntry>;
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
      fontSize={14}
      fontWeight={700}
      fill="#ffffff"
      stroke="#000000"
      strokeWidth={0.6}
      paintOrder="stroke"
      pointerEvents="none"
    >
      {name}
    </text>
  );
}

export default function AdminUsMap({
  selectedState,
  onStateSelect,
  stateRevenueMap = {},
}: AdminUsMapProps = {}) {
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
    <div className="rounded-xl border border-[#d6e3e8] bg-[#39abc4] p-2 sm:p-5">
      <div className="rounded-lg border border-[#d2dde3] bg-[#e7edf1] p-2 sm:p-4">
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
                  .filter((geo) => !EXCLUDED_US_MAP_REGIONS.has(geo.properties?.NAME ?? ""))
                  .map((geo) => {
                  const stateName = geo.properties?.NAME ?? "Unknown state";
                  const isSelected = selectedState === stateName;
                  const stateLabel = STATE_ABBREVIATIONS[stateName] ?? stateName;
                  const labelPosition = getStateLabelPosition(geo);

                  return (
                    <Fragment key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        onMouseEnter={() => setHoveredState(stateName)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => onStateSelect?.(stateName)}
                        style={{
                          default: {
                            fill: isSelected ? "#2f8ea3" : "#56bfd3",
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
                        <StateLabel coordinates={labelPosition} name={stateLabel} />
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

        {/* Tooltip — shows hovered state revenue, falls back to selected state */}
        {(() => {
          const displayState = hoveredState || selectedState;
          const entry = displayState ? stateRevenueMap[displayState] : null;
          return (
            <div className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 shadow-md min-w-[160px]">
              <div>
                <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400">
                  {displayState ? "Revenue · paid orders" : "Hover or click a state"}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  {displayState || "No state selected"}
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {entry ? entry.formatted : displayState ? "$0.00" : "—"}
                </p>
                {entry && (
                  <p className="text-[10px] text-slate-400">
                    {entry.orderCount} {entry.orderCount === 1 ? "order" : "orders"}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
