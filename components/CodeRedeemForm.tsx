"use client";

import { useState, type FormEvent } from "react";
import { redeemCode } from "@/lib/game/redeem-code";
import type { Item, Player } from "@/lib/types/database";

type CodeRedeemFormProps = {
  playerId: string;
  onSuccess: (result: { item: Item; stats: Pick<Player, "health" | "hunger" | "warmth"> }) => void;
  onInventoryRefresh: () => void;
};

export function CodeRedeemForm({
  playerId,
  onSuccess,
  onInventoryRefresh,
}: CodeRedeemFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmed = code.trim();
    if (trimmed.length !== 4) {
      setMessage({ type: "error", text: "Kód musí mít přesně 8 znaků." });
      return;
    }

    setLoading(true);
    try {
      const result = await redeemCode(playerId, trimmed);
      setCode("");
      setMessage({ type: "success", text: `Získáno: ${result.item.name}!` });
      onSuccess({ item: result.item, stats: result.player });
      onInventoryRefresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Nepodařilo se použít kód.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border-2 border-street-accent/40 bg-street-card p-5 shadow-lg shadow-black/30">
      <h2 className="mb-1 text-lg font-bold uppercase tracking-wide text-street-accent">
        Zadej kód z kartičky
      </h2>
      <p className="mb-4 text-sm text-street-muted">8místný kód z fyzické kartičky</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          placeholder="XXXXXXXX"
          className="w-full rounded-lg border-2 border-street-border bg-street-bg px-4 py-5 text-center text-2xl font-bold tracking-[0.35em] text-street-text placeholder:tracking-normal placeholder:text-street-muted focus:border-street-accent focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading || code.length !== 4}
          className="w-full rounded-lg bg-street-accent py-4 text-lg font-bold uppercase tracking-wider text-black transition hover:bg-street-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Ověřuji…" : "Použít kód"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-center text-sm font-semibold ${
            message.type === "success"
              ? "bg-street-health/20 text-street-health"
              : "bg-street-warmth/20 text-street-warmth"
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
