import { LeaderboardResponse } from "@/models/Leaderboard";
import api from "@/services/axios-config";

export async function getLeaderboardCurrentSeason(): Promise<LeaderboardResponse> {
  const response = await api.get("/leaderboard/current-season");
  if (response.status !== 200 || !Array.isArray(response.data?.leaderboard)) {
    throw new Error(response.data?.message || "Could not load the leaderboard.");
  }
  return response.data;
}

export async function getLeaderboardAllTime(): Promise<LeaderboardResponse> {
  const response = await api.get("/leaderboard/all-time");
  if (response.status !== 200 || !Array.isArray(response.data?.leaderboard)) {
    throw new Error(response.data?.message || "Could not load the leaderboard.");
  }
  return response.data;
}
