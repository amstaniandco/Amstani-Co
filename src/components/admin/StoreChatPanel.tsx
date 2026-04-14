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

export default function StoreChatPanel({ title, rightLabel }: StoreChatPanelProps) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d8e1e7] bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-[#e5edf1] bg-[#f8fbfc] px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full border border-[#d7e0e6] bg-white px-3 py-1 text-xs text-slate-600">
          {rightLabel}
        </span>
      </div>

      <div className="grid min-h-[280px] grid-cols-1 border-b border-[#edf2f5] md:grid-cols-[230px_1fr_260px]">
        <div className="border-b border-[#edf2f5] bg-[#fdfefe] md:border-b-0 md:border-r">
          {conversations.map((conversation) => (
            <div
              key={conversation.author}
              className={`border-b border-[#edf2f5] px-4 py-3 text-sm ${
                conversation.active ? "bg-[#eef8fb]" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{conversation.author}</span>
                <span>{conversation.time}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-800">{conversation.preview}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between bg-[#fdfefe] px-4 py-4 md:border-r md:border-[#edf2f5]">
          <div className="rounded-[16px] bg-[#54b9c9] p-4 text-sm text-white shadow-sm">
            <p className="text-xs text-white/80">Customer Message</p>
            <p className="mt-2">Hi, I just received my order, but the surface is shattered. Can I get a refund? (Claim #5744)</p>
          </div>
          <div className="mt-4 flex-1" />
          <div className="flex items-center gap-2 rounded-2xl border border-[#dce5ea] bg-[#f7fafb] px-4 py-3 text-sm text-slate-500">
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
              placeholder="Type a message..."
            />
            <button type="button" className="rounded-full bg-[#54b9c9] px-3 py-1.5 text-white">
              Send
            </button>
          </div>
        </div>

        <div className="flex items-end justify-end bg-[#fdfefe] px-4 py-4 md:px-6">
          <div className="max-w-[220px] rounded-[18px] rounded-br-md bg-[#e8ecef] px-4 py-3 text-sm text-slate-700 shadow-sm">
            I am very sorry to hear that. Can you provide pictures of the damaged jar and the shipping box?
          </div>
        </div>
      </div>
    </section>
  );
}
