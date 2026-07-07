"use client";

import { useState } from "react";
import { PaymentMethod } from "../../../../models/user";
import { useConfirm } from "../../../../components/global/ConfirmProvider";
import AddCardForm from "./AddCardForm";

interface CardsSectionProps {
  cards: PaymentMethod[];
  onCardAdded: () => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function CardsSection({ cards, onCardAdded, onDeleteCard }: CardsSectionProps) {
  const confirm = useConfirm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleAdded = async () => {
    await onCardAdded();
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
            className="ui-subpanel flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-600 dark:bg-slate-900 transition"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-10 h-6 flex-shrink-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded flex items-center justify-center text-xs font-bold text-white">
                {getProviderLabel(card.provider)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold dark:text-slate-100">**** **** **** {card.last4}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{card.provider}</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">{card.expiry}</span>
              <button
                onClick={() => handleDelete(card.id)}
                disabled={deletingId === card.id}
                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300 transition disabled:opacity-50"
              >
                {deletingId === card.id ? "..." : "Delete"}
              </button>
            </div>
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your card is securely saved with Stripe and will be available at checkout.
          </p>
          <AddCardForm onAdded={handleAdded} onCancel={() => setShowAddForm(false)} />
        </div>
      )}
    </section>
  );
}
