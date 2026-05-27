"use client";

import { useCallback, useEffect, useState } from "react";
import ProfileSummary from "./components/ProfileSummary";
import ShippingSection from "./components/ShippingSection";
import CardsSection from "./components/CardsSection";
import OrderHistorySection from "./components/OrderHistorySection";
import AccountActions from "./components/AccountActions";
import { Address, PaymentMethod, User } from "../../../models/user";

const readError = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null);
  return data?.error || fallback;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCards(data.user.paymentMethods || []);
      } else if (res.status === 401) {
        showToast("error", "Please sign in to view your profile");
      } else {
        showToast("error", await readError(res, "Failed to fetch profile"));
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      showToast("error", "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (updatedData: Pick<User, "name" | "email" | "phone" | "state">) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        await fetchProfile();
        showToast("success", "Profile updated successfully!");
      } else {
        const message = await readError(res, "Failed to save profile");
        showToast("error", message);
        throw new Error(message);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      if (!(error instanceof Error)) showToast("error", "Error saving profile");
      throw error;
    }
  };

  const saveAddresses = async (addresses: Address[], successMessage: string) => {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses }),
    });

    if (!res.ok) {
      const message = await readError(res, "Failed to update addresses");
      showToast("error", message);
      throw new Error(message);
    }

    await fetchProfile();
    showToast("success", successMessage);
  };

  const handleAddAddress = async (newAddress: Address) => {
    try {
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      await saveAddresses(updatedAddresses, "Address added successfully!");
    } catch (error) {
      console.error("Error adding address:", error);
      if (!(error instanceof Error)) showToast("error", "Error adding address");
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const remainingAddresses = (user?.addresses || []).filter((address) => address.id !== addressId);
    const hasDefault = remainingAddresses.some((address) => address.isDefault);
    const normalizedAddresses = remainingAddresses.map((address, index) => ({
      ...address,
      isDefault: hasDefault ? address.isDefault : index === 0,
    }));
    await saveAddresses(normalizedAddresses, "Address deleted successfully!");
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const updatedAddresses = (user?.addresses || []).map((address) => ({
      ...address,
      isDefault: address.id === addressId,
    }));
    await saveAddresses(updatedAddresses, "Default address updated!");
  };

  const handleAddCard = async (cardPayload: PaymentMethod) => {
    try {
      const res = await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card: cardPayload }),
      });
      if (res.ok) {
        await fetchProfile();
        showToast("success", "Card added successfully!");
      } else {
        const message = await readError(res, "Failed to add card");
        showToast("error", message);
        throw new Error(message);
      }
    } catch (error) {
      console.error("Error adding card:", error);
      if (!(error instanceof Error)) showToast("error", "Error adding card");
      throw error;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/user/cards?id=${cardId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProfile();
        showToast("success", "Card deleted successfully!");
      } else {
        const message = await readError(res, "Failed to delete card");
        showToast("error", message);
        throw new Error(message);
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      if (!(error instanceof Error)) showToast("error", "Error deleting card");
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch("/api/user/profile", { method: "DELETE" });
    if (!res.ok) {
      const message = await readError(res, "Failed to delete account");
      showToast("error", message);
      throw new Error(message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      {toastMessage && (
        <div
          className={`mb-6 p-4 rounded-lg font-semibold ${
            toastMessage.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-12">
        <ProfileSummary user={user} onSave={handleSaveProfile} />
        <ShippingSection
          addresses={user?.addresses || []}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          onSetDefaultAddress={handleSetDefaultAddress}
        />
      </section>

      <CardsSection
        cards={cards}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />

      <OrderHistorySection />
      <AccountActions onDeleteAccount={handleDeleteAccount} />
    </div>
  );
}
