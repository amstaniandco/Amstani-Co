interface ProgressBarProps {
  step: number;
  total: number;
}

const labels = ["Account", "Security", "Finish"];

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const width = Math.min((step / total) * 100, 100);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
        <span>{labels[step - 1] || "Step"}</span>
        <span>{`Step ${step} of ${total}`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-cyan-500 transition-all duration-300" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
