import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

type Card = {
  id: number;
  provider: "Mastercard" | "Visa";
  last4: string;
  expiry: string;
};

interface CardsSectionProps {
  cards: Card[];
  showAddForm: boolean;
  newCard: { number: string; name: string; expiry: string; cvc: string };
  setShowAddForm: (value: boolean) => void;
  setNewCard: Dispatch<SetStateAction<{ number: string; name: string; expiry: string; cvc: string }>>;
  handleAddCard: () => void;
  handleDeleteCard: (id: number) => void;
}

export default function CardsSection({ cards, showAddForm, newCard, setShowAddForm, setNewCard, handleAddCard, handleDeleteCard }: CardsSectionProps) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Manage Cards</h2>
        <p className="text-sm text-slate-500">Saved Cards</p>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={card.provider === "Mastercard" ? "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" : "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa_Logo.png"}
                alt={card.provider}
                className="h-6"
              />
              <span className="text-sm font-semibold">**** {card.last4}</span>
            </div>
            <span className="text-sm text-slate-600">{card.expiry}</span>
            <button onClick={() => handleDeleteCard(card.id)} className="text-slate-400 hover:text-rose-500">🗑</button>
          </div>
        ))}
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
        >
          Add New Card
        </button>
      )}

      {showAddForm && (
        <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-900">New Card</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Card Number</label>
              <input
                value={newCard.number}
                onChange={(e) => setNewCard((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="0000 0000 0000 0000"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name on Card</label>
              <input
                value={newCard.name}
                onChange={(e) => setNewCard((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name On Card"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Expiry Date</label>
                <input
                  value={newCard.expiry}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">CVC</label>
                <input
                  value={newCard.cvc}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, cvc: e.target.value }))}
                  placeholder="CVC"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-400 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-white hover:bg-cyan-600"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
