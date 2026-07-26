"use client";

import { getDecayedPlayerStats } from "@/lib/game/stat-decay";
import type { Player } from "@/lib/types/database";

type TeamRosterModalProps = {
  teammates: Player[];
  teamName: string;
  onSelectTeammate: (teammate: Player) => void;
  onClose: () => void;
};

export function TeamRosterModal({
  teammates,
  teamName,
  onSelectTeammate,
  onClose,
}: TeamRosterModalProps) {
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
        aria-labelledby="team-roster-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="team-roster-title" className="text-xl font-bold text-street-accent">
              Tým
            </h2>
            <p className="text-sm text-street-muted">{teamName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-street-border px-3 py-1.5 text-sm text-street-muted transition hover:border-street-accent hover:text-street-text"
          >
            Zavřít
          </button>
        </div>

        {teammates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-street-border px-4 py-6 text-center text-sm text-street-muted">
            Jsi sám v týmu.
          </p>
        ) : (
          <ul className="space-y-2">
            {teammates.map((teammate) => {
              const stats = getDecayedPlayerStats(teammate);

              return (
              <li key={teammate.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTeammate(teammate);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-street-border bg-street-card px-4 py-3 text-left transition hover:border-street-accent"
                >
                  <span className="font-semibold text-street-text">{teammate.username}</span>
                  <span className="text-xs text-street-muted">
                    ❤️ {stats.health}% · 🍗 {stats.hunger}% · 🔥 {stats.warmth}%
                  </span>
                </button>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
