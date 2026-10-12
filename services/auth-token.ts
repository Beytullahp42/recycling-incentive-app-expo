import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "API_TOKEN";
let cachedToken: string | null | undefined;
let revision = 0;

export async function clearAuthToken(): Promise<void> {
  cachedToken = null;
  revision += 1;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    console.warn("Could not remove the saved login token.");
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;

  const readRevision = revision;
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (readRevision === revision) cachedToken = token || null;
  } catch {
    if (readRevision === revision) {
      console.warn("Could not read the saved login token. Please sign in again.");
      await clearAuthToken();
    }
  }
  return cachedToken ?? null;
}

export async function saveAuthToken(token: string): Promise<void> {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("The server did not return a valid login token.");
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  cachedToken = token;
  revision += 1;
}
