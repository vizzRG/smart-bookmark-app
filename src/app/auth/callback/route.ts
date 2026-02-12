import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Always use the origin from the actual request URL.
        // This preserves http:// on localhost and https:// on Vercel.
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/?error=auth`);
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(`${origin}/?error=auth`);
  }
}
