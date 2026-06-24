"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  useMapContext,
} from "react-simple-maps";
import { ChevronDown } from "lucide-react";
import { useToast } from "./global/ToastProvider";
import { getSelectedState, setSelectedState as publishSelectedState, subscribeSelectedState } from "../lib/state-preference";
import { EXCLUDED_US_MAP_REGIONS, getStateLabelPosition, STATE_ABBREVIATIONS, type Position, type StateFeature } from "../lib/us-map-geo";

function hasActiveSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith("token="));
}

function StateLabel({
  coordinates,
  name,
  isHovered,
}: {
  coordinates: Position;
  name: string;
  isHovered: boolean;
}) {
  const { projection } = useMapContext();
  const projected = projection(coordinates);

  if (!projected || !Array.isArray(projected) || projected.length < 2) {
    return null;
  }

  const [x, y] = projected;

  return (
    <text
      className={`am-map-label ${isHovered ? "am-map-label--hovered" : ""}`}
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontWeight={700}
      fill="#66E5FF"
      style={{ filter: "drop-shadow(0 0 3px #00CFFF)" }}
      pointerEvents="none"
    >
      {name}
    </text>
  );
}

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

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function AmericaMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedStateLocal] = useState<string>("");
  const [geoData, setGeoData] = useState<object | null>(null);
  const toast = useToast();
  const router = useRouter();

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

  // Initialise from shared preference and keep in sync when navbar changes it
  useEffect(() => {
    setSelectedStateLocal(getSelectedState());
    return subscribeSelectedState((s) => setSelectedStateLocal(s));
  }, []);

  const handleExplore = () => {
    if (!hasActiveSession()) {
      toast.error("Please log in to explore stores by state.");
      router.push("/login");
      return;
    }

    if (!selectedState) {
      toast.error("Select a state first.");
      return;
    }

    publishSelectedState(selectedState);
    toast.success(`Showing stores in ${selectedState}.`);
  };

  return (
    <section data-tutorial-id="customer-america-map" className="mx-auto w-full max-w-[1500px] rounded-3xl bg-[#1d1b14] px-6 py-8 text-slate-100 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/assets/amstaniLogo.png"
            alt="Amstani & Co"
            width={56}
            height={56}
            className="h-10 w-10 object-contain sm:h-14 sm:w-14"
          />
          <h2 className="text-center text-2xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
            Amstani & Co.
          </h2>
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-300 sm:text-base">
          Explore exclusive textiles across your state. Navigate the map to discover our premium collections.
        </p>

        <div className="mt-7 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_220px]">
          <div className="w-full">
            {geoData ? (
              <ComposableMap
                projection="geoAlbersUsa"
                width={980}
                height={560}
                className="h-auto w-full"
              >
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: StateFeature[] }) =>
                    geographies
                      .filter(
                        (geo) => !EXCLUDED_US_MAP_REGIONS.has(geo.properties?.NAME ?? "")
                      )
                      .map((geo) => {
                      const stateName = geo.properties?.NAME ?? "Unknown state";
                      const isHovered = hoveredState === stateName;
                      const stateLabel = STATE_ABBREVIATIONS[stateName] ?? stateName;
                      const labelPosition = getStateLabelPosition(geo);

                      return (
                        <Fragment key={geo.rsmKey}>
                          <Geography
                            geography={geo}
                            className={`am-map-state ${isHovered ? "am-map-state--hovered" : ""}`}
                            onMouseEnter={() => setHoveredState(stateName)}
                            onMouseLeave={() => setHoveredState(null)}
                            onClick={() => setSelectedStateLocal(stateName)}
                            style={{
                              default: {
                                fill: "rgba(0, 207, 255, 0.06)",
                                outline: "none",
                                stroke: "#00CFFF",
                                strokeWidth: 1,
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

                          {labelPosition && (
                            <StateLabel coordinates={labelPosition} name={stateLabel} isHovered={isHovered} />
                          )}
                        </Fragment>
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            ) : (
              <div className="h-[330px] w-full animate-pulse rounded-xl bg-slate-800/50 sm:h-[420px]" />
            )}
          </div>

          <div className="flex flex-col gap-3 self-center lg:pl-2">
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedStateLocal(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-600 bg-[#25231c] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-[#79d0de]"
              >
                <option value="">Select Your State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleExplore}
              className="rounded-lg bg-[#75c8d4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#68bdc9]"
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {selectedState || hoveredState || "Select or hover a state to explore regional collections."}
      </p>
    </section>
  );
}
