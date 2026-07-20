import { getSupabaseAdmin, ARC_ALLOWLIST_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/allowlist/download?format=txt|json
// Public export of collected wallets as a downloadable file.
export async function GET(request: Request) {
  const url = new URL(request.url);

  let rows: { wallet: string; created_at: string }[];
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(ARC_ALLOWLIST_TABLE)
      .select("wallet, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[allowlist/download] query failed:", error.message);
      return Response.json({ error: "Query failed." }, { status: 500 });
    }
    rows = (data ?? []) as typeof rows;
  } catch (e) {
    console.error("[allowlist/download] supabase error:", e);
    return Response.json({ error: "Allowlist is unavailable." }, { status: 503 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const format = (url.searchParams.get("format") ?? "txt").toLowerCase();

  if (format === "json") {
    return new Response(JSON.stringify(rows, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="arc_allowlist_${stamp}.json"`,
      },
    });
  }

  const body = rows.map((r) => r.wallet).join("\n");
  return new Response(body ? body + "\n" : "", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="arc_allowlist_${stamp}.txt"`,
    },
  });
}
