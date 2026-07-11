import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useAppBootstrapReadModel } from "@/hooks/use-app-bootstrap-read-model";
import { selectProfileBootstrapPath } from "@/services/profile-bootstrap-route-service";

export default function Index() {
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

  if (
    !hydrated ||
    !authInitialized ||
    waitingForBackendProfile ||
    waitingForBackendMatches
  ) {
    return (
      <View style={styles.center} testID="boot-loader">
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
  return <Redirect href="/(tabs)/discover" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
});
