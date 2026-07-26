"use client";

import type { Item } from "@/lib/types/database";

const CATEGORY_ICONS: Record<string, string> = {
  clothing: "🧥",
  food: "🍞",
  meds: "💊",
  jídlo: "🍞",
  oblečení: "🧥",
};

function getItemIcon(item: Item): string {
  // 1. Pokud má předmět v databázi nastavený konkrétní icon (např. 🍎), použije se ten!
  if (item.icon && item.icon.trim() !== "") {
    return item.icon;
  }
  
  // 2. Záložní logika podle kategorie, pokud icon v databázi chybí
  const key = (item.category || "").toLowerCase();
  return CATEGORY_ICONS[key] ?? "📦";
}

type InventoryGridProps = {
  items: Item[];
  emptyMessage?: string;
};

export function InventoryGrid({
  items,
  emptyMessage = "Zatím nic nemáš.",
}: InventoryGridProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-street-border bg-street-card/50 px-4 py-8 text-center text-sm text-street-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="flex flex-col items-center gap-2 rounded-lg border border-street-border bg-street-card p-3 text-center"
        >
          <span className="text-3xl" aria-hidden>
            {getItemIcon(item)}
          </span>
          <span className="text-sm font-semibold leading-tight text-street-text">
            {item.name}
          </span>
          <span className="text-xs uppercase tracking-wider text-street-muted">
            {item.category}
          </span>
        </div>
      ))}
    </div>
  );
}