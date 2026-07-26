export type Player = {
  id: string;
  username: string;
  pin: string;
  team_id: string;
  health: number;
  hunger: number;
  warmth: number;
  last_updated: string;
};

export type Team = {
  id: string;
  name: string;
};


export type Item = {
  id: string;
  name: string;
  health_effect: number;
  hunger_effect: number;
  warmth_effect: number;
  category: string;
  icon?: string;   // <-- Přidáno
  price?: number;  // <-- Přidáno
};

export type ItemCode = {
  code: string;
  item_id: string;
  is_used: boolean;
  used_by_player_id: string | null;
  used_at: string | null;
};

export type InventoryEntry = {
  id: string;
  player_id: string;
  item_id: string;
  acquired_at: string;
  items?: Item;
};

export type PlayerWithTeam = Player & {
  teams: Team | null;
};

export type InventoryItem = InventoryEntry & {
  items: Item;
};

