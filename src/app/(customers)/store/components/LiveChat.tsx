type ChatMessageProps = {
  name: string;
  time: string;
  text: string;
  avatarLabel: string;
  avatarClass?: string;
  bubbleClass?: string;
};

function ChatMessage({
  name,
  time,
  text,
  avatarLabel,
  avatarClass = "bg-gray-200 text-gray-600",
  bubbleClass = "bg-gray-50",
}: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${avatarClass}`}
      >
        {avatarLabel}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-800">{name}</p>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className={`mt-1 rounded-xl px-3 py-2 text-sm ${bubbleClass}`}>{text}</p>
      </div>
    </div>
  );
}

export default function LiveChat() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live Chat
        </h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          9:00 AM to 3:00 PM
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <ChatMessage
          name="Sarah M."
          time="10:42 AM"
          text="Is the Midnight Blue silk stretchy?"
          avatarLabel="S"
        />

        <ChatMessage
          name="California Store"
          time="10:43 AM"
          text="Hi Sarah! It has a very slight natural give, but it's a woven silk so no elastane. Beautiful drape though!"
          avatarLabel="CS"
          avatarClass="bg-[#5fb9c3] text-white"
          bubbleClass="bg-blue-50 border border-blue-100 text-gray-700"
        />

        <ChatMessage
          name="David K."
          time="10:44 AM"
          text="Just bought 5 yards of the brocade. Stunning quality! 😍"
          avatarLabel="D"
        />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <input
          placeholder="Say something..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <button className="text-[#5fb9c3] hover:text-[#3e9ca6]">➤</button>
      </div>

      <button className="mt-4 w-full rounded-xl bg-[#5fb9c3] py-3 text-sm font-semibold text-white hover:bg-[#4aaab4]">
        Join WhatsApp Call
      </button>
    </div>
  );
}
