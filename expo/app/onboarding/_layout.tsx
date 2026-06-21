import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/colors";
import { OnboardingProvider } from "@/providers/onboarding-provider";

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
