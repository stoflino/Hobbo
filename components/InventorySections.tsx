"use client";

import { InventoryGrid } from "@/components/InventoryGrid";
import { splitInventoryItems } from "@/lib/game/inventory";
import type { Item } from "@/lib/types/database";

type InventorySectionsProps = {
  items: Item[];
};

export function InventorySections({ items }: InventorySectionsProps) {
  const { clothing, consumed } = splitInventoryItems(items);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-street-muted">
          Oblečení a vybavení
        </h3>
        <InventoryGrid
          items={clothing}
          emptyMessage="Nic nemáš na sobě ani u sebe."
        />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-street-muted">
          Předměty
        </h3>
        <p className="mb-3 text-xs text-street-muted">
          Tyto věci už ti přidaly staty.
        </p>
        <InventoryGrid
          items={consumed}
          emptyMessage="Zatím nic nesnězeno ani nepoužito."
        />
      </div>
    </div>
  );
}
