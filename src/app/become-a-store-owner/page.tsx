import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Package, Store, Truck, Users } from "lucide-react";
import Footer from "../../components/pages/Footer";

export const metadata: Metadata = {
  title: "Become a Store Owner — Amstani & Co",
  description:
    "Build your own online Pakistani clothing store with Amstani & Co.",
};

const benefits = [
  [
    Store,
    "Your own store",
    "A ready-built storefront and e-commerce foundation for your business.",
  ],
  [
    Package,
    "Curated catalog",
    "Discover Pakistani clothing from selected brands and suppliers.",
  ],
  [
    Users,
    "Wholesale access",
    "Order products through Amstani & Co starting from the applicable minimum.",
  ],
  [
    Truck,
    "Shipping support",
    "Products are sourced and shipped from Pakistan under the shipping terms.",
  ],
  [
    Check,
    "Inventory protection",
    "Eligible inventory may qualify under the stated buyback and return policy.",
  ],
  [
    Users,
    "Promotional collaboration",
    "Amstani & Co may collaborate with store owners on promotional content.",
  ],
] as const;

const steps = [
  ["01", "Apply", "Tell us about yourself and the store you want to operate."],
  [
    "02",
    "Get approved",
    "Applications are reviewed before your store is activated.",
  ],
  ["03", "Launch", "Get access to your online store and product catalog."],
  [
    "04",
    "Choose products",
    "Select products from the available Pakistani catalog.",
  ],
  ["05", "Order wholesale", "Build your order from the applicable minimum."],
  [
    "06",
    "Grow",
    "Market your store, serve customers, and build your business.",
  ],
] as const;

const providedByAmstani = [
  "Online store infrastructure",
  "Curated Pakistani catalog",
  "Wholesale product sourcing",
  "Fulfillment under applicable terms",
  "Inventory protection policy",
  "Technical store maintenance",
];
const managedByOwner = [
  "Your customers",
  "Marketing and social media",
  "Customer service",
  "Store operations",
  "Sales strategy and growth",
];

