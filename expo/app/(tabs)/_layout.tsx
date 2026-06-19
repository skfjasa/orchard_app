import { Tabs } from "expo-router";
import { Citrus, Compass, Heart, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.accent,
        tabBarInactiveTintColor: Colors.light.textMuted,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
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
          tabBarIcon: ({ color, size }) => (
            <Heart color={color} size={size ?? 22} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
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
});
