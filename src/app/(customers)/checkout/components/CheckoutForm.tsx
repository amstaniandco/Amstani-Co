"use client";

import type { ChangeEvent } from "react";

type Address = {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
};

type CheckoutFormProps = {
  savedAddresses: Address[];
  selectedAddress: number;
  onSelectAddress: (id: number) => void;
  form: {
    fullName: string;
    phone: string;
    street: string;
    state: string;
    zip: string;
  };
  onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function CheckoutForm({
  savedAddresses,
  selectedAddress,
  onSelectAddress,
  form,
  onFormChange,
}: CheckoutFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          Secure Checkout
        </h1>
        <span className="text-xs text-black/80 mt-2">Step 1 of 2</span>
      </div>
      <p className="text-sm text-black/80 mb-4">
        Your luxury selection is almost there.
      </p>

      <div className="h-[3px] bg-gray-100 rounded-full mb-7 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-300 to-indigo-400" />
      </div>

      <p className="text-[11px] font-semibold tracking-widest uppercase text-black mb-4">
        Shipping Details
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {savedAddresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelectAddress(addr.id)}
            className={`text-left border-2 rounded-xl p-4 transition-all duration-200 ${
              selectedAddress === addr.id
                ? "border-teal-300 bg-teal-50 ring-2 ring-teal-100"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <p className={`mb-1 ${selectedAddress === addr.id ? "text-base font-semibold" : "text-sm font-semibold"}`}>
              {addr.name}
            </p>
            <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} text-black leading-relaxed`}>
              {addr.address}
            </p>
            <div className="flex justify-between items-center mt-1">
              <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} text-black`}>
                {addr.city}
              </p>
              <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} font-semibold text-black`}>
                {addr.zip}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 my-5 text-xs text-black/70">
        <span className="flex-1 h-px bg-gray-200" />
        or
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-4">
        <FormField
          label="Full Name"
          name="fullName"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={onFormChange}
        />
        <FormField
          label="Phone Number"
          name="phone"
          placeholder="Enter your mobile Number"
          value={form.phone}
          onChange={onFormChange}
        />
        <FormField
          label="Street Address"
          name="street"
          placeholder="Address, Suite, Apartment"
          value={form.street}
          onChange={onFormChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="State"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={onFormChange}
          />
          <FormField
            label="Zip Code"
            name="zip"
            placeholder="e.g. NY-AM-01"
            value={form.zip}
            onChange={onFormChange}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl overflow-hidden h-36 relative">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=700&h=160&fit=crop"
          alt="Map"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        <span className="absolute bottom-3 left-4 text-white text-sm font-semibold drop-shadow">
          Los Angeles
        </span>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold tracking-widest uppercase text-black mb-1.5">
        {label}
      </label>
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 placeholder-gray-400 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 focus:bg-white transition-all"
      />
    </div>
  );
}
