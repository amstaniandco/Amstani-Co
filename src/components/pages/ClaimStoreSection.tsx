export default function ClaimStoreSection() {
  return (
    <section data-tutorial-id="customer-claim-store" className="bg-[#f3f4f6] py-6 sm:py-8 dark:bg-[#0b1220]">
      <div className="mx-auto w-full max-w-[1450px] px-4 sm:px-6">
        <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-slate-300/30 bg-gradient-to-r from-[#201f19] via-[#25231c] to-[#2d3128] px-4 py-8 shadow-sm sm:min-h-[520px] sm:px-10 sm:py-12 lg:px-16 lg:py-14 dark:border-slate-700/40">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(106,206,218,0.11),transparent_50%)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-full w-1/2 bg-[radial-gradient(circle_at_20%_80%,rgba(106,206,218,0.11),transparent_50%)]" />

          <div className="relative grid min-h-[430px] items-center gap-x-4 gap-y-8 lg:gap-y-4 lg:grid-cols-[minmax(0,1fr)_560px]">
            <div className="text-center lg:text-left">
              <span className="mx-auto inline-flex items-center rounded-md bg-[#2f3d39] px-3 py-1 text-xs font-semibold tracking-wide text-[#7fd3df] lg:mx-0">
                FOR STORE OWNERS
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-100 sm:text-4xl lg:text-5xl">
                Claim Your State.
                <br />
                <span className="!font-bold text-[#73c7d4]">Own Your Store.</span>
              </h2>

              <p className="mx-auto mt-4 max-w-[620px] text-xl leading-relaxed text-slate-300 sm:mt-5 sm:text-2xl lg:mx-0 lg:text-[26px]">
                <span className="!font-semibold">Connect with verified store</span> owners in your state to secure a
                location and start selling now!
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] px-1 sm:px-0">
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-[#f8c526] via-[#79d2df] to-[#4da3b0] opacity-80 blur-[1px]" />
              <div className="relative overflow-hidden rounded-[24px] border border-[#86d7e2]/70 bg-[#0f2026] px-4 py-5 shadow-[0_22px_32px_rgba(0,0,0,0.45)] sm:rotate-2 sm:rounded-[30px] sm:px-7 sm:py-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(129,212,223,0.18),transparent_35%),radial-gradient(circle_at_88%_92%,rgba(240,201,56,0.12),transparent_34%)]" />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="h-10 w-10 rounded-sm bg-[repeating-linear-gradient(135deg,#76d0df_0_4px,transparent_4px_9px)] sm:h-11 sm:w-11" />
                  <div className="text-right text-xs text-slate-400">
                    <p>GOLDEN TICKET ID</p>
                    <p className="text-lg font-semibold text-slate-200 sm:text-2xl">AM-882-991</p>
                  </div>
                </div>

                <div className="relative z-10 mt-4">
                  <p className="text-3xl font-extrabold tracking-wide text-slate-100 sm:text-4xl">STORE OWNER</p>
                  <p className="mt-1 text-xs tracking-[0.2em] text-[#6dc6d5] sm:text-sm sm:tracking-[0.28em]">EXCLUSIVE MEMBERSHIP</p>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl border border-[#54432f] bg-[#2b2a1f] sm:h-16 sm:w-16 sm:rounded-2xl" />
                  <p className="text-sm text-slate-400 sm:text-base">Limited Edition Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
