export const AUTH_CALLBACK_PATH = "/onboarding/sign-in";

interface ResolveAuthRedirectUrlInput {
  configuredUrl?: string;
  createNativeUrl(path: string): string;
  platform: "web" | "native";
  webOrigin?: string;
}

function normalizedWebCallback(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
    if (normalizedPath !== "/" && normalizedPath !== AUTH_CALLBACK_PATH) {
      return undefined;
    }
    return `${parsed.origin}${AUTH_CALLBACK_PATH}`;
  } catch {
    return undefined;
  }
}

export function resolveAuthRedirectUrl({
  configuredUrl,
  createNativeUrl,
  platform,
  webOrigin,
}: ResolveAuthRedirectUrlInput): string {
  if (platform === "web") {
    return (
      normalizedWebCallback(configuredUrl?.trim()) ??
      normalizedWebCallback(webOrigin) ??
      createNativeUrl(AUTH_CALLBACK_PATH.slice(1))
    );
  }

  const configured = configuredUrl?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return configured;
      }
    } catch {
      // Malformed overrides safely fall back to the native Expo link.
    }
  }

  return createNativeUrl(AUTH_CALLBACK_PATH.slice(1));
}

export function buildSignUpRedirectOptions(redirectUrl: string) {
  return { emailRedirectTo: redirectUrl };
}

export function buildPasswordResetRedirectOptions(redirectUrl: string) {
  return { redirectTo: redirectUrl };
}
