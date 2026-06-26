"use client";

import type { ChangeEvent } from "react";
import type { Address } from "../../../../models/user";
import ProfileLocationMap from "../../profile/components/ProfileLocationMap";

type MapAddressSelection = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type CheckoutFormProps = {
  savedAddresses: Address[];
  selectedAddress: string;
  onSelectAddress: (address: Address) => void;
  form: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMapAddressSelect: (selection: MapAddressSelection) => void;
};

export default function CheckoutForm({
  savedAddresses,
  selectedAddress,
  onSelectAddress,
  form,
  onFormChange,
  onMapAddressSelect,
}: CheckoutFormProps) {
  return (
    <div className="ui-panel rounded-2xl bg-white p-8 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-xl font-bold tracking-tight text-black dark:text-slate-100 sm:text-3xl">
          Secure Checkout
        </h1>
        <span className="mt-1 flex-shrink-0 whitespace-nowrap text-xs text-black/80 dark:text-slate-300 sm:mt-2">Step 1 of 2</span>
      </div>
      <p className="mb-4 text-sm text-black/80 dark:text-slate-300">
        Your luxury selection is almost there.
      </p>

      <div className="ui-divider mb-7 h-[3px] overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-300 to-indigo-400" />
      </div>

      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-slate-100">
        Shipping Details
      </p>

      <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2">
        {savedAddresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 sm:col-span-2">
            No saved shipping addresses yet. Add one from your profile or enter the details below.
          </div>
        ) : savedAddresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelectAddress(addr)}
            className={`text-left border-2 rounded-xl p-4 transition-all duration-200 ${
              selectedAddress === addr.id
                ? "border-teal-300 bg-teal-50 ring-2 ring-teal-100 dark:border-teal-400 dark:bg-teal-900/20 dark:ring-teal-900/40"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500"
            }`}
          >
            <p className={`mb-1 dark:text-slate-100 ${selectedAddress === addr.id ? "text-base font-semibold" : "text-sm font-semibold"}`}>
              {addr.recipientName}
              {addr.isDefault && <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">DEFAULT</span>}
            </p>
            <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} leading-relaxed text-black dark:text-slate-300`}>
              {addr.street}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} min-w-0 flex-1 text-black dark:text-slate-300`}>
                {addr.city}, {addr.state}
              </p>
              <p className={`${selectedAddress === addr.id ? "text-sm" : "text-xs"} flex-shrink-0 whitespace-nowrap font-semibold text-black dark:text-slate-100`}>
                {addr.zip}
              </p>
            </div>
            <p className="mt-1 text-xs text-black/60 dark:text-slate-400">{addr.country}</p>
          </button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-black/70 dark:text-slate-400">
        <span className="ui-divider h-px flex-1 bg-gray-200 dark:bg-slate-700" />
        or
        <span className="ui-divider h-px flex-1 bg-gray-200 dark:bg-slate-700" />
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            label="City"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={onFormChange}
          />
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

      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-slate-100">
          Or pick from map
        </p>
        <div style={{ height: 260 }}>
          <ProfileLocationMap onSelectAddress={onMapAddressSelect} />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Click anywhere on the map to auto-fill your address fields.</p>
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
      <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-black dark:text-slate-100">
        {label}
      </label>
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="ui-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:bg-slate-800 dark:focus:ring-teal-900/50"
      />
    </div>
  );
}
