import { Pause, Play, Store, Trash2 } from "lucide-react";

const tracks = [
  { id: 1, name: "name_of_the_file_08357892.mp3" },
  { id: 2, name: "name_of_the_file_08357892.mp3", active: true },
  { id: 3, name: "name_of_the_file_08357892.mp3" },
  { id: 4, name: "name_of_the_file_08357892.mp3" },
  { id: 5, name: "name_of_the_file_08357892.mp3" },
  { id: 6, name: "name_of_the_file_08357892.mp3" },
];

export default function OwnerMusicPage() {
  return (
    <>
          <section className="flex items-center gap-2 text-slate-900">
            <Store className="h-5 w-5 text-[#65bbc5]" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Name of the store here</h1>
          </section>

          <section className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="pt-1 text-[18px] font-semibold tracking-[0.06em] text-slate-900">Upload music file</h2>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  className="inline-flex h-11 w-full min-w-[140px] items-center justify-center rounded-2xl border border-slate-900 bg-white px-6 text-[17px] font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
                >
                  Upload File
                </button>
                <p className="text-[13px] italic text-slate-700">Only mp3 file type supported</p>
              </div>
            </div>

            <div className="mt-4 border-b border-[#99adc4]" />

            <div className="mt-3 space-y-2">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 sm:gap-5 sm:px-4 ${track.active ? "bg-[#b9d8de]" : "bg-transparent"}`}
                >
                  <div className="w-6 shrink-0 text-slate-900 sm:w-7">
                    {track.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </div>

                  <p className="min-w-0 truncate text-[15px] tracking-[0.01em] text-slate-800 sm:text-[17px]">{track.name}</p>

                  <button type="button" className="ml-auto shrink-0 text-red-400 transition hover:text-red-500" aria-label="Delete track">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
    </>
  );
}
