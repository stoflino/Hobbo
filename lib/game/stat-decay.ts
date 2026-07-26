import { createClient } from "@/lib/supabase/client";
import type { Player } from "@/lib/types/database";

// Intervaly v milisekundách
const HEALTH_INTERVAL_MS = 15_000;      // Zdraví: 15 sekund
const HUNGER_INTERVAL_MS = 10_000;      // Hlad: 10 sekund
const WARMTH_BASE_INTERVAL_MS = 10_000; // Teplo: 10 sekund (základ bez oblečení)

export type PlayerStats = Pick<Player, "health" | "hunger" | "warmth">;

/**
 * Vypočítá nový stav statů na základě uplynulého času a počtu kusů oblečení.
 */
export function calculateDecayedStats(
  stats: PlayerStats,
  lastUpdated: string,
  clothingCount: number = 0,
  now: Date = new Date(),
): PlayerStats & { intervalsElapsed: number } {
  const elapsedMs = now.getTime() - new Date(lastUpdated).getTime();

  // 1. Výpočet intervalů
  const healthIntervals = Math.floor(elapsedMs / HEALTH_INTERVAL_MS);
  const hungerIntervals = Math.floor(elapsedMs / HUNGER_INTERVAL_MS);

  // Teplo klesá pomaleji podle počtu oblečení (10s, 20s, 30s...)
  const warmthIntervalMs = WARMTH_BASE_INTERVAL_MS * (1 + clothingCount);
  const warmthIntervals = Math.floor(elapsedMs / warmthIntervalMs);

  if (healthIntervals <= 0 && hungerIntervals <= 0 && warmthIntervals <= 0) {
    return { ...stats, intervalsElapsed: 0 };
  }

  let { health, hunger, warmth } = stats;

  // 2. Základní odpočet Hladu a Tepla
  hunger = Math.max(0, hunger - hungerIntervals);
  warmth = Math.max(0, warmth - warmthIntervals);

  // 3. Odpočet Zdraví
  // Základní úbytek zdraví (-1 % / 15 s)
  health = Math.max(0, health - healthIntervals);

  // Pokud je Hlad nebo Teplo na 0 %, Zdraví ubývá zrychleně (-1 % / 10 s)
  if (hunger === 0 || warmth === 0) {
    const penaltyIntervals = Math.floor(elapsedMs / 10_000);
    health = Math.max(0, health - penaltyIntervals);
  }

  const maxIntervals = Math.max(healthIntervals, hungerIntervals, warmthIntervals);

  return {
    health,
    hunger,
    warmth,
    intervalsElapsed: maxIntervals,
  };
}

/**
 * Zjistí, kolik kusů oblečení (CLOTHING) hráč vlastní v inventáři.
 */
async function getPlayerClothingCount(playerId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("inventory")
    .select("item_id, items!inner(category)")
    .eq("player_id", playerId)
    .eq("items.category", "CLOTHING");

  return data?.length ?? 0;
}

/**
 * Pouze spočítá náhled statů (např. pro spoluhráče) bez zápisu do databáze.
 */
export function getDecayedPlayerStats(
  player: Pick<Player, "health" | "hunger" | "warmth" | "last_updated">,
  clothingCount: number = 0,
  now: Date = new Date(),
): PlayerStats {
  const lastUpdated = player.last_updated ?? now.toISOString();
  const { health, hunger, warmth } = calculateDecayedStats(
    {
      health: player.health,
      hunger: player.hunger,
      warmth: player.warmth,
    },
    lastUpdated,
    clothingCount,
    now,
  );

  return { health, hunger, warmth };
}

export type SyncedPlayerStats = PlayerStats & { last_updated: string };

/**
 * Synchronizuje odčítání statů s databází pro daného hráče.
 */
export async function syncPlayerStatDecay(
  playerId: string,
): Promise<SyncedPlayerStats | null> {
  const supabase = createClient();

  // 1. Načteme hráče
  const { data: player, error } = await supabase
    .from("players")
    .select("health, hunger, warmth, last_updated")
    .eq("id", playerId)
    .single();

  if (error || !player) return null;

  // 2. Zjistíme, kolik má na sobě oblečení
  const clothingCount = await getPlayerClothingCount(playerId);

  const lastUpdated = player.last_updated ?? new Date().toISOString();
  const decayed = calculateDecayedStats(
    {
      health: player.health,
      hunger: player.hunger,
      warmth: player.warmth,
    },
    lastUpdated,
    clothingCount,
  );

  if (decayed.intervalsElapsed <= 0) {
    return {
      health: player.health,
      hunger: player.hunger,
      warmth: player.warmth,
      last_updated: lastUpdated,
    };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("players")
    .update({
      health: decayed.health,
      hunger: decayed.hunger,
      warmth: decayed.warmth,
      last_updated: now,
    })
    .eq("id", playerId);

  if (updateError) throw new Error(updateError.message);

  return {
    health: decayed.health,
    hunger: decayed.hunger,
    warmth: decayed.warmth,
    last_updated: now,
  };
}