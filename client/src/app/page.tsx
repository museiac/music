import Link from "next/link";

const signals = [
  { value: "01", label: "Your artist home" },
  { value: "02", label: "Your release plan" },
  { value: "03", label: "Your next move" },
];

export default function HomePage() {
  return (
    <div className="page-grid -mx-4 -mt-10 overflow-hidden px-4 pb-16 pt-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <section className="mx-auto grid max-w-6xl items-end gap-12 pb-20 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">
            The artist operating system
          </p>
          <h1 className="display-face max-w-4xl text-6xl leading-[0.95] tracking-[-0.04em] text-[#17221d] sm:text-8xl">
            Put your music in motion.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#526158]">
            Museiac gives independent artists one calm place to shape their profile, choose a plan,
            and move from idea to release with intent.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-[#17221d] px-6 py-3 text-sm font-bold text-[#f4f8ee] transition-transform hover:-translate-y-0.5"
            >
              Start your artist profile <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#b9c3ba] bg-[#f5f7f4]/80 px-6 py-3 text-sm font-bold text-[#17221d] hover:border-[#17221d]"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="relative min-h-[330px] overflow-hidden rounded-[2rem] bg-[#17221d] p-7 text-[#f4f8ee] shadow-2xl shadow-[#17221d]/10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[32px] border-[#c8f169]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#b7c9ba]">
              <span>Museiac / 2026</span>
              <span className="rounded-full bg-[#c8f169] px-3 py-1 text-[#17221d]">Live</span>
            </div>
            <div>
              <p className="display-face text-4xl leading-none">Make room for the work.</p>
              <div className="mt-8 h-px bg-[#526158]" />
              <div className="mt-5 grid grid-cols-3 gap-3">
                {signals.map((signal) => (
                  <div key={signal.value}>
                    <p className="text-2xl font-bold text-[#c8f169]">{signal.value}</p>
                    <p className="mt-1 text-xs leading-4 text-[#b7c9ba]">{signal.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 border-t border-[#cbd5cc] py-10 sm:grid-cols-3">
        {[
          ["A clearer beginning", "Create your account, verify your email, and complete the profile that represents you."],
          ["Plans with purpose", "See the active plans available to you, without noise or hidden steps."],
          ["A workspace that grows", "Your authenticated dashboard becomes the home for the next layer of Museiac."],
        ].map(([title, copy]) => (
          <article key={title} className="border-l-2 border-[#c8f169] pl-5">
            <h2 className="text-base font-bold text-[#17221d]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#69766d]">{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
