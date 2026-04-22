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
    <section className="ui-panel mt-6 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Cards</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Saved Cards</p>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="ui-subpanel flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-600 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <img
                src={card.provider === "Mastercard" ? "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" : "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa_Logo.png"}
                alt={card.provider}
                className="h-6"
              />
              <span className="text-sm font-semibold dark:text-slate-100">**** {card.last4}</span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300">{card.expiry}</span>
            <button onClick={() => handleDeleteCard(card.id)} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300">🗑</button>
          </div>
        ))}
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          Add New Card
        </button>
      )}

      {showAddForm && (
        <div className="ui-subpanel mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New Card</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Card Number</label>
              <input
                value={newCard.number}
                onChange={(e) => setNewCard((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="0000 0000 0000 0000"
                className="ui-input mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Name on Card</label>
              <input
                value={newCard.name}
                onChange={(e) => setNewCard((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name On Card"
                className="ui-input mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Expiry Date</label>
                <input
                  value={newCard.expiry}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                  className="ui-input mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">CVC</label>
                <input
                  value={newCard.cvc}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, cvc: e.target.value }))}
                  placeholder="CVC"
                  className="ui-input mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-400 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
