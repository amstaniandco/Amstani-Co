"use client";

import { useState } from "react";
import ClaimItemSelector from "./components/ClaimItemSelector";
import ClaimForm from "./components/ClaimForm";
import ClaimsTable from "./components/ClaimsTable";

const products = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
];

const claims = [
  {
    id: "#CLM-9901",
    customer: "Sarah Jenkins",
    issueType: "Damaged item",
    status: "ESCALATED",
    statusClass: "text-red-500",
    action: "Report",
    highlight: true,
  },
  {
    id: "#CLR-0054",
    customer: "Mark Thompson",
    issueType: "Refund",
    status: "RESPONDED",
    statusClass: "text-green-600",
    action: null,
    highlight: false,
  },
  {
    id: "#CLR-8840",
    customer: "Jessica Alba",
    issueType: "Missing item",
    status: "OPEN",
    statusClass: "text-gray-400",
    action: null,
    highlight: false,
  },
];

export default function ClaimPage() {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    Object.fromEntries(products.map((p) => [p.id, 1])),
  );
  const [selected, setSelected] = useState<{ [key: number]: boolean }>({});
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");

  const handleQty = (id: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitClaim = () => {
    // Add claim submission logic here
    console.log("Submitting claim", { issueType, message, selected });
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5 text-base">
      <ClaimItemSelector
        products={products}
        quantities={quantities}
        selected={selected}
        handleQty={handleQty}
        toggleSelect={toggleSelect}
      />

      <ClaimForm
        issueType={issueType}
        message={message}
        setIssueType={setIssueType}
        setMessage={setMessage}
        onSubmit={handleSubmitClaim}
      />

      <ClaimsTable claims={claims} />
    </div>
  );
}
