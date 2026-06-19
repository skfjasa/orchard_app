import createContextHook from "@nkzw/create-context-hook";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getBackendMode, supabase } from "@/lib/supabase";
import type { AuthCredentials } from "@/services";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const mode = getBackendMode();

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setInitialized(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.log("[auth-provider] getSession error", error.message);
      }
      setSession(data.session ?? null);
      setInitialized(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (credentials: AuthCredentials) => {
    if (!supabase) {
      return { ok: true as const, session: null };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      return { ok: true as const, session: data.session ?? null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      console.log("[auth-provider] signIn error", message);
      return { ok: false as const, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (credentials: AuthCredentials) => {
    if (!supabase) {
      return { ok: true as const, session: null };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      return { ok: true as const, session: data.session ?? null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account.";
      console.log("[auth-provider] signUp error", message);
      return { ok: false as const, error: message };
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
      return { ok: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign out.";
      console.log("[auth-provider] signOut error", message);
      return { ok: false as const, error: message };
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
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [
      mode,
      session,
      initialized,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    ]
  );
});
