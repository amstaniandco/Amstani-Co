import type { ComponentType } from "react";
import { BriefcaseBusiness, ClipboardCheck, Store } from "lucide-react";

type GovernanceCard = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const governanceCards: GovernanceCard[] = [
  {
    title: "Diverse Brand Portfolio",
    description:
      "Amstani & Co brings together multiple textile brands, offering customers a wide variety of styles, fabrics, and design aesthetics in one place.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Curated Shopping Experience",
    description:
      "Each brand is carefully selected to ensure quality, uniqueness, and a cohesive textile experience for customers.",
    icon: ClipboardCheck,
  },
  {
    title: "Diverse Brand Portfolio",
    description:
      "Amstani & Co provides a space where both growing and well-known textile brands can showcase their collections and connect with a wider audience.",
    icon: Store,
  },
];

export default function GovernanceStandardsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f6f7f9] py-12 dark:bg-slate-900 sm:py-14">
      <div className="relative w-full px-5 sm:px-8 lg:px-12">
        <h2 className="text-center text-[20px] font-semibold tracking-tight text-[#0f172a] dark:text-slate-100 sm:text-left sm:text-[42px]">
          Governance and Standards
        </h2>

        <div className="mt-7 grid gap-5 sm:mt-9 md:grid-cols-2 xl:grid-cols-3">
          {governanceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={`${card.title}-${card.description.slice(0, 20)}`}
                className="min-h-[320px] rounded-[26px] border border-[#d9e6ec] bg-white px-6 py-8 shadow-[0_14px_35px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 sm:min-h-[350px] sm:px-8 sm:py-9"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f4f7] ring-1 ring-[#c3e5ec] dark:bg-slate-700 dark:ring-slate-600">
                  <Icon className="h-8 w-8 text-[#2f9fb3]" />
                </div>

                <h3 className="mt-5 text-center text-[24px] font-semibold leading-tight text-[#1e293b] dark:text-slate-100 sm:text-[30px]">
                  {card.title}
                </h3>

                <p className="mt-4 text-center text-base leading-relaxed text-[#64748b] dark:text-slate-300 sm:text-[18px]">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
