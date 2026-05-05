"use client";

import { useState, useEffect } from "react";
import ProfileSummary from "./components/ProfileSummary";
import ShippingSection from "./components/ShippingSection";
import CardsSection from "./components/CardsSection";
import OrderHistorySection from "./components/OrderHistorySection";
import AccountActions from "./components/AccountActions";
import { PaymentMethod, User } from "../../../models/user";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCards(data.user.paymentMethods || []);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      showToast("error", "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = async (updatedData: any) => {
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
        showToast("error", "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("error", "Error saving profile");
    }
  };

  const handleAddAddress = async (newAddress: any) => {
    try {
      const updatedAddresses = [...(user?.addresses || []), newAddress];
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      if (res.ok) {
        await fetchProfile();
        showToast("success", "Address added successfully!");
      } else {
        showToast("error", "Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      showToast("error", "Error adding address");
    }
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
        showToast("error", "Failed to add card");
      }
    } catch (error) {
      console.error("Error adding card:", error);
      showToast("error", "Error adding card");
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
        showToast("error", "Failed to delete card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      showToast("error", "Error deleting card");
      throw error;
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
        <ShippingSection addresses={user?.addresses || []} onAddAddress={handleAddAddress} />
      </section>

      <CardsSection
        cards={cards}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />

      <OrderHistorySection />
      <AccountActions />
    </div>
  );
}
