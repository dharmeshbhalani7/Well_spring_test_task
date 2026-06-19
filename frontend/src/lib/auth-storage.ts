const TOKEN_KEY = "wellspring_token";
const CREATOR_KEY = "wellspring_creator";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CREATOR_KEY);
}

export function getStoredCreator(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CREATOR_KEY) ?? null;
}

export function setStoredCreator(creatorJson: string): void {
  localStorage.setItem(CREATOR_KEY, creatorJson);
}
