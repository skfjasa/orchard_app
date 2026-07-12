import createContextHook from "@nkzw/create-context-hook";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";

import { getBackendMode, supabase } from "@/lib/supabase";
import type { AuthCredentials } from "@/services";
import {
  buildPasswordResetRedirectOptions,
  buildSignUpRedirectOptions,
  resolveAuthRedirectUrl,
} from "@/services/auth-redirect-service";

type WebLocationLike = {
  href?: string;
  origin?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

type WebHistoryLike = {
  replaceState?: (data: unknown, unused: string, url?: string | URL | null) => void;
};

type WebGlobalLike = typeof globalThis & {
  location?: WebLocationLike;
  history?: WebHistoryLike;
  addEventListener?: (
    type: "hashchange" | "popstate",
    listener: () => void
  ) => void;
  removeEventListener?: (
    type: "hashchange" | "popstate",
    listener: () => void
  ) => void;
};

function getAuthRedirectUrl(): string {
  const location = (globalThis as typeof globalThis & {
    location?: WebLocationLike;
  }).location;
  return resolveAuthRedirectUrl({
    configuredUrl: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL,
    createNativeUrl: (path) => Linking.createURL(path),
    platform: Platform.OS === "web" ? "web" : "native",
    webOrigin: location?.origin,
  });
}

function formatAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("email rate limit exceeded")) {
    return "Too many confirmation emails were sent recently. Try again after the Supabase email limit resets.";
  }

  if (
    normalized.includes("email not confirmed") ||
    normalized.includes("email_not_confirmed")
  ) {
    return "Confirm your email address before signing in.";
  }

  return message;
}

function getWebGlobal(): WebGlobalLike {
  return globalThis as WebGlobalLike;
}

function getCurrentWebUrl(): string | undefined {
  if (Platform.OS !== "web") return undefined;
  return getWebGlobal().location?.href;
}

function parseAuthCallbackValues(url: string): {
  accessToken?: string;
  code?: string;
  refreshToken?: string;
  type?: string;
} {
  try {
    const webOrigin = getWebGlobal().location?.origin ?? "http://localhost";
    const parsed = new URL(url, webOrigin);
    const values = new URLSearchParams(parsed.search);
    const hash = parsed.hash.startsWith("#")
      ? parsed.hash.slice(1)
      : parsed.hash;

    if (hash) {
      const hashParams = new URLSearchParams(
        hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : hash
      );
      hashParams.forEach((value, key) => {
        if (!values.has(key)) values.set(key, value);
      });
    }

    return {
      accessToken: values.get("access_token") ?? undefined,
      code: values.get("code") ?? undefined,
      refreshToken: values.get("refresh_token") ?? undefined,
      type: values.get("type") ?? undefined,
    };
  } catch {
    return {};
  }
}

