"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/types/database";

type ShopModalProps = {
  onClose: () => void;
};

export function ShopModal({ onClose }: ShopModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShopItems() {
      const supabase = createClient();
      const { data } = await supabase
        .from("items")
        .select("*")
        .order("price", { ascending: true });

      setItems(data ?? []);
      setLoading(false);
    }
    loadShopItems();
  }, []);

  // Rozdělení předmětů podle kategorií
  const foodItems = items.filter((i) => i.category?.toUpperCase() === "FOOD");
  const medsItems = items.filter((i) => i.category?.toUpperCase() === "MEDS");
  const clothingItems = items.filter((i) => i.category?.toUpperCase() === "CLOTHING");

  // Pomocná funkce pro vykreslení karty jednoho předmětu
  function renderItemCard(item: Item) {
    const isClothing = item.category?.toUpperCase() === "CLOTHING";

    return (
      <div
        key={item.id}
        className="flex items-center justify-between gap-3 rounded-lg border border-street-border bg-street-card p-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0">{item.icon || "📦"}</span>
          <div className="min-w-0">
            <p className="font-semibold text-street-text truncate">{item.name}</p>

            {/* Efekty předmětu */}
            <div className="flex flex-wrap gap-2 text-xs">
              {isClothing ? (
                <span className="text-street-warmth font-semibold">
                  🔥 Teplo ubývá pomaleji
                </span>
              ) : (
                <>
                  {/* Kladný a záporný Hlad */}
                  {item.hunger_effect > 0 && (
                    <span className="text-street-hunger">+{item.hunger_effect}% Hlad</span>
                  )}
                  {item.hunger_effect < 0 && (
                    <span className="text-street-warmth font-semibold">{item.hunger_effect}% Hlad</span>
                  )}

                  {/* Kladné a záporné Teplo */}
                  {item.warmth_effect > 0 && (
                    <span className="text-street-warmth">+{item.warmth_effect}% Teplo</span>
                  )}
                  {item.warmth_effect < 0 && (
                    <span className="text-street-warmth font-semibold">{item.warmth_effect}% Teplo</span>
                  )}

                  {/* Kladné a záporné Zdraví */}
                  {item.health_effect > 0 && (
                    <span className="text-street-health">+{item.health_effect}% Zdraví</span>
                  )}
                  {item.health_effect < 0 && (
                    <span className="text-street-warmth font-semibold">{item.health_effect}% Zdraví</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="rounded bg-street-accent/20 px-2.5 py-1 text-sm font-bold text-street-accent">
            {item.price ?? 0} Kč
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-street-border bg-street-bg p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-street-border pb-3">
          <div>
            <h2 className="text-xl font-bold text-street-accent">🛒 Obchod</h2>
            <p className="text-xs text-street-muted">Přehled zboží </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-street-border px-3 py-1.5 text-sm text-street-muted hover:border-street-accent hover:text-street-text"
          >
            Zavřít
          </button>
        </div>

        {/* Upozornění pro hráče */}
        <div className="mb-4 rounded-lg border border-street-accent/30 bg-street-accent/10 p-3 text-xs text-street-accent">
          ⚠️ <strong>Jak nakupovat:</strong> Předměty si kupuješ v obchodě za peníze. Dostaneš kartičku s kódem, který pak zadáš na hlavní stránce!
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-street-muted">Načítám ceník…</div>
        ) : (
          <div className="overflow-y-auto space-y-6 pr-1">
            {/* Sekce 1: Jídlo */}
            {foodItems.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-street-hunger flex items-center gap-1.5">
                  <span>�</span> Jídlo a Pití
                </h3>
                <div className="space-y-2">
                  {foodItems.map((item) => renderItemCard(item))}
                </div>
              </div>
            )}

            {/* Sekce 2: Léky */}
            {medsItems.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-street-health flex items-center gap-1.5">
                  <span>💊</span> Léky a první pomoc
                </h3>
                <div className="space-y-2">
                  {medsItems.map((item) => renderItemCard(item))}
                </div>
              </div>
            )}

            {/* Sekce 3: Oblečení */}
            {clothingItems.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-street-warmth flex items-center gap-1.5">
                  <span>🧥</span> Oblečení a vybavení
                </h3>
                <div className="space-y-2">
                  {clothingItems.map((item) => renderItemCard(item))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}