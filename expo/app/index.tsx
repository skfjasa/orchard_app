import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";

export default function Index() {
  const { initialized: authInitialized, mode, session } = useAuth();
  const { profile, hydrated } = useProfile();

  if (!hydrated || !authInitialized) {
    return (
      <View style={styles.center} testID="boot-loader">
        <ActivityIndicator color={Colors.light.accent} />
      </View>
    );
  }

  if (mode === "supabase" && !session) {
    return <Redirect href="/onboarding" />;
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
