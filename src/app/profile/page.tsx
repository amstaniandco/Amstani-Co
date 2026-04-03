"use client";

import { useState } from "react";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 md:grid-cols-12">
        <aside className="md:col-span-4 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
              <img
                src="https://i.pravatar.cc/160?img=47"
                alt="Profile"
                className="h-full w-full object-cover"
              />
              <div className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-white shadow-md">
                ✎
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Julian Amstani</h1>
              <p className="text-sm text-slate-500">julian@amstani.co</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
              <input value="Julian Amstani" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">State</label>
              <input value="Texas" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input value="julian@amstani.co" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
              <input value="+1 (555) 890-4421" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
            </div>
          </div>
        </aside>

        <article className="md:col-span-8 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Shipping Details</h2>
            <p className="text-sm text-slate-500">Recent Addresses</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-cyan-400 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-800">Muhammad Taqi</h3>
              <p className="text-sm text-slate-600">House # 341, Street 18, I-16</p>
              <p className="text-sm text-slate-600">Islamabad</p>
              <p className="text-sm font-bold text-slate-800">4080</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800">Muhammad Taqi</h3>
              <p className="text-sm text-slate-600">House # 341, Street 18, I-16</p>
              <p className="text-sm text-slate-600">Islamabad</p>
              <p className="text-sm font-semibold text-slate-800">4080</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-44 w-full rounded-lg bg-gray-200" />
            <div className="mt-4 flex justify-center">
              <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-500">Select Location</button>
            </div>
          </div>
        </article>
      </section>

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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Card Number
                </label>
                <input
                  value={newCard.number}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="0000 0000 0000 0000"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Name on Card
                </label>
                <input
                  value={newCard.name}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name On Card"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Expiry Date
                  </label>
                  <input
                    value={newCard.expiry}
                    onChange={(e) => setNewCard((prev) => ({ ...prev, expiry: e.target.value }))}
                    placeholder="MM/YY"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    CVC
                  </label>
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

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Order History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3">Order ID</th>
                <th className="py-3">Date</th>
                <th className="py-3">Total Price</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                { id: "#AM-1024", date: "Oct 24, 2023", total: "$2,450.00", status: "Delivered" },
                { id: "#AM-1022", date: "Oct 18, 2023", total: "$1,120.00", status: "Dispatched" },
                { id: "#AM-0985", date: "Oct 12, 2023", total: "$4,200.00", status: "Delivered" },
                { id: "#AM-0972", date: "Oct 05, 2023", total: "$890.00", status: "Delivered" },
                { id: "#AM-0951", date: "Sep 28, 2023", total: "$1,540.00", status: "Delivered" },
              ].map((order) => (
                <tr key={order.id}>
                  <td className="py-3 font-semibold text-slate-800">{order.id}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">{order.total}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-cyan-600 hover:text-cyan-700">View Receipt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      <section className="mt-4 rounded-2xl p-6">
        <div className="space-y-2">
          <button className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
          <button className="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">Delete Account</button>
        </div>
      </section>
    </div>
  );
}

