import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = {
  title: "Data Protection | Amstani & Co",
  description:
    "How Amstani & Co collects, uses, and protects your personal data.",
};

export default function DataProtectionPage() {
  return (
    <PolicyPage
      title="Data Protection"
      lastUpdated="June 24, 2026"
      intro="Your privacy matters to us. This policy explains what personal data we collect, why we collect it, and the choices you have over it."
      sections={[
        {
          heading: "Data we collect",
          body: (
            <>
              <p>We collect information you provide and data generated as you use Amstani & Co, including:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Account details such as your name, email, and state.</li>
                <li>Order and payment information needed to fulfill purchases.</li>
                <li>
                  Communications with stores and our support team.
                </li>
                <li>
                  Technical data such as device, browser, and usage activity.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How we use your data",
          body: (
            <p>
              We use your data to create and manage your account, process and
              deliver orders, provide support, prevent fraud, and improve the
              platform. We do not sell your personal data.
            </p>
          ),
        },
        {
          heading: "Payment security",
          body: (
            <p>
              Payments are handled by our payment processor, Stripe. Your full
              card details are never stored on our servers &mdash; they are
              processed securely by Stripe in line with PCI-DSS standards.
            </p>
          ),
        },
        {
          heading: "Sharing your data",
          body: (
            <p>
              We share only what&rsquo;s necessary with the store fulfilling
              your order and with trusted service providers (for example,
              payment, shipping, and email). These partners are bound to handle
              your data securely and only for the purposes we specify.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You can access, correct, or delete your personal data, and you may
              object to certain processing. Manage your details in your account
              settings, or contact us to exercise any of these rights.
            </p>
          ),
        },
        {
          heading: "Data retention",
          body: (
            <p>
              We keep your data only as long as needed to provide our services
              and meet legal, tax, and accounting obligations. When it&rsquo;s
              no longer needed, we securely delete or anonymize it.
            </p>
          ),
        },
      ]}
    />
  );
}
