"use client";

import { useState } from "react";
import ProfileSummary from "./components/ProfileSummary";
import ShippingSection from "./components/ShippingSection";
import CardsSection from "./components/CardsSection";
import OrderHistorySection from "./components/OrderHistorySection";
import AccountActions from "./components/AccountActions";

type Card = {
  id: number;
  provider: "Mastercard" | "Visa";
  last4: string;
  expiry: string;
};

export default function ProfilePage() {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, provider: "Mastercard", last4: "3864", expiry: "09/30" },
    { id: 2, provider: "Visa", last4: "3864", expiry: "09/30" },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const handleAddCard = () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvc) return;

    const provider = newCard.number.startsWith("4") ? "Visa" : "Mastercard";
    const last4 = newCard.number.slice(-4);
    const nextId = cards.length ? cards[cards.length - 1].id + 1 : 1;

    setCards((prev) => [...prev, { id: nextId, provider, last4, expiry: newCard.expiry }]);
    setNewCard({ number: "", name: "", expiry: "", cvc: "" });
    setShowAddForm(false);
  };

  const handleDeleteCard = (id: number) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <section className="grid gap-6 md:grid-cols-12">
        <ProfileSummary />
        <ShippingSection />
      </section>

      <CardsSection
        cards={cards}
        showAddForm={showAddForm}
        newCard={newCard}
        setShowAddForm={setShowAddForm}
        setNewCard={setNewCard}
        handleAddCard={handleAddCard}
        handleDeleteCard={handleDeleteCard}
      />

      <OrderHistorySection />
      <AccountActions />
    </div>
  );
}
