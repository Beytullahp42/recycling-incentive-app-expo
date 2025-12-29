export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
}

export interface UserStats {
  rank: number | string;
  username: string;
  points: number;
}

export interface LeaderboardResponse {
  title: string;
  type: "season" | "all_time";
  starts_at?: string;
  ends_at?: string;
  month_number?: number;
  year?: number;
  message?: string;
  leaderboard: LeaderboardEntry[];
  user_stats: UserStats | null;
}
