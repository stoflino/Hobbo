import { createClient } from "@/lib/supabase/client";
import type { Item, Player } from "@/lib/types/database";

export type RedeemResult = {
  item: Item;
  player: Pick<Player, "health" | "hunger" | "warmth">;
};

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export async function redeemCode(
  playerId: string,
  code: string,
): Promise<RedeemResult> {
  const supabase = createClient();
  const normalizedCode = code.trim().toUpperCase();

  const { data: itemCode, error: codeError } = await supabase
    .from("item_codes")
    .select("code, item_id, is_used")
    .eq("code", normalizedCode)
    .eq("is_used", false)
    .maybeSingle();

  if (codeError) throw new Error(codeError.message);
  if (!itemCode) throw new Error("Kód neexistuje nebo už byl použit.");

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemCode.item_id)
    .single();

  if (itemError || !item) throw new Error("Předmět pro tento kód nebyl nalezen.");

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("health, hunger, warmth")
    .eq("id", playerId)
    .single();

  if (playerError || !player) throw new Error("Hráč nebyl nalezen.");

  const updatedStats = {
    health: clampStat(player.health + item.health_effect),
    hunger: clampStat(player.hunger + item.hunger_effect),
    warmth: clampStat(player.warmth + item.warmth_effect),
    last_updated: new Date().toISOString(),
  };

  const { error: updatePlayerError } = await supabase
    .from("players")
    .update(updatedStats)
    .eq("id", playerId);

  if (updatePlayerError) throw new Error(updatePlayerError.message);

  const { error: markUsedError } = await supabase
    .from("item_codes")
    .update({
      is_used: true,
      used_by_player_id: playerId,
      used_at: new Date().toISOString(),
    })
    .eq("code", normalizedCode);

  if (markUsedError) throw new Error(markUsedError.message);

  const { error: inventoryError } = await supabase.from("inventory").insert({
    player_id: playerId,
    item_id: itemCode.item_id,
  });

  if (inventoryError) throw new Error(inventoryError.message);

  return { item, player: updatedStats };
}
