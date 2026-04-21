type StoreChatPanelProps = {
  title: string;
  rightLabel: string;
  storeId: string;
  panelType?: "customer" | "owner";
};

type Conversation = {
  author: string;
  time: string;
  preview: string;
  active: boolean;
};

type Message = {
  sender: "customer" | "store";
  author: string;
  text: string;
};

type PanelData = {
  customer: {
    conversations: Conversation[];
    messages: Message[];
  };
  owner: {
    conversations: Conversation[];
    messages: Message[];
  };
};

const storeChatData: Record<string, PanelData> = {
  "STN-8232": {
    customer: {
      conversations: [
        { author: "Martha K.", time: "3m ago", preview: "Need help with replacement size...", active: true },
        { author: "Bruno T.", time: "1h ago", preview: "Shipment arrived, thank you.", active: false },
      ],
      messages: [
        { sender: "customer", author: "Martha K.", text: "Can I exchange this item for a larger size?" },
        { sender: "store", author: "Store", text: "Yes, please share your order number and we will arrange it." },
      ],
    },
    owner: {
      conversations: [
        { author: "Elina Rodriguez", time: "Now", preview: "Weekly report looks healthy.", active: true },
        { author: "Ops Team", time: "Today", preview: "Any risk flags for this week?", active: false },
      ],
      messages: [
        { sender: "customer", author: "Elina Rodriguez", text: "All operations stable. No critical tickets." },
        { sender: "store", author: "Admin", text: "Great. Keep the fulfillment rate above 97%." },
      ],
    },
  },
  "STN-8905": {
    customer: {
      conversations: [
        { author: "Marcus H.", time: "2m ago", preview: "My item arrived damaged!...", active: true },
        { author: "Lina W.", time: "Today", preview: "Shipping inquiry, international ...", active: false },
      ],
      messages: [
        { sender: "customer", author: "Marcus H.", text: "Hi, I just received my order, but the surface is shattered. Can I get a refund? (Claim #5744)" },
        { sender: "store", author: "Store", text: "I am very sorry to hear that. Can you provide pictures of the damaged jar and the shipping box?" },
      ],
    },
    owner: {
      conversations: [
        { author: "Rajesh Patel", time: "8m ago", preview: "Please review suspension status.", active: true },
        { author: "Compliance Team", time: "Today", preview: "Pending verification documents.", active: false },
      ],
      messages: [
        { sender: "customer", author: "Rajesh Patel", text: "I have uploaded the requested invoices for verification." },
        { sender: "store", author: "Admin", text: "Received. We will review and update your status within 24 hours." },
      ],
    },
  },
  "STN-8895": {
    customer: {
      conversations: [
        { author: "No recent chats", time: "-", preview: "Dormant store with no active chat traffic.", active: true },
      ],
      messages: [
        { sender: "store", author: "System", text: "No customer conversations found for this store in the last 30 days." },
      ],
    },
    owner: {
      conversations: [
        { author: "Sarah Jenkins", time: "Yesterday", preview: "Planning to relaunch inventory.", active: true },
      ],
      messages: [
        { sender: "customer", author: "Sarah Jenkins", text: "I will reactivate the catalog next week after stock arrives." },
        { sender: "store", author: "Admin", text: "Please notify us once products are live to lift dormant flag." },
      ],
    },
  },
  "STN-8901": {
    customer: {
      conversations: [
        { author: "No recent chats", time: "-", preview: "Dormant store with no active chat traffic.", active: true },
      ],
      messages: [
        { sender: "store", author: "System", text: "No customer conversations found for this store in the last 30 days." },
      ],
    },
    owner: {
      conversations: [
        { author: "Support", time: "2d ago", preview: "Store owner requested onboarding refresh.", active: true },
      ],
      messages: [
        { sender: "customer", author: "Support", text: "Please confirm if training session can be scheduled for Monday." },
        { sender: "store", author: "Admin", text: "Confirmed. You will receive the onboarding link shortly." },
      ],
    },
  },
};

const fallbackData: PanelData = {
  customer: {
    conversations: [{ author: "No chat", time: "-", preview: "No data available.", active: true }],
    messages: [{ sender: "store", author: "System", text: "No messages available for this store." }],
  },
  owner: {
    conversations: [{ author: "No chat", time: "-", preview: "No data available.", active: true }],
    messages: [{ sender: "store", author: "System", text: "No messages available for this store." }],
  },
};
export default function StoreChatPanel({
  title,
  rightLabel,
  storeId,
  panelType = "customer",
}: StoreChatPanelProps) {
  const panelData = (storeChatData[storeId] ?? fallbackData)[panelType];
  const conversations = panelData.conversations;
  const messages = panelData.messages;

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
                  {conversation.author.charAt(0).toUpperCase()}
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
          {panelType === "owner" && (
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
          )}
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
