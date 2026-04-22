"use client";

import { useState, type ChangeEvent } from "react";
import CheckoutForm from "./components/CheckoutForm";
import OrderSummary from "./components/OrderSummary";

const savedAddresses = [
  {
    id: 1,
    name: "Muhammad Taqi",
    address: "House # 341, Street 18, I-16",
    city: "Islamabad",
    zip: "4080",
  },
  {
    id: 2,
    name: "Muhammad Taqi",
    address: "House # 341, Street 18, I-16",
    city: "Islamabad",
    zip: "4080",
  },
];

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    state: "",
    zip: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen px-2 py-4 dark:bg-slate-950">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_380px]">
        <CheckoutForm
          savedAddresses={savedAddresses}
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
          form={form}
          onFormChange={handleChange}
        />
        <OrderSummary />
      </div>
    </div>
  );
}
