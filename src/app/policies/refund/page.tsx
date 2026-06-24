import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = {
  title: "Refund Policy | Amstani & Co",
  description: "How refunds work for orders placed with Amstani & Co stores.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      lastUpdated="June 24, 2026"
      intro="We want you to love what you receive. If something isn't right, this policy explains when you're eligible for a refund and how the process works across the independent stores on Amstani & Co."
      sections={[
        {
          heading: "Eligibility",
          body: (
            <>
              <p>
                You may request a refund within 14 days of delivery if your item
                is defective, damaged, or materially different from its
                description. Items must be unworn, unwashed, and in their
                original condition with any tags attached.
              </p>
              <p>
                Final-sale items, gift cards, and custom or made-to-order pieces
                are not eligible for a refund unless they arrive faulty.
              </p>
            </>
          ),
        },
        {
          heading: "How to request a refund",
          body: (
            <p>
              Open the order in your account, select the item, and choose
              &ldquo;Request a refund.&rdquo; Tell us what went wrong and add
              photos where relevant. The store that fulfilled your order reviews
              every request, usually within 2&ndash;3 business days.
            </p>
          ),
        },
        {
          heading: "Processing time",
          body: (
            <p>
              Once approved, refunds are issued to your original payment method.
              Please allow 5&ndash;10 business days for the amount to appear,
              depending on your bank or card provider. Original shipping charges
              are non-refundable unless the return is due to our error.
            </p>
          ),
        },
        {
          heading: "Partial refunds",
          body: (
            <p>
              In some cases &mdash; for example, an item returned outside the
              eligibility window or showing signs of use &mdash; only a partial
              refund may be granted at the store&rsquo;s discretion.
            </p>
          ),
        },
      ]}
    />
  );
}
