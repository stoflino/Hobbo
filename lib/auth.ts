const PLAYER_ID_KEY = "bezdomovci_player_id";

export function getStoredPlayerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function setStoredPlayerId(playerId: string): void {
  localStorage.setItem(PLAYER_ID_KEY, playerId);
}

export function clearStoredPlayerId(): void {
  localStorage.removeItem(PLAYER_ID_KEY);
}
