"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { US_STATES } from "../../../lib/us-states";

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  preferred_contact_method: string;
  state: string;
  business_status: string;
  online_selling_experience: string;
  platforms_used: string[];
  platforms_other: string;
  interest_reasons: string[];
  interest_other: string;
  target_customers: string[];
  target_other: string;
  weekly_time_commitment: string;
  planned_start_date: string;
  minimum_order_acknowledgment: string;
  readiness_level: string;
  applicant_questions: string;
  contact_consent: boolean;
  privacy_acknowledgment: boolean;
};

const initialForm: FormData = {
  full_name: "",
  email: "",
  phone: "",
  preferred_contact_method: "",
  state: "",
  business_status: "",
  online_selling_experience: "",
  platforms_used: [],
  platforms_other: "",
  interest_reasons: [],
  interest_other: "",
  target_customers: [],
  target_other: "",
  weekly_time_commitment: "",
  planned_start_date: "",
  minimum_order_acknowledgment: "",
  readiness_level: "",
  applicant_questions: "",
  contact_consent: false,
  privacy_acknowledgment: false,
};

const stateOptions = [
  ...US_STATES,
  "District of Columbia",
  "Other / Not currently in the U.S.",
];
const platformOptions = [
  "My own website",
  "Shopify",
  "Etsy",
  "Amazon",
  "eBay",
  "Facebook",
  "Instagram",
  "TikTok Shop",
  "Other",
  "I have not used an online selling platform",
];
const interestOptions = [
  "I want to start an online clothing business.",
  "I want to expand an existing business.",
  "I want to work from home.",
  "I am interested in selling Pakistani clothing.",
  "I want to develop an additional source of business income.",
  "I am exploring business opportunities.",
  "Other",
];
const customerOptions = [
  "General U.S. customers",
  "Pakistani or South Asian customers in the U.S.",
  "Local customers in my area",
  "Friends and family",
  "Online customers across multiple states",
  "I am not sure yet",
  "Other",
];

const radioGroups: Record<
  number,
  { key: keyof FormData; label: string; options: string[] }[]
> = {
  1: [
    {
      key: "preferred_contact_method",
      label: "Preferred contact method",
      options: ["Email", "Phone call", "Text message"],
    },
  ],
  2: [
    {
      key: "business_status",
      label: "Do you currently operate a business?",
      options: [
        "Yes, I currently operate a business.",
        "No, but I am planning to start one.",
        "No, I am exploring business opportunities.",
      ],
    },
    {
      key: "online_selling_experience",
      label: "Have you previously sold products online?",
      options: [
        "Yes, I currently sell online.",
        "Yes, but I am no longer selling online.",
        "No, this would be my first online business.",
      ],
    },
  ],
  3: [
    {
      key: "weekly_time_commitment",
      label: "How much time do you expect to dedicate to operating your store?",
      options: [
        "Less than 5 hours per week",
        "5–10 hours per week",
        "11–20 hours per week",
        "More than 20 hours per week",
        "I am not sure yet",
      ],
    },
    {
      key: "planned_start_date",
      label: "When would you ideally like to start?",
      options: [
        "As soon as possible",
        "Within 30 days",
        "Within 1–3 months",
        "Within 3–6 months",
        "More than 6 months from now",
        "I am only exploring at this stage",
      ],
    },
  ],
  4: [
    {
      key: "minimum_order_acknowledgment",
      label:
        "Are you aware that the minimum wholesale order is currently stated as $300?",
      options: [
        "Yes, I understand.",
        "I understand, but I have questions about the requirement.",
        "I would like to review the full terms before deciding.",
      ],
    },
    {
      key: "readiness_level",
      label: "Which statement best describes your current readiness?",
      options: [
        "I am ready to discuss the next steps.",
        "I need more information before making a decision.",
        "I am interested but need to plan my budget.",
        "I am only researching opportunities at this time.",
      ],
    },
  ],
};

