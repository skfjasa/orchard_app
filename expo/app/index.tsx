import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useAppBootstrapReadModel } from "@/hooks/use-app-bootstrap-read-model";

export default function Index() {
  const {
    authInitialized,
    backendMatchesHydrated,
    backendProfileHydrated,
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

  if (mode === "supabase" && !session) {
    return <Redirect href="/onboarding" />;
  }

  if (mode === "supabase" && session && !profile) {
    return <Redirect href="/onboarding/account-type" />;
  }

  if (!profile) return <Redirect href="/onboarding" />;
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
