"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  useMapContext,
} from "react-simple-maps";
import { useTheme } from "../../../components/global/ThemeProvider";
import {
  EXCLUDED_US_MAP_REGIONS,
  getStateGeographyStyle,
  getStateLabelPosition,
  getStateLabelStyle,
  STATE_ABBREVIATIONS,
  type Position,
  type StateFeature,
} from "../../../lib/us-map-geo";

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

function StateLabel({
  coordinates,
  name,
  isHovered,
  theme,
}: {
  coordinates: Position;
  name: string;
  isHovered: boolean;
  theme: "light" | "dark";
}) {
  const { projection } = useMapContext();
  const projected = projection(coordinates);

  if (!projected || !Array.isArray(projected) || projected.length < 2) {
    return null;
  }

  const [x, y] = projected;
  const labelStyle = getStateLabelStyle(theme);

  return (
    <text
      className={`signup-map-label ${isHovered ? "signup-map-label--hovered" : ""}`}
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontWeight={700}
      fill={labelStyle.fill}
      style={{ filter: labelStyle.filter }}
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
  const { theme } = useTheme();
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
                .filter((geo) => !EXCLUDED_US_MAP_REGIONS.has(geo.properties?.NAME ?? ""))
                .map((geo) => {
                const stateName = geo.properties?.NAME ?? "Unknown state";
                const isSelected = selectedState === stateName;
                const isHovered = hoveredState === stateName;
                const stateLabel = STATE_ABBREVIATIONS[stateName] ?? stateName;
                const labelPosition = getStateLabelPosition(geo);

                return (
                  <Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      className={theme === "dark" ? `am-map-state ${isHovered ? "am-map-state--hovered" : ""}` : ""}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => onStateSelect?.(stateName)}
                      style={getStateGeographyStyle(theme, isSelected)}
                    />

                    {labelPosition ? (
                      <StateLabel coordinates={labelPosition} name={stateLabel} isHovered={isHovered} theme={theme} />
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
