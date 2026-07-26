"use client";

import { StatBar } from "@/components/StatBar";
import { InventorySections } from "@/components/InventorySections";
import type { Item, Player } from "@/lib/types/database";

type TeammateModalProps = {
  player: Player | null;
  inventory: Item[];
  onClose: () => void;
};

export function TeammateModal({ player, inventory, onClose }: TeammateModalProps) {
  if (!player) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-street-border bg-street-bg p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="teammate-modal-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="teammate-modal-title" className="text-xl font-bold text-street-accent">
              {player.username}
            </h2>
            <p className="text-sm text-street-muted">Detail spoluhráče · aktuální stav</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-street-border px-3 py-1.5 text-sm text-street-muted transition hover:border-street-accent hover:text-street-text"
          >
            Zavřít
          </button>
        </div>

        <div className="space-y-3">
          <StatBar
            label="Zdraví"
            value={player.health}
            colorClass="bg-street-health"
            trackClass="bg-street-health/20"
          />
          <StatBar
            label="Hlad"
            value={player.hunger}
            colorClass="bg-street-hunger"
            trackClass="bg-street-hunger/20"
          />
          <StatBar
            label="Teplo"
            value={player.warmth}
            colorClass="bg-street-warmth"
            trackClass="bg-street-warmth/20"
          />
        </div>

        <div className="mt-5">
          <InventorySections items={inventory} />
        </div>
      </div>
    </div>
  );
}
