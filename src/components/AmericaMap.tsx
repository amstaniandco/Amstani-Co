"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ChevronDown } from "lucide-react";

type StateFeature = {
  rsmKey: string;
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
  const [selectedState, setSelectedState] = useState<string>("");
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
    <section className="w-full rounded-3xl bg-[#1d1b14] px-6 py-8 text-slate-100 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          Amstani & Co.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-300 sm:text-base">
          Explore exclusive textiles across every state. Navigate the map to discover our premium collections.
        </p>

        <div className="mt-7 grid items-center gap-6 lg:grid-cols-[1fr_220px]">
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
                    geographies.map((geo) => {
                      const stateName = geo.properties?.NAME ?? "Unknown state";

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setHoveredState(stateName)}
                          onMouseLeave={() => setHoveredState(null)}
                          onClick={() => setSelectedState(stateName)}
                          style={{
                            default: {
                              fill: "#3fb5d0",
                              outline: "none",
                              stroke: "#3f93a8",
                              strokeWidth: 0.4,
                            },
                            hover: {
                              fill: "#63c7de",
                              outline: "none",
                              stroke: "#559fb3",
                              strokeWidth: 0.5,
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "#2c9fbc",
                              outline: "none",
                              stroke: "#559fb3",
                              strokeWidth: 0.5,
                            },
                          }}
                        />
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
                onChange={(e) => setSelectedState(e.target.value)}
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
