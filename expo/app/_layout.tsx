import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AppStateStatus,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ProfileProvider } from "@/providers/profile-provider";
import { AuthProvider } from "@/providers/auth-provider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function handleAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        headerTitleStyle: { fontWeight: "700" as const },
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="match/[id]"
        options={{
          presentation: "card",
          title: "",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "modal",
          title: "Edit Profile",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="safety-legal"
        options={{
          title: "Safety & Legal",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          presentation: "modal",
          title: "Report",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.log("[root-error-boundary]", error.message);
  }, [error.message]);

  return (
    <View style={styles.errorRoot}>
      <View style={styles.errorPanel}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>
          Orchard hit an unexpected app error. You can retry this screen or
          restart the app if it happens again.
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
          testID="root-error-retry"
        >
          <Text style={styles.errorButtonText}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <ProfileProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="dark" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ProfileProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
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
    fontWeight: "800",
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
    fontWeight: "700",
  },
});
