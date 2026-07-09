import { Stack, type ErrorBoundaryProps } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { OnboardingProvider } from "@/providers/onboarding-provider";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.log("[onboarding-error-boundary]", error.message);
  }, [error.message]);

  return (
    <View style={styles.errorRoot}>
      <View style={styles.errorPanel}>
        <Text style={styles.errorTitle}>Setup needs a retry</Text>
        <Text style={styles.errorBody}>
          Orchard hit an unexpected onboarding error. Retry setup to continue.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void retry();
          }}
          style={({ pressed }) => [
            styles.errorButton,
            pressed && styles.errorButtonPressed,
          ]}
          testID="onboarding-error-retry"
        >
          <Text style={styles.errorButtonText}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
          headerTitle: "",
          contentStyle: { backgroundColor: Colors.light.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="legal" />
        <Stack.Screen name="account-type" />
        <Stack.Screen name="basics" />
        <Stack.Screen name="identity" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="pending-confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  errorRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: 24,
  },
  errorPanel: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
  },
  errorTitle: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "800" as const,
  },
  errorBody: {
    color: Colors.light.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  errorButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
  },
  errorButtonPressed: {
    opacity: 0.85,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
