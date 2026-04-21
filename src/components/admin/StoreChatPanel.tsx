type StoreChatPanelProps = {
  title: string;
  rightLabel: string;
};

const conversations = [
  {
    author: "Marcus H.",
    time: "2m ago",
    preview: "My item arrived damaged!...",
    active: true,
  },
  {
    author: "Lina W.",
    time: "Today",
    preview: "Shipping inquiry, international ...",
    active: false,
  },
];

const messages = [
  { sender: "customer", author: "Marcus H.", text: "Hi, I just received my order, but the surface is shattered. Can I get a refund? (Claim #5744)" },
  { sender: "store", author: "Store", text: "I am very sorry to hear that. Can you provide pictures of the damaged jar and the shipping box?" },
];

export default function StoreChatPanel({ title, rightLabel }: StoreChatPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#d8e1e7] bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)] sm:rounded-[18px]">
      <div className="flex flex-col gap-2 border-b border-[#e5edf1] bg-[#f8fbfc] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="max-w-full truncate rounded-full border border-[#d7e0e6] bg-white px-3 py-1 text-xs text-slate-600 sm:max-w-[260px]">
          {rightLabel}
        </span>
      </div>

      <div className="grid min-h-[400px] grid-cols-1 border-b border-[#edf2f5] md:grid-cols-[220px_1fr]">
        {/* Conversation List */}
        <div className="hidden border-b border-[#edf2f5] bg-[#f9fbfc] md:block md:border-b-0 md:border-r">
          {conversations.map((conversation) => (
            <button
              key={conversation.author}
              type="button"
              className={`w-full border-b border-[#edf2f5] px-4 py-3 text-left transition ${
                conversation.active ? "bg-[#e8f4f7] hover:bg-[#e0eef2]" : "bg-white hover:bg-[#f5f7f9]"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  conversation.active ? "bg-[#54b9c9] text-white" : "bg-[#dfe7ec] text-slate-700"
                }`}>
                  {conversation.author.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900">{conversation.author}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{conversation.preview}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{conversation.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex flex-col justify-between bg-[#fdfefe]">
          {/* Messages */}
          <div className="overflow-y-auto space-y-3 px-3 py-4 sm:px-4 sm:py-5">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}>
                {message.sender === "store" && (
                  <div className="mr-2 h-8 w-8 flex-shrink-0 rounded-full bg-[#54b9c9] flex items-center justify-center text-xs font-bold text-white">
                    S
                  </div>
                )}
                <div className={`max-w-xs ${message.sender === "customer" ? "bg-[#54b9c9] text-white" : "bg-[#e8ecef] text-slate-700"} rounded-lg px-4 py-2.5`}>
                  {message.sender === "store" && (
                    <p className="text-[10px] font-semibold mb-1 opacity-70">Store</p>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#edf2f5] bg-[#fdfefe] px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#dce5ea] bg-white px-3 py-2.5 focus-within:border-[#54b9c9] focus-within:ring-1 focus-within:ring-[#54b9c9]">
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Type a message..."
              />
              <button type="button" className="flex-shrink-0 rounded-md bg-[#54b9c9] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#489fad]">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Conversation List Toggle */}
      <div className="block border-t border-[#edf2f5] bg-[#f9fbfc] md:hidden">
        <div className="max-h-[120px] overflow-y-auto">
          <div className="flex gap-2 px-3 py-3 sm:px-4">
            {conversations.map((conversation) => (
              <button
                key={conversation.author}
                type="button"
                className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  conversation.active
                    ? "border-[#54b9c9] bg-[#e8f4f7] text-[#2f7f8d]"
                    : "border-[#dfe7ec] bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {conversation.author}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
