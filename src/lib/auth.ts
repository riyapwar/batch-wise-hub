const AUTH_KEY = "attendance-admin-auth";
const PASS_KEY = "attendance-admin-pass";
const DEFAULT_PASS = "admin123";

export function getAdminPassword(): string {
  return localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
}

export function setAdminPassword(newPass: string): void {
  localStorage.setItem(PASS_KEY, newPass);
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function login(password: string): boolean {
  if (password === getAdminPassword()) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
