import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import { useProfile } from "@/providers/profile-provider";

export default function Index() {
  const { profile, hydrated } = useProfile();

  if (!hydrated) {
    return (
      <View style={styles.center} testID="boot-loader">
        <ActivityIndicator color={Colors.light.accent} />
      </View>
    );
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
