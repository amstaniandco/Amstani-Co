import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PolicySection = {
  heading: string;
  body: ReactNode;
};

type PolicyPageProps = {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  sections: PolicySection[];
};

export default function PolicyPage({
  title,
  lastUpdated,
  intro,
  sections,
}: PolicyPageProps) {
  return (
    <article>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400"
      >
        <ArrowLeft size={16} />
        <span>Back to home</span>
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
        Last updated: {lastUpdated}
      </p>

      {intro ? (
        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-slate-300">
          {intro}
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-gray-700 dark:text-slate-300">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-slate-800 dark:text-slate-400">
        Questions about this policy? Contact us at{" "}
        <a
          href="mailto:amstaniandco@gmail.com"
          className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
        >
          amstaniandco@gmail.com
        </a>
        .
      </p>
    </article>
  );
}
