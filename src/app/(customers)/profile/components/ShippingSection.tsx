"use client";

import { useCallback, useState } from "react";
import { Address } from "../../../../models/user";
import ProfileLocationMap from "./ProfileLocationMap";
import { useToast } from "../../../../components/global/ToastProvider";

type AddressSelection = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type ShippingSectionProps = {
  addresses: Address[];
  onAddAddress?: (address: Address) => Promise<void>;
  onDeleteAddress?: (addressId: string) => Promise<void>;
  onSetDefaultAddress?: (addressId: string) => Promise<void>;
};

export default function ShippingSection({
  addresses,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: ShippingSectionProps) {
  const toast = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    type: "shipping" as "shipping" | "billing",
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!newAddress.recipientName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const address: Address = {
        id: crypto.randomUUID(),
        ...newAddress,
        isDefault: addresses.length === 0,
      };

      await onAddAddress?.(address);
      setNewAddress({ recipientName: "", street: "", city: "", state: "", zip: "", country: "USA", type: "shipping" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewAddress({ recipientName: "", street: "", city: "", state: "", zip: "", country: "USA", type: "shipping" });
    setShowAddForm(false);
  };

  const handleMapAddressSelect = useCallback((selection: AddressSelection) => {
    setNewAddress((prev) => ({
      ...prev,
      street: selection.street || prev.street,
      city: selection.city || prev.city,
      state: selection.state || prev.state,
      zip: selection.zip || prev.zip,
      country: selection.country || prev.country,
    }));
    setShowAddForm(true);
  }, []);

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Delete this saved address?")) return;
    setPendingAddressId(addressId);
    try {
      await onDeleteAddress?.(addressId);
    } finally {
      setPendingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setPendingAddressId(addressId);
    try {
      await onSetDefaultAddress?.(addressId);
    } finally {
      setPendingAddressId(null);
    }
  };

  return (
    <article className="ui-panel rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800 md:col-span-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Shipping Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Recent Addresses</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {addresses.length === 0 ? (
          <p className="text-sm text-slate-500 col-span-2 py-4">No addresses saved yet. Add one to get started!</p>
        ) : (
          addresses.map((address, index) => (
            <div
              key={address.id || index}
              className={`rounded-xl border p-4 shadow-sm transition ${
                address.isDefault
                  ? "border-2 border-cyan-400 bg-cyan-50 dark:bg-slate-700"
                  : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3
                  className={`font-semibold ${
                    address.isDefault ? "text-cyan-900 dark:text-cyan-200" : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {address.recipientName}
                </h3>
                {address.isDefault && (
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className={`text-sm ${address.isDefault ? "text-cyan-800 dark:text-cyan-300" : "text-slate-600 dark:text-slate-300"}`}>
                {address.street}
              </p>
              <p className={`text-sm ${address.isDefault ? "text-cyan-800 dark:text-cyan-300" : "text-slate-600 dark:text-slate-300"}`}>
                {address.city}, {address.state} {address.zip}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultAddress(address.id)}
                    disabled={pendingAddressId === address.id}
                    className="rounded-lg border border-cyan-200 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-50 dark:border-cyan-500/40 dark:text-cyan-200 dark:hover:bg-cyan-900/20"
                  >
                    Make Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(address.id)}
                  disabled={pendingAddressId === address.id}
                  className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-900/20"
                >
                  {pendingAddressId === address.id ? "Working..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ui-subpanel mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
        {!showAddForm ? (
          <div className="flex flex-col" style={{ minHeight: 320 }}>
            <div className="flex-1 min-h-0 mb-4">
              <ProfileLocationMap onSelectAddress={handleMapAddressSelect} />
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-cyan-500 transition"
              >
                + Add New Location
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-4">Add New Address</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recipientName"
                placeholder="Full name"
                value={newAddress.recipientName}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                placeholder="Street address"
                value={newAddress.street}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={newAddress.zip}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={
                  isSaving ||
                  !newAddress.recipientName ||
                  !newAddress.street ||
                  !newAddress.city ||
                  !newAddress.state ||
                  !newAddress.zip
                }
                className="px-4 py-2 rounded-lg bg-cyan-400 text-white text-sm font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
