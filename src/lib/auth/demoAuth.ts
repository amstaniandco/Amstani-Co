export type DemoRole = "admin" | "customer" | "owner";

export const DEMO_CREDENTIALS: Record<DemoRole, { email: string; password: string }> = {
  owner: { email: "store@gmail.com", password: "store123" },
  customer: { email: "customer@gmail.com", password: "customer123" },
  admin: { email: "admin@gmail.com", password: "admin123" },
};

export const DEMO_TOKEN_KEY = "amstani_demo_token";
export const DEMO_ROLE_KEY = "amstani_demo_role";
export const DEMO_EMAIL_KEY = "amstani_demo_email";

export const DEMO_COOKIE_TOKEN = "amstani_demo_token";
export const DEMO_COOKIE_ROLE = "amstani_demo_role";

export function authenticateDemoUser(email: string, password: string): DemoRole | null {
  const normalizedEmail = email.trim().toLowerCase();

  for (const [role, creds] of Object.entries(DEMO_CREDENTIALS) as Array<[
    DemoRole,
    { email: string; password: string },
  ]>) {
    if (creds.email === normalizedEmail && creds.password === password) {
      return role;
    }
  }

  return null;
}

export function getRouteForRole(role: DemoRole): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "owner") {
    return "/store/chats";
  }

  return "/home";
}

function makeDemoToken(role: DemoRole, email: string): string {
  return btoa(`${role}:${email}:${Date.now()}`);
}

export function setDemoSession(role: DemoRole, email: string): string {
  const token = makeDemoToken(role, email);

  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_TOKEN_KEY, token);
    localStorage.setItem(DEMO_ROLE_KEY, role);
    localStorage.setItem(DEMO_EMAIL_KEY, email);

    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `${DEMO_COOKIE_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${DEMO_COOKIE_ROLE}=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  return token;
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(DEMO_TOKEN_KEY);
  localStorage.removeItem(DEMO_ROLE_KEY);
  localStorage.removeItem(DEMO_EMAIL_KEY);

  document.cookie = `${DEMO_COOKIE_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${DEMO_COOKIE_ROLE}=; path=/; max-age=0; SameSite=Lax`;
}
