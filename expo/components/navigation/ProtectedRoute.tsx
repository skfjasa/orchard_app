import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useAppBootstrapReadModel } from "@/hooks/use-app-bootstrap-read-model";
import { selectProfileBootstrapPath } from "@/services/profile-bootstrap-route-service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  loadingTestID?: string;
}

export default function ProtectedRoute({
  children,
  loadingTestID = "protected-route-loader",
}: ProtectedRouteProps) {
  const {
    authInitialized,
    backendMatchesHydrated,
    backendProfileHydrated,
    backendProfileIncomplete,
    hydrated,
    mode,
    profile,
    session,
  } = useAppBootstrapReadModel();
  const waitingForBackendProfile =
    mode === "supabase" && !!session && !backendProfileHydrated;
  const waitingForBackendMatches =
    mode === "supabase" &&
    !!session &&
    !!profile &&
    backendProfileHydrated &&
    !backendMatchesHydrated;

  useEffect(() => {
    console.log("[protected-route] state", {
      authInitialized,
      backendMatchesHydrated,
      backendProfileHydrated,
      hasProfile: !!profile,
      hasSession: !!session,
      hydrated,
      waitingForBackendMatches,
      waitingForBackendProfile,
    });
  }, [
    authInitialized,
    backendMatchesHydrated,
    backendProfileHydrated,
    hydrated,
    profile,
    session,
    waitingForBackendMatches,
    waitingForBackendProfile,
  ]);

  if (
    !hydrated ||
    !authInitialized ||
    waitingForBackendProfile ||
    waitingForBackendMatches
  ) {
    return (
      <View style={styles.center} testID={loadingTestID}>
        <ActivityIndicator color={Colors.light.accent} />
      </View>
    );
  }

  const path = selectProfileBootstrapPath({
    backendProfileIncomplete,
    hasProfile: !!profile,
    hasSession: !!session,
    mode,
  });
  if (path === "onboarding_profile") {
    return <Redirect href="/onboarding/account-type" />;
  }
  if (path === "onboarding") return <Redirect href="/onboarding" />;

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