function clearAuthCallbackValuesFromWebUrl() {
  if (Platform.OS !== "web") return;
  const web = getWebGlobal();
  const href = web.location?.href;
  const replaceState = web.history?.replaceState;
  if (!href || !replaceState) return;

  try {
    const parsed = new URL(href);
    const params = parsed.searchParams;
    params.delete("code");
    params.delete("access_token");
    params.delete("refresh_token");
    params.delete("expires_at");
    params.delete("expires_in");
    params.delete("provider_token");
    params.delete("provider_refresh_token");
    params.delete("token_type");
    params.delete("type");

    const search = params.toString();
    const nextUrl = `${parsed.pathname}${search ? `?${search}` : ""}`;
    replaceState.call(web.history, null, "", nextUrl);
  } catch {
    // Leaving callback tokens in the URL is not fatal; session restoration already ran.
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordRecovery, setPasswordRecovery] = useState<boolean>(false);
  const processedCallbackUrls = useRef<Set<string>>(new Set());
  const mode = getBackendMode();

  const processAuthCallbackUrl = useCallback(async (url: string | undefined) => {
    if (!supabase || !url || processedCallbackUrls.current.has(url)) {
      return false;
    }

    const { accessToken, code, refreshToken, type } = parseAuthCallbackValues(url);
    if (!code && (!accessToken || !refreshToken)) return false;

    processedCallbackUrls.current.add(url);
    console.log("[auth-provider] auth callback detected", {
      hasCode: !!code,
      hasTokenPair: !!accessToken && !!refreshToken,
    });

    try {
      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });

      if (result.error) throw result.error;
      setSession(result.data.session ?? null);
      setPasswordRecovery(type === "recovery");
      console.log("[auth-provider] auth callback session restored", {
        hasSession: !!result.data.session,
        isRecovery: type === "recovery",
        userId: result.data.session?.user.id,
      });
      clearAuthCallbackValuesFromWebUrl();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to confirm session.";
      console.log("[auth-provider] auth callback error", message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setInitialized(true);
      return;
    }
    const client = supabase;

    let mounted = true;
    void (async () => {
      await processAuthCallbackUrl(getCurrentWebUrl());
      try {
        const initialUrl = await Linking.getInitialURL();
        await processAuthCallbackUrl(initialUrl ?? undefined);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to read initial URL.";
        console.log("[auth-provider] getInitialURL error", message);
      }
    })().finally(() => {
      if (!mounted) return;
      client.auth.getSession().then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.log("[auth-provider] getSession error", error.message);
        }
        setSession(data.session ?? null);
        setInitialized(true);
      });
    });

    const onUrl = ({ url }: { url: string }) => {
      void processAuthCallbackUrl(url);
    };
    const linkingSubscription = Linking.addEventListener("url", onUrl);

    const onWebUrlChange = () => {
      void processAuthCallbackUrl(getCurrentWebUrl());
    };
    const web = getWebGlobal();
    if (Platform.OS === "web") {
      web.addEventListener?.("hashchange", onWebUrlChange);
      web.addEventListener?.("popstate", onWebUrlChange);
    }

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
      if (event === "SIGNED_OUT") {
        setPasswordRecovery(false);
      }
      setInitialized(true);
    });

    return () => {
      mounted = false;
      linkingSubscription.remove();
      if (Platform.OS === "web") {
        web.removeEventListener?.("hashchange", onWebUrlChange);
        web.removeEventListener?.("popstate", onWebUrlChange);
      }
      data.subscription.unsubscribe();
    };
  }, [processAuthCallbackUrl]);

  const signInWithEmail = useCallback(async (credentials: AuthCredentials) => {
    if (!supabase) {
      return { ok: true as const, session: null, userId: null };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      setPasswordRecovery(false);
      return {
        ok: true as const,
        session: data.session ?? null,
        userId: data.user?.id ?? data.session?.user.id ?? null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      console.log("[auth-provider] signIn error", message);
      return { ok: false as const, error: formatAuthErrorMessage(message) };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (credentials: AuthCredentials) => {
    if (!supabase) {
      return { ok: true as const, session: null, userId: null };
    }
    setLoading(true);
    try {
      const emailRedirectTo = getAuthRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: emailRedirectTo
          ? buildSignUpRedirectOptions(emailRedirectTo)
          : undefined,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      setPasswordRecovery(false);
      return {
        ok: true as const,
        session: data.session ?? null,
        userId: data.user?.id ?? data.session?.user.id ?? null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account.";
      console.log("[auth-provider] signUp error", message);
      return { ok: false as const, error: formatAuthErrorMessage(message) };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    if (!supabase) {
      return { ok: true as const };
    }
    setLoading(true);
    try {
      const emailRedirectTo = getAuthRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        ...buildPasswordResetRedirectOptions(emailRedirectTo),
      });
      if (error) throw error;
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send reset email.";
      console.log("[auth-provider] resetPassword error", message);
      return { ok: false as const, error: formatAuthErrorMessage(message) };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) {
      return { ok: true as const };
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPasswordRecovery(false);
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update password.";
      console.log("[auth-provider] updatePassword error", message);
      return { ok: false as const, error: formatAuthErrorMessage(message) };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      return { ok: true as const };
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setPasswordRecovery(false);
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign out.";
      console.log("[auth-provider] signOut error", message);
      return { ok: false as const, error: formatAuthErrorMessage(message) };
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      mode,
      session,
      userId: session?.user.id ?? null,
      initialized,
      loading,
      passwordRecovery,
      resetPasswordForEmail,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updatePassword,
    }),
    [
      mode,
      session,
      initialized,
      loading,
      passwordRecovery,
      resetPasswordForEmail,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updatePassword,
    ]
  );
});
