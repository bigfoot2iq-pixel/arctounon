import { getSupabaseAdmin, ARC_ALLOWLIST_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/allowlist/download?format=txt|json
// Public export of collected wallets as a downloadable file.
export async function GET(request: Request) {
  const url = new URL(request.url);

  type Row = { wallet: string; created_at: string };
  const rows: Row[] = [];
  try {
    const supabase = getSupabaseAdmin();
    // PostgREST caps a single .select() at its max-rows setting (1000 by
    // default), so a naive query silently drops everyone past the first 1000.
    // Page through in fixed batches until a short page signals the end.
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from(ARC_ALLOWLIST_TABLE)
        .select("wallet, created_at")
        .order("created_at", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) {
        console.error("[allowlist/download] query failed:", error.message);
        return Response.json({ error: "Query failed." }, { status: 500 });
      }
      const batch = (data ?? []) as Row[];
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }
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
