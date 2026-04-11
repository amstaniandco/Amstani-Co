"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

type StateFeature = {
  rsmKey: string;
  properties?: {
    NAME?: string;
  };
};

const GEO_URL = "/us-states.json";

export default function AmericaMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <section className="w-full">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">
        {hoveredState ?? "Hover a state"}
      </h2>

      <div className="w-full overflow-hidden rounded-xl bg-slate-900 p-2">
        <ComposableMap
          projection="geoAlbersUsa"
          width={980}
          height={580}
          className="h-auto w-full"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: StateFeature[] }) =>
              geographies.map((geo) => {
                const stateName = geo.properties?.NAME ?? "Unknown state";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => console.log(stateName)}
                    style={{
                      default: {
                        fill: "#2bb3c0",
                        outline: "none",
                        stroke: "none",
                      },
                      hover: {
                        fill: "#1a8a94",
                        outline: "none",
                        stroke: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#0f5c63",
                        outline: "none",
                        stroke: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </section>
  );
}
