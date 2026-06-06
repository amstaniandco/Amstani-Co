"use client";

import { useEffect, useRef, useState } from "react";

type AddressSelection = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type ReverseGeocodeAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

type ReverseGeocodeResponse = {
  display_name?: string;
  address?: ReverseGeocodeAddress;
};

type LeafletMap = {
  fitBounds: (bounds: [[number, number], [number, number]], options?: { padding?: [number, number] }) => LeafletMap;
  on: (event: "click", handler: (event: { latlng: { lat: number; lng: number } }) => void) => LeafletMap;
  remove: () => void;
};

type LeafletMarker = {
  setLatLng: (latlng: [number, number]) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
};

type LeafletApi = {
  map: (
    element: HTMLDivElement,
    options: {
      scrollWheelZoom: boolean;
      zoomControl: boolean;
      attributionControl: boolean;
    },
  ) => LeafletMap;
  tileLayer: (
    url: string,
    options: {
      maxZoom: number;
      attribution: string;
    },
  ) => { addTo: (map: LeafletMap) => void };
  marker: (latlng: [number, number]) => LeafletMarker;
};

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_SCRIPT_ID = "leaflet-script";
const USA_BOUNDS: [[number, number], [number, number]] = [
  [24.396308, -125],
  [49.384358, -66.93457],
];

let leafletPromise: Promise<LeafletApi> | null = null;

function loadLeaflet() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in the browser"));
  }

  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => (window.L ? resolve(window.L) : reject(new Error("Leaflet failed to load"))));
      existingScript.addEventListener("error", () => reject(new Error("Leaflet failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error("Leaflet failed to load")));
    script.onerror = () => reject(new Error("Leaflet failed to load"));
    document.body.appendChild(script);
  });

  return leafletPromise;
}

function formatStreet(address: ReverseGeocodeAddress, displayName?: string) {
  const road = address.road || address.pedestrian || address.neighbourhood || address.suburb;
  const street = [address.house_number, road].filter(Boolean).join(" ");
  return street || displayName?.split(",")[0]?.trim() || "";
}

async function reverseGeocode(lat: number, lng: number): Promise<AddressSelection> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    addressdetails: "1",
    zoom: "18",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
  if (!response.ok) throw new Error("Could not read address from map");

  const data = (await response.json()) as ReverseGeocodeResponse;
  const address = data.address ?? {};

  return {
    street: formatStreet(address, data.display_name),
    city: address.city || address.town || address.village || address.hamlet || address.county || "",
    state: address.state || "",
    zip: address.postcode || "",
    country: address.country_code?.toLowerCase() === "us" ? "USA" : address.country || "USA",
  };
}

export default function ProfileLocationMap({ onSelectAddress }: { onSelectAddress: (selection: AddressSelection) => void }) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "selecting" | "error">("loading");

  useEffect(() => {
    let active = true;
    let map: LeafletMap | null = null;

    loadLeaflet()
      .then((leaflet) => {
        if (!active || !mapElementRef.current) return;

        map = leaflet.map(mapElementRef.current, {
          scrollWheelZoom: true,
          zoomControl: true,
          attributionControl: false,
        });

        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "OpenStreetMap",
          })
          .addTo(map);

        map.fitBounds(USA_BOUNDS, { padding: [8, 8] });
        map.on("click", async ({ latlng }) => {
          if (!active || !map) return;

          markerRef.current = markerRef.current
            ? markerRef.current.setLatLng([latlng.lat, latlng.lng])
            : leaflet.marker([latlng.lat, latlng.lng]).addTo(map);

          setStatus("selecting");
          try {
            const selection = await reverseGeocode(latlng.lat, latlng.lng);
            if (active) {
              onSelectAddress(selection);
              setStatus("ready");
            }
          } catch {
            if (active) {
              onSelectAddress({ country: "USA" });
              setStatus("error");
            }
          }
        });

        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      map?.remove();
    };
  }, [onSelectAddress]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-300 dark:bg-slate-700">
      <div ref={mapElementRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-200">
          {status === "loading" && "Loading map..."}
          {status === "selecting" && "Reading selected address..."}
          {status === "error" && "Map address lookup unavailable. You can still fill the fields manually."}
        </div>
      )}
    </div>
  );
}
