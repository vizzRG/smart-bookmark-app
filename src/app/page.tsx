import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* ── Background Effects ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-100 w-100 rounded-full bg-purple-500/8 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/4 h-75 w-75 rounded-full bg-cyan-500/8 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-gray-950 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-gray-950 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-800/50 px-4 py-1.5 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-400">
            Real-time bookmark sync
          </span>
        </div>

        {/* Logo Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/25 ring-1 ring-blue-400/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="max-w-lg text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Smart{" "}
          <span className="bg-linear-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Bookmarks
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-md text-base leading-relaxed text-gray-400 sm:text-lg">
          Save, organize, and access your bookmarks from anywhere.
          <br className="hidden sm:inline" />
          <span className="text-gray-500">
            {" "}
            Real-time sync across all your tabs.
          </span>
        </p>

        {/* Auth Button */}
        <div className="mt-10">
          <AuthButton />
        </div>

        {/* Divider */}
        <div className="mt-10 flex items-center gap-4 w-full max-w-xs">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-gray-700" />
          <span className="text-xs text-gray-600">FEATURES</span>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-gray-700" />
        </div>

        {/* Feature Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="group flex flex-col items-center gap-2 rounded-xl border border-gray-800/80 bg-gray-900/50 px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition-transform duration-300 group-hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 sm:text-sm">
              Real-time
            </span>
          </div>

          <div className="group flex flex-col items-center gap-2 rounded-xl border border-gray-800/80 bg-gray-900/50 px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 sm:text-sm">
              Private
            </span>
          </div>

          <div className="group flex flex-col items-center gap-2 rounded-xl border border-gray-800/80 bg-gray-900/50 px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 transition-transform duration-300 group-hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400 sm:text-sm">
              Cloud Sync
            </span>
          </div>
        </div>

        {/* Trust line */}
        <p className="mt-10 text-xs text-gray-600">
          Powered by <span className="text-gray-500">Next.js</span>
          {" · "}
          <span className="text-gray-500">Supabase</span>
          {" · "}
          <span className="text-gray-500">Tailwind CSS</span>
        </p>
      </div>
    </main>
  );
}
