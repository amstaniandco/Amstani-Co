interface ClaimFormProps {
  issueType: string;
  message: string;
  setIssueType: (value: string) => void;
  setMessage: (value: string) => void;
  onSubmit: () => void;
}

export default function ClaimForm({ issueType, message, setIssueType, setMessage, onSubmit }: ClaimFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 w-full shadow-sm">
      <h2 className="text-base font-bold text-gray-800 tracking-widest uppercase mb-1">CLAIM</h2>
      <p className="text-sm text-gray-500 mb-5">Please let us know the issue you are facing</p>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Issue Type</label>
        <div className="relative">
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
          >
            <option value="" disabled>Select Issue Type</option>
            <option value="damaged">Damaged Item</option>
            <option value="missing">Missing Item</option>
            <option value="refund">Refund</option>
            <option value="wrong">Wrong Item</option>
            <option value="other">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please type your message here"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
      </div>

      <button
        onClick={onSubmit}
        className="w-full py-3 bg-teal-500 hover:bg-teal-600 transition-colors text-white text-sm font-semibold rounded-xl"
      >
        Submit
      </button>
    </div>
  );
}
