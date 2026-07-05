import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  loadingTestID?: string;
}

export default function ProtectedRoute({
  children,
  loadingTestID = "protected-route-loader",
}: ProtectedRouteProps) {
  const { initialized: authInitialized, mode, session } = useAuth();
  const { backendProfileHydrated, hydrated, profile } = useProfile();
  const waitingForBackendProfile =
    mode === "supabase" && !!session && !profile && !backendProfileHydrated;

  if (!hydrated || !authInitialized || waitingForBackendProfile) {
    return (
      <View style={styles.center} testID={loadingTestID}>
        <ActivityIndicator color={Colors.light.accent} />
      </View>
    );
  }

  if (mode === "supabase" && !session) {
    return <Redirect href="/onboarding" />;
  }

  if (mode === "supabase" && session && !profile) {
    return <Redirect href="/onboarding/account-type" />;
  }

  if (!profile) return <Redirect href="/onboarding" />;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
});
