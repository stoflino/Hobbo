import type { Item } from "@/lib/types/database";

type InventoryRow = {
  item_id: string;
  items: Item | Item[] | null;
};

export function extractItemsFromInventoryRows(
  rows: InventoryRow[] | null | undefined,
): Item[] {
  if (!rows) return [];

  return rows.flatMap((row) => {
    if (!row.items) return [];
    if (Array.isArray(row.items)) return row.items;
    return [row.items];
  });
}

function normalizeCategory(category: string): string {
  return category.trim().toUpperCase();
}

export function splitInventoryItems(items: Item[]): {
  clothing: Item[];
  consumed: Item[];
} {
  const clothing: Item[] = [];
  const consumed: Item[] = [];

  for (const item of items) {
    const category = normalizeCategory(item.category);
    if (category === "CLOTHING") {
      clothing.push(item);
    } else if (category === "FOOD" || category === "MEDS") {
      consumed.push(item);
    }
  }

  return { clothing, consumed };
}
