export interface Rival {
  username: string;
  gap: number;
}

export interface DashboardStats {
  score: number;
  total_items: number;
  rank: number | string;
  rival: Rival | null;
}
