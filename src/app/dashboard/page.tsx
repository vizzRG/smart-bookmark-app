import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";
import type { Bookmark } from "@/types";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <DashboardClient
          userId={user.id}
          initialBookmarks={(bookmarks as Bookmark[]) ?? []}
        />
      </main>
    </div>
  );
}
