import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping Policy | Amstani & Co",
  description: "Shipping methods, timelines, and costs for Amstani & Co orders.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      lastUpdated="June 24, 2026"
      intro="Orders on Amstani & Co are shipped directly by the independent store that fulfills them. This policy covers how and when your order is dispatched and delivered."
      sections={[
        {
          heading: "Processing time",
          body: (
            <p>
              Most orders are processed within 1&ndash;3 business days. During
              sales, holidays, or for made-to-order items, processing may take a
              little longer &mdash; the store will note any extended timeline on
              the product page.
            </p>
          ),
        },
        {
          heading: "Delivery estimates",
          body: (
            <>
              <p>
                Delivery times depend on your location and the store&rsquo;s
                shipping origin. Typical estimates within the United States are:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Standard: 3&ndash;7 business days</li>
                <li>Expedited: 2&ndash;3 business days</li>
                <li>Overnight (where available): 1 business day</li>
              </ul>
              <p>
                These are estimates, not guarantees &mdash; carrier delays can
                occur outside of our control.
              </p>
            </>
          ),
        },
        {
          heading: "Shipping costs",
          body: (
            <p>
              Shipping is calculated at checkout based on your order and
              destination. Some stores offer free shipping over a minimum order
              value; any such offer is shown before you pay.
            </p>
          ),
        },
        {
          heading: "Tracking your order",
          body: (
            <p>
              Once your order ships, you&rsquo;ll receive a confirmation with a
              tracking number. You can also follow its status anytime from the
              Orders section of your account.
            </p>
          ),
        },
        {
          heading: "Lost or delayed packages",
          body: (
            <p>
              If your package hasn&rsquo;t arrived within the estimated window,
              contact the store through your order or reach out to us and
              we&rsquo;ll help track it down.
            </p>
          ),
        },
      ]}
    />
  );
}
