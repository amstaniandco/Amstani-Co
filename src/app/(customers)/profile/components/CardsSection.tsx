"use client";

import { useState } from "react";
import { PaymentMethod } from "../../../../models/user";
import { useToast } from "../../../../components/global/ToastProvider";
import { useConfirm } from "../../../../components/global/ConfirmProvider";

interface CardsSectionProps {
  cards: PaymentMethod[];
  onAddCard: (card: PaymentMethod) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function CardsSection({ cards, onAddCard, onDeleteCard }: CardsSectionProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const validateCard = () => {
    if (!/^\d{13,19}$/.test(newCard.number)) {
      toast.error("Card number must be at least 13 digits");
      return false;
    }
    if (!newCard.name) {
      toast.error("Name on card is required");
      return false;
    }
    if (!newCard.expiry || !/^\d{2}\/\d{2}$/.test(newCard.expiry)) {
      toast.error("Expiry date must be in MM/YY format");
      return false;
    }
    if (!/^\d{3,4}$/.test(newCard.cvc)) {
      toast.error("CVC must be 3 or 4 digits");
      return false;
    }
    return true;
  };

  const handleAddCard = async () => {
    if (!validateCard()) return;

    setIsSaving(true);
    try {
      const provider = newCard.number.startsWith("4")
        ? "Visa"
        : newCard.number.startsWith("3")
          ? "Amex"
          : newCard.number.startsWith("6")
            ? "Discover"
            : "Mastercard";
      const last4 = newCard.number.slice(-4);

      const cardPayload: PaymentMethod = {
        id: crypto.randomUUID(),
        provider,
        last4,
        expiry: newCard.expiry,
      };

      await onAddCard(cardPayload);
      setNewCard({ number: "", name: "", expiry: "", cvc: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding card:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!(await confirm("Are you sure you want to delete this card?"))) return;

    setDeletingId(cardId);
    try {
      await onDeleteCard(cardId);
    } catch (err) {
      console.error("Error deleting card:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setNewCard({ number: "", name: "", expiry: "", cvc: "" });
    setShowAddForm(false);
  };

  const getProviderLabel = (provider: string) => {
    if (provider === "Mastercard") return "MC";
    if (provider === "Amex") return "AX";
    if (provider === "Discover") return "DS";
    return "VS";
  };

  return (
    <section className="ui-panel mt-6 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Cards</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {cards.length === 0 ? "No cards saved" : `${cards.length} card${cards.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {cards.length === 0 && !showAddForm && (
        <div className="text-center py-6">
          <p className="text-slate-500 dark:text-slate-400 mb-3">No payment methods saved yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="ui-subpanel flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-600 dark:bg-slate-900 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-6 bg-gradient-to-r from-slate-300 to-slate-400 rounded flex items-center justify-center text-xs font-bold text-white">
                {getProviderLabel(card.provider)}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold dark:text-slate-100">**** **** **** {card.last4}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{card.provider}</p>
              </div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300 mx-4">{card.expiry}</span>
            <button
              onClick={() => handleDelete(card.id)}
              disabled={deletingId === card.id}
              className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300 transition disabled:opacity-50"
            >
              {deletingId === card.id ? "..." : "Delete"}
            </button>
          </div>
        ))}
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700 transition"
        >
          + Add New Card
        </button>
      )}

      {showAddForm && (
        <div className="ui-subpanel mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add New Payment Method</h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCard.number}
              onChange={(e) => setNewCard((prev) => ({ ...prev, number: e.target.value.replace(/\D/g, "") }))}
              placeholder="1234 5678 9012 3456"
              className="ui-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Name on Card <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCard.name}
              onChange={(e) => setNewCard((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your Name"
              className="ui-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCard.expiry}
                onChange={(e) => setNewCard((prev) => ({ ...prev, expiry: e.target.value }))}
                placeholder="MM/YY"
                maxLength={5}
                className="ui-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                CVC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCard.cvc}
                onChange={(e) => setNewCard((prev) => ({ ...prev, cvc: e.target.value.replace(/\D/g, "") }))}
                placeholder="123"
                maxLength={4}
                className="ui-input w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCard}
              disabled={isSaving || !newCard.number || !newCard.name || !newCard.expiry || !newCard.cvc}
              className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-white hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Card"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
