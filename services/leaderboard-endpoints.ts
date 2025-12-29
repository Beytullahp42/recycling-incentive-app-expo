import { LeaderboardResponse } from "@/models/Leaderboard";
import api from "@/services/axios-config";

export async function getLeaderboardCurrentSeason(): Promise<LeaderboardResponse> {
  const response = await api.get("/leaderboard/current-season");
  return response.data;
}

export async function getLeaderboardAllTime(): Promise<LeaderboardResponse> {
  const response = await api.get("/leaderboard/all-time");
  return response.data;
}