const whoFor = [
  "You want to operate an online clothing store in the U.S.",
  "You are interested in Pakistani fashion.",
  "You want wholesale access without building a supplier network from scratch.",
  "You are willing to market your store and build your own customers.",
  "You want to operate your own online business.",
  "You are comfortable starting with the required wholesale order.",
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#56aebb]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
        {title}
      </h2>

      {children && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
          {children}
        </p>
      )}
    </div>
  );
}
export default function BecomeAStoreOwnerPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f8f8] text-slate-900 dark:bg-[#07191d] dark:text-slate-100">
      <header className="border-b border-[#24545a] bg-[#0d3035] px-5 py-4 text-white shadow-[0_4px_20px_rgba(7,48,53,0.18)] dark:border-[#24545a] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]"
          >
            <Image
              src="/assets/amstaniLogo.png"
              alt="Amstani & Co"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span>
              Amstani{" "}
              <span className="font-normal text-[#b9e8e5]">&amp; Co</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold sm:gap-8">
            <a
              href="#how-it-works"
              className="text-[#c1dedd] transition hover:text-white"
            >
              How It Works
            </a>
            <Link
              href="/apply/store-owner"
              className="rounded-xl bg-[#8bd3cf] px-4 py-2 text-[#0d3035] shadow-[0_6px_18px_rgba(139,211,207,0.2)] transition hover:bg-white"
            >
              Apply
            </Link>
          </nav>
        </div>
      </header>
      <main className="overflow-hidden">
        <section className="relative bg-[#0d3035] px-5 py-8 text-white shadow-[inset_0_-1px_0_rgba(139,211,207,0.16)] sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(139,211,207,0.22),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-20">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#8bd3cf]">
                For store owners
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Start your own online American clothing store.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Your store. Our curated catalog. The infrastructure and
                wholesale connection to build your own online clothing business
                in the U.S.
              </p>
              <Link
                href="/apply/store-owner"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#8bd3cf] px-6 text-sm font-semibold text-[#0d3035] shadow-[0_12px_28px_rgba(139,211,207,0.2)] transition hover:bg-white"
              >
                Apply to become a store owner <ArrowRight size={17} />
              </Link>

              <p className="mt-4 rounded-xl bg-[#e3f5f3] px-4 py-3 text-sm font-medium text-[#187d86] dark:bg-[#173f44] dark:text-[#8ed9d5]">
                Limited-time offer: store access fee waived for the first 20
                qualifying store owners.
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#8bd3cf]/35 bg-[#16454b] p-3 shadow-[0_24px_70px_rgba(2,20,23,0.38)]">
              <div className="rounded-2xl bg-white p-3 text-slate-800 shadow-[0_8px_25px_rgba(5,34,38,0.16)]">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <span className="h-2 w-2 rounded-full bg-[#ef8b7b]" />
                  <span className="h-2 w-2 rounded-full bg-[#e8c36a]" />
                  <span className="h-2 w-2 rounded-full bg-[#70b9a5]" />
                  <span className="ml-3 h-2 w-28 rounded-full bg-slate-100" />
                </div>
                <div className="relative mt-3 aspect-[1.45] overflow-hidden rounded-xl">
                  <Image
                    src="/assets/AmstaniCover.png"
                    alt="Amstani store preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <div className="h-2 rounded bg-slate-100" />
                  <div className="h-2 rounded bg-slate-100" />
                  <div className="h-2 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d5e6e5] bg-white px-5 py-7 shadow-[0_8px_24px_rgba(13,48,53,0.05)] dark:border-[#21474c] dark:bg-[#0e292e] sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[#c8e5e3] bg-[#effafa] px-5 py-4 text-sm font-semibold text-[#267f8c] shadow-sm dark:border-[#28565b] dark:bg-[#14383d]">
              <Store size={21} /> Your own store
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#c8e5e3] bg-[#effafa] px-5 py-4 text-sm font-semibold text-[#267f8c] shadow-sm dark:border-[#28565b] dark:bg-[#14383d]">
              <Package size={21} /> Curated Pakistani fashion
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#c8e5e3] bg-[#effafa] px-5 py-4 text-sm font-semibold text-[#267f8c] shadow-sm dark:border-[#28565b] dark:bg-[#14383d]">
              <Truck size={21} /> Wholesale fulfillment
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#c8e5e3] bg-[#effafa] px-5 py-4 text-sm font-semibold text-[#267f8c] shadow-sm dark:border-[#28565b] dark:bg-[#14383d]">
              <Users size={21} /> Built for U.S. owners
            </div>
          </div>
        </section>

        <section className="px-5 py-8 text-center sm:px-8 sm:py-10 md:text-left lg:px-12">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="What is Amstani & Co?"
              title="A simpler way to start an online clothing business."
            >
              <div className="text-justify sm:text-left">
                Amstani &amp; Co connects U.S. store owners with a curated
                wholesale catalog of Pakistani clothing. You get the
                infrastructure and product connection while you focus on
                building customers and growing your business.
              </div>
            </SectionHeading>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {[
                "Pakistani brands & vendors",
                "Amstani & Co",
                "Your online store",
                "Your customers",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex min-h-24 flex-1 items-center justify-center rounded-2xl border border-[#d4e4e3] bg-white px-4 text-center font-semibold shadow-[0_8px_24px_rgba(13,48,53,0.06)] dark:border-[#28565b] dark:bg-[#0e292e]">
                    {item}
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden shrink-0 text-[#4daeb3] md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-[#edf5f4] px-5 py-8 dark:bg-[#0b2227] sm:px-8 sm:py-10 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="How it works"
                title="A clear path from application to launch."
              />
            </div>
            <div className="mt-5 grid overflow-hidden rounded-3xl border border-[#cfe1df] bg-white shadow-[0_18px_45px_rgba(13,48,53,0.07)] sm:grid-cols-2 lg:grid-cols-3 dark:border-[#28565b] dark:bg-[#0e292e]">
              {steps.map(([number, title, text]) => (
                <div
                  key={number}
                  className="border-b border-[#d9e8e7] p-7 last:border-b-0 sm:nth-[2n]:border-r-0 lg:nth-[3n]:border-r-0 dark:border-[#28565b]"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold tracking-widest text-[#4daeb3]">
                      {number}
                    </div>

                    <h3 className="text-xl font-semibold">{title}</h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="What you get"
                title="Everything you need to get started."
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(([Icon, title, text]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-[#d4e4e3] bg-white p-6 shadow-[0_12px_30px_rgba(13,48,53,0.07)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(13,48,53,0.12)] dark:border-[#28565b] dark:bg-[#0e292e]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3f5f3] text-[#2f9fb3] dark:bg-[#173f44]">
                      <Icon size={20} />
                    </div>

                    <h3 className="text-lg font-semibold">{title}</h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#e7f1ef] px-5 py-8 dark:bg-[#0b2227] sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center text-sm sm:text-base sm:text-left">
              <SectionHeading
                eyebrow="Clear responsibilities"
                title="You build the business. We provide the infrastructure."
              />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-[#0d3035] p-7 text-white shadow-[0_18px_40px_rgba(13,48,53,0.18)] sm:p-10">
                <h3 className="text-2xl font-bold">
                  Amstani &amp; Co provides
                </h3>
                <ul className="mt-7 grid gap-3">
                  {providedByAmstani.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#8bd3cf]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[#d4e4e3] bg-white p-7 shadow-[0_12px_30px_rgba(13,48,53,0.06)] sm:p-10 dark:border-[#28565b] dark:bg-[#0e292e]">
                <h3 className="text-2xl font-bold">You manage</h3>
                <ul className="mt-7 grid gap-3">
                  {managedByOwner.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                    >
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#4daeb3]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="apply"
          className="bg-[#0d3035] px-5 py-8 text-center text-white shadow-[inset_0_1px_0_rgba(139,211,207,0.14),inset_0_-1px_0_rgba(139,211,207,0.14)] sm:px-8 sm:py-10 lg:px-12"
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8bd3cf]">
              Limited first group
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-6xl">
              First 20 store owners.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#c1dedd]">
              Your store access fee is currently waived for the first 20
              qualifying and approved store owners.
            </p>
            <div className="my-10 grid gap-3 sm:grid-cols-3">
              {[
                ["$0", "Store access fee"],
                ["$300", "Minimum wholesale order"],
                ["$15", "Technical maintenance / month"],
              ].map(([price, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#8bd3cf]/25 bg-[#16454b] px-4 py-6 shadow-[0_10px_24px_rgba(2,20,23,0.18)]"
                >
                  <strong className="block text-3xl font-bold text-[#8bd3cf]">
                    {price}
                  </strong>
                  <span className="mt-1 block text-[10px] uppercase tracking-widest text-[#a6c8c7]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/apply/store-owner"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#8bd3cf] px-7 text-sm font-semibold text-[#0d3035] shadow-[0_12px_28px_rgba(139,211,207,0.2)] transition hover:bg-white"
            >
              Apply for a store <ArrowRight size={17} />
            </Link>
            <p className="mt-6 text-xs leading-5 text-[#8eacab]">
              *Offer is limited to the first 20 approved and qualifying store
              owners. Wholesale purchase requirements and monthly maintenance
              fees apply. See applicable terms for eligibility and conditions.
            </p>
          </div>
        </section>

        <section className="bg-white px-5 py-8 dark:bg-[#0e292e] sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="Wholesale + shipping"
                title="Start with a $300 minimum wholesale order."
              >
                <div className="text-justify sm:text-left">
                  Choose products, build your wholesale order, and receive
                  shipment to your U.S. destination under the applicable
                  shipping terms.
                </div>
              </SectionHeading>
            </div>
            <div className="mt-5 grid items-center gap-3 sm:grid-cols-5">
              {[
                "Choose products",
                "Build your order",
                "$300 minimum",
                "Order processed",
                "U.S. shipment",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex min-h-20 flex-1 items-center justify-center rounded-2xl border border-[#d4e4e3] bg-[#f1f8f7] px-4 text-center text-sm font-semibold shadow-sm dark:border-[#28565b] dark:bg-[#14383d]">
                    {item}
                  </div>
                  {index < 4 && (
                    <ArrowRight className="hidden shrink-0 text-[#4daeb3] sm:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Shipping, customs, duties, taxes, import charges, eligible
              destinations, and exclusions are subject to the applicable final
              terms.
            </p>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
            {/* Inventory Protection */}
            <article className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <Check className="mt-1 shrink-0 text-[#56aebb]" />

                <h2 className="text-[1.2rem] font-bold sm:text-2xl">
                  Don&apos;t want to keep unsold inventory?
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Eligible inventory may be returned after 6 months from purchase
                under the inventory protection policy.
              </p>

              <div className="mt-7 rounded-2xl bg-[#e8f6f7] p-5">
                <strong className="text-3xl text-[#267f8c]">90% refund</strong>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Transportation and applicable return costs are the store
                  owner&apos;s responsibility.
                </p>
              </div>
            </article>

            {/* Damaged Product Protection */}
            <article className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <Package className="mt-1 shrink-0 text-[#56aebb]" />

                <h2 className="text-[1.2rem] font-bold sm:text-2xl">
                  Arrives damaged or imperfect?
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Eligible products that arrive damaged or not in perfect
                condition may qualify for a product refund under the applicable
                return terms.
              </p>

              <div className="mt-7 rounded-2xl bg-[#e8f6f7] p-5">
                <strong className="text-3xl text-[#267f8c]">
                  100% product refund
                </strong>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Transportation is handled by Amstani &amp; Co according to the
                  applicable terms.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="bg-[#e7f1ef] px-5 py-8 dark:bg-[#0b2227] sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto grid max-w-7xl items-center gap-2 lg:grid-cols-2">
            <div>
              <div className="text-center sm:text-left">
                <SectionHeading
                  eyebrow="Monthly maintenance"
                  title="Your store stays technically maintained."
                >
                  <div className="text-justify sm:text-left">
                    Your Amstani &amp; Co store infrastructure is maintained for
                    a simple monthly fee.
                  </div>
                </SectionHeading>
              </div>
            </div>
            <p className="mt-2 text-5xl font-bold text-[#267f8c] text-center">
              $15
              <span className="text-xl font-semibold text-slate-500">
                /month
              </span>
            </p>
          </div>
        </section>

        <section className="bg-[#dff0ee] px-5 py-5 dark:bg-[#0b2227] sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Who is this for?"
                title="Amstani & Co may be JUST right for you."
              >
                <div className="text-justify sm:text-left">
                  This is your business to build. Your success depends on how
                  you operate, market, and grow your store.
                </div>
              </SectionHeading>
              <ul className="mt-8 grid gap-3">
                {whoFor.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#267f8c]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/apply/store-owner"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#4daeb3] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(77,174,179,0.18)] transition hover:bg-[#328e95]"
              >
                Start your application <ArrowRight size={17} />
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-[0_20px_45px_rgba(13,48,53,0.18)]">
              <Image
                src="/assets/poster.png"
                alt="Pakistani fashion product showcase"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-5 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="See the store"
                title="A storefront designed for discovery."
              />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#d4e4e3] bg-white p-3 shadow-[0_12px_30px_rgba(13,48,53,0.07)] dark:border-[#28565b] dark:bg-[#0e292e]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/AmstaniCover.png"
                    alt="Desktop storefront preview"
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
                <p className="px-3 py-4 text-sm font-semibold">
                  Desktop storefront
                </p>
              </div>
              <div className="rounded-3xl border border-[#d4e4e3] bg-white p-3 shadow-[0_12px_30px_rgba(13,48,53,0.07)] dark:border-[#28565b] dark:bg-[#0e292e]">
                <div className="mx-auto relative aspect-[9/14] max-w-[180px] overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/poster.png"
                    alt="Mobile storefront preview"
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <p className="px-3 py-4 text-sm font-semibold">
                  Mobile shopping
                </p>
              </div>
              <div className="rounded-3xl border border-[#d4e4e3] bg-white p-3 shadow-[0_12px_30px_rgba(13,48,53,0.07)] dark:border-[#28565b] dark:bg-[#0e292e]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#0d3035] p-6">
                  <div className="h-full rounded-xl bg-white p-4">
                    <div className="h-2 w-1/2 rounded bg-[#dceff1]" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="h-24 rounded-lg bg-[#e8f1ef]" />
                      <div className="h-24 rounded-lg bg-[#dceff1]" />
                    </div>
                  </div>
                </div>
                <p className="px-3 py-4 text-sm font-semibold">Product page</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-5 dark:bg-slate-900 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="Why Amstani & Co?"
                title="Why store owners choose Amstani & Co."
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Pakistani fashion",
                  "Access a curated range of Pakistani clothing.",
                ],
                [
                  "Simplified setup",
                  "Start with established infrastructure instead of building from zero.",
                ],
                [
                  "Wholesale connection",
                  "One platform connecting store owners with selected suppliers.",
                ],
                [
                  "Built to grow",
                  "Operate your store, develop customers, and expand selection over time.",
                ],
              ].map(([title, text]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div className="text-center sm:text-left">
              <SectionHeading
                eyebrow="Trust and connection"
                title="Built around a Pakistan-U.S. connection."
              >
                <div className="text-justify sm:text-left">
                  Amstani &amp; Co was created to connect Pakistani fashion
                  suppliers with entrepreneurs building online clothing
                  businesses in the United States.
                </div>
              </SectionHeading>
            </div>
            <div className="rounded-3xl bg-[#0d3035] px-4 py-5 text-white shadow-[0_20px_45px_rgba(13,48,53,0.2)] sm:p-10">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#8bd3cf] sm:text-left sm:text-xs">
                Pakistan → Amstani &amp; Co → United States
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold sm:text-2xl">Pakistan</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#a6c8c7] sm:text-sm sm:leading-normal">
                    Brands and sourcing
                  </p>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold text-[#8bd3cf] sm:text-2xl">
                    Amstani
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-[#a6c8c7] sm:text-sm sm:leading-normal">
                    Stores, Catalog, infrastructure
                  </p>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold sm:text-2xl">U.S.</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#a6c8c7] sm:text-sm sm:leading-normal">
                    Owners and customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0f2026] px-5 py-8 text-center text-white sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7fd3df]">
              Ready to build your store?
            </p>
            <h2 className="mt-4 text-4xl font-bold sm:text-6xl">
              Ready to build your own American clothing store?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300">
              Join the first group of Amstani &amp; Co store owners and get
              started with the limited first-20-store offer.
            </p>
            <Link
              href="/apply/store-owner"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#56aebb] px-7 text-sm font-semibold text-white transition hover:bg-[#489fad]"
            >
              Apply to become a store owner <ArrowRight size={17} />
            </Link>
            <p className="mt-5 text-xs text-slate-400">
              Applications are reviewed individually. Approval is required.
            </p>
            <p className="mt-8 text-sm text-slate-400">
              Questions? Contact support through the Amstani &amp; Co contact
              page.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
