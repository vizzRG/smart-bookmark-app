"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User }) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Smart Bookmarks
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-full bg-gray-800/50 py-1.5 pl-1.5 pr-4 ring-1 ring-gray-700/50">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="h-7 w-7 rounded-full ring-2 ring-gray-700"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="hidden text-sm text-gray-300 sm:inline">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-800/80 px-3.5 py-2 text-sm font-medium text-gray-400 ring-1 ring-gray-700/50 transition-all hover:bg-gray-700 hover:text-white hover:ring-gray-600 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
