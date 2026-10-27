"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

type PreviewProduct = {
  id: string;
  name: string;
  image: string | null;
  brand?: string | null;
  category?: string | null;
};

const PREVIEW_PRODUCT_NAMES = new Set(["white pearl", "deep plum coord set"]);

const productNameKey = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

export default function CatalogPreview() {
  const [products, setProducts] = useState<PreviewProduct[]>([]);
  const pathId = `cp-ring-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) =>
        setProducts(() => {
          return (data.products ?? [])
            .filter(
              (product: PreviewProduct) =>
                product.image &&
                PREVIEW_PRODUCT_NAMES.has(productNameKey(product.name)),
            )
            .slice(0, 2);
        }),
      )
      .catch(() => setProducts([]));
  }, []);

  if (!products.length) return null;

  const [first, second] = products;

  // Text for the spinning badge comes from the product itself.
  const ringLabel = `${first.brand ?? "Premium collection"} • ${first.name}`;
  const ringText = `${ringLabel} • `.repeat(
    Math.max(1, Math.ceil(36 / (ringLabel.length + 3))),
  );

  // Mouse-only parallax: layers drift slightly as the pointer moves.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    e.currentTarget.style.setProperty("--px", x.toFixed(3));
    e.currentTarget.style.setProperty("--py", y.toFixed(3));
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--px", "0");
    e.currentTarget.style.setProperty("--py", "0");
  };

  return (
    <div
      className="cp-root relative mx-auto aspect-[5/6] w-full max-w-[22rem] select-none sm:max-w-md"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--px": 0, "--py": 0 } as CSSProperties}
    >
      <style>{`
        @keyframes cp-arch { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes cp-pop { from { opacity: 0; scale: .7; } to { opacity: 1; scale: 1; } }
        @keyframes cp-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cp-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @keyframes cp-spin { to { transform: rotate(360deg); } }

        .cp-arch { animation: cp-arch 1.2s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--d, 0ms); }
        .cp-pop { animation: cp-pop .8s cubic-bezier(.2,.9,.3,1.15) both; animation-delay: var(--d, 0ms); }
        .cp-fade { animation: cp-fade 1s ease both; animation-delay: var(--d, 0ms); }
        .cp-float { animation: cp-float 7s ease-in-out infinite; }
        .cp-spin { animation: cp-spin 18s linear infinite; }
        .cp-par {
          transform: translate3d(calc(var(--px, 0) * var(--k, 0) * 1px), calc(var(--py, 0) * var(--k, 0) * 1px), 0);
          transition: transform .5s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .cp-root *, .cp-root *::before, .cp-root *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Outline arch peeking out behind the first photo */}
      <div
        className="cp-par cp-fade absolute left-[7%] top-[5%] h-[82%] w-[56%] rounded-b-[1.75rem] rounded-t-[999px] border border-[#9bd8d2]/60"
        style={{ "--k": 14, "--d": "900ms" } as CSSProperties}
      />

      {/* Tall arch photo */}
      <div
        className="cp-par absolute left-0 top-0 h-[82%] w-[56%]"
        style={{ "--k": -10 } as CSSProperties}
      >
        <div
          className="cp-arch group relative h-full w-full overflow-hidden rounded-b-[1.75rem] rounded-t-[999px] bg-[#16454b] shadow-[0_24px_50px_rgba(2,20,23,0.35)]"
          style={{ "--d": "100ms" } as CSSProperties}
        >
          <Image
            src={first.image!}
            alt={first.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
            priority
          />
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#0d3035] backdrop-blur sm:text-xs">
            {first.name}
          </span>
        </div>
      </div>

      {/* Second photo */}
      {second && (
        <div
          className="cp-par absolute bottom-0 right-0 h-[54%] w-[50%]"
          style={{ "--k": 16 } as CSSProperties}
        >
          <div className="cp-float h-full w-full">
            <div
              className="cp-pop group relative h-full w-full overflow-hidden rounded-[1.75rem] border-4 border-[#0d3035] bg-[#16454b] shadow-[0_24px_50px_rgba(2,20,23,0.4)]"
              style={{ "--d": "600ms" } as CSSProperties}
            >
              <Image
                src={second.image!}
                alt={second.name}
                fill
                sizes="(max-width: 640px) 46vw, 220px"
                className="object-cover transition duration-700 ease-out group-hover:scale-110"
              />
              <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#0d3035] backdrop-blur sm:text-xs">
                {second.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spinning text badge where the two photos meet */}
      <div
        className="cp-par absolute left-[37%] top-[34%] aspect-square w-[27%]"
        style={{ "--k": 6 } as CSSProperties}
      >
        <div
          className="cp-pop relative h-full w-full rounded-full bg-[#9bd8d2] shadow-[0_12px_30px_rgba(2,20,23,0.35)]"
          style={{ "--d": "1000ms" } as CSSProperties}
        >
          <svg
            viewBox="0 0 100 100"
            className="cp-spin absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <path
                id={pathId}
                d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
              />
            </defs>
            <text
              fontSize="10"
              fontWeight="600"
              fill="#0d3035"
              textLength="228"
              lengthAdjust="spacing"
            >
              <textPath href={`#${pathId}`}>{ringText}</textPath>
            </text>
          </svg>
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#0d3035]" />
        </div>
      </div>
    </div>
  );
}
