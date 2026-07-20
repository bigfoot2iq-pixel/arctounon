import { isAddress } from "viem";
import { getSupabaseAdmin, ARC_ALLOWLIST_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/allowlist — save a wallet to the off-chain allowlist.
// Body: { wallet: "0x..." }. No transaction, no gas — the site just records
// the address in Supabase for the owner to distribute mints later.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw =
    body && typeof body === "object" && "wallet" in body
      ? String((body as { wallet: unknown }).wallet ?? "").trim()
      : "";

  if (!isAddress(raw)) {
    return Response.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  // Store lowercased so a wallet can't be added twice via checksum casing.
  const wallet = raw.toLowerCase();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(ARC_ALLOWLIST_TABLE)
      .upsert({ wallet }, { onConflict: "wallet", ignoreDuplicates: true });

    if (error) {
      console.error("[allowlist] insert failed:", error.message);
      return Response.json({ error: "Could not save wallet." }, { status: 500 });
    }
  } catch (e) {
    console.error("[allowlist] supabase error:", e);
    return Response.json({ error: "Allowlist is unavailable." }, { status: 503 });
  }

  return Response.json({ ok: true, wallet });
}
