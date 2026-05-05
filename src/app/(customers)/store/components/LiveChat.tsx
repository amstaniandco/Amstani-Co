import { Languages, Lock } from "lucide-react";
import { useStore } from "../../../../context/StoreContext";

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
  bubbleClass = "bg-gray-50 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
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
          <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">{name}</p>
          <span className="text-xs text-gray-400 dark:text-slate-400">{time}</span>
        </div>
        <p className={`mt-1 rounded-xl px-3 py-2 text-sm ${bubbleClass}`}>{text}</p>
      </div>
    </div>
  );
}

type LiveChatProps = {
  className?: string;
  hideWrapper?: boolean;
};

export default function LiveChat({ className = "", hideWrapper = false }: LiveChatProps) {
  const store = useStore();
  return (
    <div className={`${hideWrapper ? "flex h-full flex-col" : "ui-panel flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800"} ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live Chat
        </h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-slate-700 dark:text-sky-300">
          9:00 AM to 3:00 PM
        </span>
      </div>

      <div className="ui-subpanel mt-3 flex items-center gap-2 rounded-xl border border-[#d6edf0] bg-[#f2fbfc] px-3 py-2 text-xs font-medium text-[#3f98a3] dark:border-slate-600 dark:bg-slate-700 dark:text-sky-300">
        <Languages className="h-4 w-4" />
        Store owner languages: {store?.settings?.languages?.join(", ") ?? 'English, Spanish, Arabic'}
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
          avatarClass="bg-[#68B8C1] text-white"
          bubbleClass="bg-blue-50 border border-blue-100 text-gray-700 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-100"
        />

        <ChatMessage
          name="David K."
          time="10:44 AM"
          text="Just bought 5 yards of the brocade. Stunning quality! 😍"
          avatarLabel="D"
        />
      </div>

      <div className="ui-subpanel mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
        <input
          placeholder="Say something..."
          className="ui-input w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <button className="text-[#68B8C1] hover:text-[#4f9ea7]">➤</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-xl border border-[#68B8C1] py-3 text-sm font-semibold text-[#68B8C1] transition hover:bg-[#eef9fa] dark:border-[#4f9ea7] dark:text-[#7dc8d1] dark:hover:bg-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            Private Chat
          </span>
        </button>
        <button className="rounded-xl bg-[#68B8C1] py-3 text-sm font-semibold text-white hover:bg-[#4f9ea7]">
          Join WhatsApp Call
        </button>
      </div>
    </div>
  );
}
