"use client";

import { useEffect, useState, Fragment } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "/us-states.json";

export default function FormMapCard() {
  const [geoData, setGeoData] = useState<object | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((res) => res.json())
      .then(setGeoData);
  }, []);

  return (
    <div className="w-full h-[300px]">
      {geoData ? (
        <ComposableMap projection="geoAlbersUsa" className="w-full h-full">
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Fragment key={geo.rsmKey}>
                  <Geography
                    geography={geo}
                    style={{
                      default: {
                        fill: "#3fb5d0",
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: "#63c7de",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#2c9fbc",
                      },
                    }}
                  />
                </Fragment>
              ))
            }
          </Geographies>
        </ComposableMap>
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
      )}
    </div>
  );
}
