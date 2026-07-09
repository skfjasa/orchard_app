import { Tabs, type ErrorBoundaryProps } from "expo-router";
import { Citrus, Compass, Heart, MessageCircle, User } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import Colors from "@/constants/colors";
import { useTabBadgeReadModel } from "@/hooks/use-tab-badge-read-model";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.log("[tabs-error-boundary]", error.message);
  }, [error.message]);

  return (
    <View style={styles.errorRoot}>
      <View style={styles.errorPanel}>
        <Text style={styles.errorTitle}>This tab needs a retry</Text>
        <Text style={styles.errorBody}>
          Orchard hit an unexpected tab error. Retry this area to continue.
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
          testID="tabs-error-retry"
        >
          <Text style={styles.errorButtonText}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <ProtectedRoute loadingTestID="tabs-loader">
      <TabNavigator />
    </ProtectedRoute>
  );
}

function TabNavigator() {
  const { newMatchCount, unreadMessageCount } = useTabBadgeReadModel();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.accent,
        tabBarInactiveTintColor: Colors.light.textMuted,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBadgeStyle: styles.tabBadge,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="fruit"
        options={{
          title: "Fruit",
          tabBarIcon: ({ color, size }) => (
            <Citrus color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarBadge: newMatchCount > 0 ? newMatchCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Heart color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.background,
    borderTopColor: Colors.light.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  tabBadge: {
    backgroundColor: Colors.palette.coral,
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800" as const,
    minWidth: 18,
    height: 18,
  },
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
