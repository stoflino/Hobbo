"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Ceny za jednotlivé úrovně (Level 2 = 50 Kč, Level 3 = 100 Kč...)
const SHELTER_UPGRADE_PRICES: Record<number, number> = {
  1: 50,    // Cena za vylepšení z Lvl 1 na Lvl 2
  2: 100,   // Lvl 2 -> Lvl 3
  3: 180,   // Lvl 3 -> Lvl 4
  4: 280,   // Lvl 4 -> Lvl 5
  5: 400,   // Lvl 5 -> Lvl 6
  6: 550,   // Lvl 6 -> Lvl 7
  7: 750,   // Lvl 7 -> Lvl 8
  8: 1000,  // Lvl 8 -> Lvl 9
  9: 1500,  // Lvl 9 -> Lvl 10 (VÍTĚZSTVÍ)
};

type ShelterModalProps = {
  teamId: string;
  teamName: string;
  currentLevel: number;
  onClose: () => void;
  onUpgradeSuccess: (newLevel: number) => void;
};

export function ShelterModal({
  teamId,
  teamName,
  currentLevel,
  onClose,
  onUpgradeSuccess,
}: ShelterModalProps) {
  const [loading, setLoading] = useState(false);
  const nextLevel = currentLevel + 1;
  const upgradePrice = SHELTER_UPGRADE_PRICES[currentLevel];
  const isMaxLevel = currentLevel >= 10;

  async function handleUpgrade() {
    if (isMaxLevel) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("teams")
      .update({ shelter_level: nextLevel })
      .eq("id", teamId);

    setLoading(false);

    if (error) {
      alert("Nepodařilo se vylepšit přístřešek: " + error.message);
    } else {
      onUpgradeSuccess(nextLevel);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-street-border bg-street-bg p-5 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3 border-b border-street-border pb-3">
          <div>
            <h2 className="text-xl font-bold text-street-accent">🏠 Přístřešek gangu</h2>
            <p className="text-sm text-street-muted">Tým: {teamName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-street-border px-3 py-1.5 text-sm text-street-muted hover:border-street-accent hover:text-street-text"
          >
            Zavřít
          </button>
        </div>

        {/* Zobrazení aktuálního levelu */}
        <div className="rounded-lg border border-street-accent/40 bg-street-card p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-street-muted">Aktualní úroveň</p>
          <p className="text-3xl font-black text-street-accent mt-1">LEVEL {currentLevel} / 10</p>
        </div>

        {isMaxLevel ? (
          <div className="rounded-lg bg-street-health/20 p-4 text-center font-bold text-street-health">
            🏆 Vypadá to, že máte Bunkr na MAX úrovni! Vyhráli jste hru!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-street-border bg-street-card/50 p-3 text-xs space-y-1 text-street-muted">
              <p className="text-street-text font-semibold">Cena dalšího vylepšení (Level {nextLevel}):</p>
              <p className="text-lg font-bold text-street-accent">{upgradePrice} Kč</p>
              <p>⚠️ Peníze vybrané od týmu odevzdejte vedoucímu a potvrďte vylepšení.</p>
            </div>

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-lg bg-street-accent py-3 text-base font-bold uppercase tracking-wider text-black transition hover:bg-street-accent-hover disabled:opacity-50"
            >
              {loading ? "Vylepšuji…" : `Vylepšit na Level ${nextLevel}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}