function FieldLabel({
  children,
  required = true,
  number,
}: {
  children: React.ReactNode;
  required?: boolean;
  number?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {number && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff3f1] text-xs font-bold text-[#267f8c] shadow-sm dark:bg-[#173f44] dark:text-[#8bd3cf]">
          {number}
        </span>
      )}
      {children}
      {required && <span className="ml-1 text-[#2f9fa5]">*</span>}
    </span>
  );
}

function CheckboxGroup({
  label,
  number,
  options,
  selected,
  onChange,
}: {
  label: string;
  number: number;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset>
      <legend>
        <FieldLabel number={number}>{label}</FieldLabel>
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d5e3e4] bg-[#fbfefe] px-4 py-3 text-sm text-slate-700 shadow-[0_3px_10px_rgba(13,48,53,0.025)] transition hover:-translate-y-0.5 hover:border-[#55aeb4] hover:shadow-[0_8px_18px_rgba(13,48,53,0.08)] dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option),
                )
              }
              className="mt-0.5 accent-[#2f9fa5]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function StoreOwnerApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof FormData, value: string | boolean | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const handleInput = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => update(event.target.name as keyof FormData, event.target.value);

  const validateStep = () => {
    if (
      step === 1 &&
      (!form.full_name.trim() ||
        form.full_name.trim().length < 2 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
        !form.phone.trim() ||
        !form.preferred_contact_method)
    )
      return "Please complete all required personal information fields.";
    if (
      step === 2 &&
      (!form.state ||
        !form.business_status ||
        !form.online_selling_experience ||
        !form.platforms_used.length)
    )
      return "Please complete your location and business background.";
    if (
      step === 3 &&
      (!form.interest_reasons.length ||
        !form.target_customers.length ||
        !form.weekly_time_commitment ||
        !form.planned_start_date)
    )
      return "Please complete your store plans.";
    if (
      step === 4 &&
      (!form.minimum_order_acknowledgment || !form.readiness_level)
    )
      return "Please answer the required readiness questions.";
    if (step === 5 && (!form.contact_consent || !form.privacy_acknowledgment))
      return "Please agree to both required consent statements.";
    return "";
  };

  const scrollToStepTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(5, current + 1));
    scrollToStepTop();
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
    scrollToStepTop();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = validateStep();
    if (message || submitting) {
      setError(message);
      return;
    }
    setSubmitting(true);
    try {
      const utm = Object.fromEntries(
        new URLSearchParams(window.location.search).entries(),
      );
      const response = await fetch("/api/store-owner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, utm }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not submit application.");
      router.push("/application-submitted");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not submit application.",
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f8f8] px-0 py-0 text-slate-900 dark:bg-[#07191d] dark:text-slate-100">
      <div className="w-full">
        <div className="border-b border-[#d5e6e5] bg-white px-5 py-5 dark:border-[#28565b] dark:bg-[#0b2227] sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
            <Link
              href="/become-a-store-owner"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#267f8c] hover:text-[#0d666d] dark:text-[#8bd3cf]"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <span className="rounded-full border border-[#cfe1df] bg-[#effafa] px-3 py-1 text-xs font-semibold text-[#267f8c] dark:border-[#28565b] dark:bg-[#14383d] dark:text-[#c1dedd]">
              3–5 minutes
            </span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-10 sm:py-12 lg:px-16">
          <div className="mb-8 rounded-3xl bg-[#0d3035] px-6 py-8 text-white shadow-[0_18px_45px_rgba(13,48,53,0.14)] sm:px-10 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8bd3cf]">
                Amstani &amp; Co store-owner application
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl text-center lg:text-left ">
                Become a Store Owner
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c7e9e7] text-justify lg:text-left ">
                Tell us about yourself, your business interests, and your plans
                for operating an online clothing store in the United States.
                Submission does not guarantee acceptance or store approval.
              </p>
            </div>
            <span className="mt-6 shrink-0 text-sm font-semibold text-[#c7e9e7] lg:mt-0">
              Step {step}/5
            </span>
          </div>
          <div className="mb-8 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`h-2 rounded-full ${item <= step ? "bg-[#2f9fa5]" : "bg-[#cfe0e1] dark:bg-[#1d4247]"}`}
              />
            ))}
          </div>
          <form
            onSubmit={submit}
            className="min-h-[560px] w-full rounded-3xl border border-[#d3e3e3] bg-white p-5 shadow-[0_20px_50px_rgba(13,48,53,0.08)] dark:border-[#28565b] dark:bg-[#0e292e] sm:p-8 lg:p-12"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your Information</h2>
                <label className="block">
                  <FieldLabel number={1}>Full name</FieldLabel>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInput}
                    placeholder="Enter your full legal name"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                </label>
                <label className="block">
                  <FieldLabel number={2}>Email address</FieldLabel>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInput}
                    placeholder="you@example.com"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                </label>
                <label className="block">
                  <FieldLabel number={3}>Phone number</FieldLabel>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInput}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                </label>
                <div className="space-y-3">
                  <FieldLabel number={4}>Preferred contact method</FieldLabel>
                  {radioGroups[1][0].options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="preferred_contact_method"
                        value={option}
                        checked={form.preferred_contact_method === option}
                        onChange={handleInput}
                        className="accent-[#2f9fa5]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Location and Background</h2>
                <label className="block">
                  <FieldLabel number={5}>
                    Which U.S. state do you currently live in?
                  </FieldLabel>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleInput}
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  >
                    <option value="">Select a state</option>
                    {stateOptions.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </label>
                {radioGroups[2].map((group) => (
                  <div key={String(group.key)} className="space-y-3">
                    <FieldLabel
                      number={group.key === "business_status" ? 6 : 7}
                    >
                      {group.label}
                    </FieldLabel>
                    {group.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 rounded-xl border border-[#d5e3e4] bg-[#fbfefe] px-4 py-3 text-sm text-slate-700 shadow-[0_3px_10px_rgba(13,48,53,0.025)] transition hover:-translate-y-0.5 hover:border-[#55aeb4] hover:shadow-[0_8px_18px_rgba(13,48,53,0.08)] dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                      >
                        <input
                          type="radio"
                          name={String(group.key)}
                          value={option}
                          checked={form[group.key] === option}
                          onChange={handleInput}
                          className="mt-0.5 accent-[#2f9fa5]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <CheckboxGroup
                  number={8}
                  label="Which online selling platforms have you used?"
                  options={platformOptions}
                  selected={form.platforms_used}
                  onChange={(value) => update("platforms_used", value)}
                />
                {form.platforms_used.includes("Other") && (
                  <input
                    name="platforms_other"
                    value={form.platforms_other}
                    onChange={handleInput}
                    placeholder="Tell us about the platform"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                )}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-7">
                <h2 className="text-2xl font-bold">Your Store Plans</h2>
                <CheckboxGroup
                  number={9}
                  label="Why are you interested in becoming an Amstani & Co store owner?"
                  options={interestOptions}
                  selected={form.interest_reasons}
                  onChange={(value) => update("interest_reasons", value)}
                />
                {form.interest_reasons.includes("Other") && (
                  <input
                    name="interest_other"
                    value={form.interest_other}
                    onChange={handleInput}
                    placeholder="Tell us more"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                )}
                <CheckboxGroup
                  number={10}
                  label="Who do you primarily plan to sell to?"
                  options={customerOptions}
                  selected={form.target_customers}
                  onChange={(value) => update("target_customers", value)}
                />
                {form.target_customers.includes("Other") && (
                  <input
                    name="target_other"
                    value={form.target_other}
                    onChange={handleInput}
                    placeholder="Tell us more"
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                )}
                {radioGroups[3].map((group) => (
                  <div key={String(group.key)} className="space-y-3">
                    <FieldLabel
                      number={group.key === "weekly_time_commitment" ? 11 : 12}
                    >
                      {group.label}
                    </FieldLabel>
                    {group.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 rounded-xl border border-[#d5e3e4] bg-[#fbfefe] px-4 py-3 text-sm text-slate-700 shadow-[0_3px_10px_rgba(13,48,53,0.025)] transition hover:-translate-y-0.5 hover:border-[#55aeb4] hover:shadow-[0_8px_18px_rgba(13,48,53,0.08)] dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                      >
                        <input
                          type="radio"
                          name={String(group.key)}
                          value={option}
                          checked={form[group.key] === option}
                          onChange={handleInput}
                          className="mt-0.5 accent-[#2f9fa5]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-7">
                <h2 className="text-2xl font-bold">
                  Requirements and Questions
                </h2>
                {radioGroups[4].map((group) => (
                  <div key={String(group.key)} className="space-y-3">
                    <FieldLabel
                      number={
                        group.key === "minimum_order_acknowledgment" ? 13 : 14
                      }
                    >
                      {group.label}
                    </FieldLabel>
                    {group.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 rounded-xl border border-[#d5e3e4] bg-[#fbfefe] px-4 py-3 text-sm text-slate-700 shadow-[0_3px_10px_rgba(13,48,53,0.025)] transition hover:-translate-y-0.5 hover:border-[#55aeb4] hover:shadow-[0_8px_18px_rgba(13,48,53,0.08)] dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                      >
                        <input
                          type="radio"
                          name={String(group.key)}
                          value={option}
                          checked={form[group.key] === option}
                          onChange={handleInput}
                          className="mt-0.5 accent-[#2f9fa5]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <label className="block">
                  <FieldLabel number={15} required={false}>
                    What questions would you like our team to answer?
                  </FieldLabel>
                  <textarea
                    name="applicant_questions"
                    value={form.applicant_questions}
                    onChange={handleInput}
                    maxLength={1000}
                    rows={5}
                    placeholder="Tell us what you would like to know about the store, products, costs, shipping, or application process."
                    className="mt-2 min-h-[3.25rem] w-full rounded-xl border border-[#cbdedd] bg-white px-4 py-3 text-[0.95rem] text-slate-900 outline-none shadow-[0_3px_10px_rgba(13,48,53,0.03)] transition focus:border-[#2f9fa5] focus:ring-4 focus:ring-[#2f9fa5]/15 dark:border-[#28565b] dark:bg-[#102c31] dark:text-slate-200"
                  />
                </label>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-5 sm:space-y-7">
                <h2 className="text-xl font-bold sm:text-2xl">
                  Contact Permission
                </h2>

                <label className="flex items-start gap-2.5 rounded-2xl border border-[#d5e3e4] p-3.5 text-sm leading-6 sm:gap-3 sm:p-4 dark:border-[#28565b]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff3f1] text-xs font-bold text-[#267f8c] shadow-sm dark:bg-[#173f44] dark:text-[#8bd3cf]">
                    16
                  </span>

                  <input
                    type="checkbox"
                    checked={form.contact_consent}
                    onChange={(event) =>
                      update("contact_consent", event.target.checked)
                    }
                    className="mt-1 shrink-0 accent-[#2f9fa5]"
                  />

                  <span className="min-w-0 flex-1">
                    Yes, I agree to be contacted regarding my application and
                    related store-owner information.
                    <span className="ml-1 text-[#2f9fa5]">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 rounded-2xl border border-[#d5e3e4] p-3.5 text-sm leading-6 sm:gap-3 sm:p-4 dark:border-[#28565b]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff3f1] text-xs font-bold text-[#267f8c] shadow-sm dark:bg-[#173f44] dark:text-[#8bd3cf]">
                    17
                  </span>

                  <input
                    type="checkbox"
                    checked={form.privacy_acknowledgment}
                    onChange={(event) =>
                      update("privacy_acknowledgment", event.target.checked)
                    }
                    className="mt-1 shrink-0 accent-[#2f9fa5]"
                  />

                  <span className="min-w-0 flex-1">
                    I have read and agree to the{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#267f8c] underline"
                    >
                      Privacy Policy
                    </Link>
                    . I understand the information will be used to review and
                    respond to my application.
                    <span className="ml-1 text-[#2f9fa5]">*</span>
                  </span>
                </label>
              </div>
            )}
            {error && (
              <p className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-[#e1ecec] pt-6 sm:flex-row">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#cbdede] px-5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}{" "}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2f9fa5] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,159,165,0.2)]"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2f9fa5] px-6 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
