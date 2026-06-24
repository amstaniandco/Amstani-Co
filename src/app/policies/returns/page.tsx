import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = {
  title: "Return & Exchange | Amstani & Co",
  description:
    "How to return or exchange items purchased from Amstani & Co stores.",
};

export default function ReturnExchangePage() {
  return (
    <PolicyPage
      title="Return & Exchange"
      lastUpdated="June 24, 2026"
      intro="Need a different size or changed your mind? Here's how returns and exchanges work across the stores on Amstani & Co."
      sections={[
        {
          heading: "Return window",
          body: (
            <p>
              You have 14 days from the delivery date to start a return or
              exchange. Items must be unworn, unwashed, and in their original
              condition with tags and packaging intact.
            </p>
          ),
        },
        {
          heading: "How to start a return or exchange",
          body: (
            <>
              <p>To begin:</p>
              <ol className="list-decimal space-y-1 pl-6">
                <li>Open the order in your account.</li>
                <li>
                  Select the item and choose &ldquo;Return&rdquo; or
                  &ldquo;Exchange.&rdquo;
                </li>
                <li>Pick a reason and, for exchanges, your preferred size or variant.</li>
                <li>
                  Print the return label provided and ship the item back within
                  7 days.
                </li>
              </ol>
            </>
          ),
        },
        {
          heading: "Exchanges",
          body: (
            <p>
              Exchanges are subject to availability. If your preferred size or
              variant is out of stock, the store will offer a refund or store
              credit instead. Your replacement ships once the original item is
              received and inspected.
            </p>
          ),
        },
        {
          heading: "Return shipping costs",
          body: (
            <p>
              If the return is due to our error &mdash; a faulty, damaged, or
              incorrect item &mdash; return shipping is on us. For
              change-of-mind returns, the return shipping cost may be deducted
              from your refund.
            </p>
          ),
        },
        {
          heading: "Non-returnable items",
          body: (
            <p>
              Final-sale items, intimate apparel, gift cards, and custom or
              made-to-order pieces cannot be returned or exchanged unless they
              arrive faulty.
            </p>
          ),
        },
      ]}
    />
  );
}
