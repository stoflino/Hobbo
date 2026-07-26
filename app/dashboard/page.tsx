"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CodeRedeemForm } from "@/components/CodeRedeemForm";
import { InventorySections } from "@/components/InventorySections";
import { PlayerCharacter } from "@/components/PlayerCharacter";
import { StatBar } from "@/components/StatBar";
import { TeamRosterModal } from "@/components/TeamRosterModal";
import { TeammateModal } from "@/components/TeammateModal";
import { ShopModal } from "@/components/ShopModal";
import { clearStoredPlayerId, getStoredPlayerId } from "@/lib/auth";
import { extractItemsFromInventoryRows } from "@/lib/game/inventory";
import { getDecayedPlayerStats, syncPlayerStatDecay } from "@/lib/game/stat-decay";
import { createClient } from "@/lib/supabase/client";
import type { Item, Player, PlayerWithTeam } from "@/lib/types/database";

export default function DashboardPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [teammates, setTeammates] = useState<Player[]>([]);
  const [showTeamRoster, setShowTeamRoster] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<Player | null>(null);
  const [teammateInventory, setTeammateInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShop, setShowShop] = useState(false);

  const loadInventory = useCallback(async (id: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("inventory")
      .select("item_id, items(*)")
      .eq("player_id", id);

    setInventory(extractItemsFromInventoryRows(data));
  }, []);

  const applyStatDecay = useCallback(async (id: string) => {
    const synced = await syncPlayerStatDecay(id);
    if (!synced) return null;
    return synced;
  }, []);

  const loadPlayer = useCallback(async (id: string) => {
    const supabase = createClient();

    const { data: playerData, error } = await supabase
      .from("players")
      .select("*, teams(*)")
      .eq("id", id)
      .single();

    if (error || !playerData) {
      clearStoredPlayerId();
      router.replace("/");
      return;
    }

    const syncedStats = await applyStatDecay(id);

    const { teams, ...rest } = playerData as Player & {
      teams: { id: string; name: string } | null;
    };

    const current: PlayerWithTeam = {
      ...rest,
      ...(syncedStats ?? {}),
      teams: teams ?? null,
    };
    setPlayer(current);

    const { data: teamPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", current.team_id)
      .neq("id", id)
      .order("username");

    setTeammates(teamPlayers ?? []);
    await loadInventory(id);
    setLoading(false);
  }, [applyStatDecay, loadInventory, router]);

  useEffect(() => {
    const id = getStoredPlayerId();
    if (!id) {
      router.replace("/");
      return;
    }
    setPlayerId(id);
    loadPlayer(id);
  }, [loadPlayer, router]);

  useEffect(() => {
    if (!playerId) return;

    const interval = setInterval(async () => {
      try {
        const synced = await syncPlayerStatDecay(playerId);
        if (synced) {
          setPlayer((prev) => (prev ? { ...prev, ...synced } : prev));
        }
      } catch (err) {
        console.error("Stat decay sync failed:", err);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [playerId]);

  async function openTeammateModal(teammate: Player) {
    const decayedStats = getDecayedPlayerStats(teammate);
    setSelectedTeammate({ ...teammate, ...decayedStats });

    const supabase = createClient();
    const { data } = await supabase
      .from("inventory")
      .select("item_id, items(*)")
      .eq("player_id", teammate.id);

    setTeammateInventory(extractItemsFromInventoryRows(data));
  }

  function handleLogout() {
    clearStoredPlayerId();
    router.replace("/");
  }

  if (loading || !player || !playerId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-street-bg text-street-muted">
        Načítám hru…
      </div>
    );
  }

  const teamMemberCount = teammates.length + 1;

  return (
    <div className="flex min-h-screen flex-col bg-street-bg">
      <header className="sticky top-0 z-40 border-b border-street-border bg-street-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-street-accent">{player.username}</p>
            <p className="truncate text-sm text-street-muted">
              {player.teams?.name ?? "Bez týmu"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Tlačítko Obchod */}
            <button
              type="button"
              onClick={() => setShowShop(true)}
              className="flex items-center gap-1.5 rounded-lg border border-street-accent/50 bg-street-accent/10 px-3 py-2 text-sm font-bold text-street-accent transition hover:bg-street-accent hover:text-black"
            >
              <span>🛒</span>
              <span>Obchod</span>
            </button>

            {/* Tlačítko Tým */}
            <button
              type="button"
              onClick={() => setShowTeamRoster(true)}
              className="flex items-center gap-1.5 rounded-lg border border-street-border bg-street-card px-3 py-2 text-sm font-semibold text-street-text transition hover:border-street-accent hover:text-street-accent"
              aria-label={`Členové týmu: ${teamMemberCount}`}
            >
              <span aria-hidden>👥</span>
              <span>{teamMemberCount}</span>
            </button>

            {/* Tlačítko Odhlásit */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-street-border px-3 py-2 text-sm font-semibold text-street-muted transition hover:border-street-warmth hover:text-street-warmth"
            >
              Odhlásit
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
        <section className="rounded-xl border border-street-border bg-street-card p-5">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <PlayerCharacter />
            <div className="w-full flex-1 space-y-4">
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
          </div>
        </section>

        <section className="rounded-xl border border-street-border bg-street-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-street-muted">
            Inventář
          </h2>
          <InventorySections items={inventory} />
        </section>

        <div className="mt-auto">
          <CodeRedeemForm
            playerId={playerId}
            onSuccess={({ stats }) => {
              setPlayer((prev) =>
                prev
                  ? {
                      ...prev,
                      ...stats,
                      last_updated: new Date().toISOString(),
                    }
                  : prev,
              );
            }}
            onInventoryRefresh={() => loadInventory(playerId)}
          />
        </div>
      </main>

      {showTeamRoster && (
        <TeamRosterModal
          teammates={teammates}
          teamName={player.teams?.name ?? "Bez týmu"}
          onSelectTeammate={openTeammateModal}
          onClose={() => setShowTeamRoster(false)}
        />
      )}

      <TeammateModal
        player={selectedTeammate}
        inventory={teammateInventory}
        onClose={() => setSelectedTeammate(null)}
      />

      {/* Modal s obchodem */}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
    </div>
  );
}