import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.root} testID="welcome-screen">
      <Image
        source={{
          uri: "https://r2-pub.rork.com/generated-images/72b141b5-997b-4d4d-b90c-6ee5ce90f32f.png",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(31,19,32,0.35)", "rgba(31,19,32,0.55)", "rgba(31,19,32,0.9)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.top}>
          <View style={styles.wordmarkWrap}>
            <Text style={styles.brand} numberOfLines={1} allowFontScaling={false}>
              Orchard
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.headlineWrap}>
            <Text style={styles.headlineShadow}>
              Fruit was meant{"\n"}to be shared.
            </Text>
            <Text style={styles.headline}>
              Fruit was meant{"\n"}to be shared.
            </Text>
            <View style={styles.headlineUnderline} />
          </View>
          <View style={{ height: 24 }} />
          <Button
            label="Create your profile"
            onPress={() => router.push("/onboarding/legal")}
            testID="start-btn"
            backgroundColor="#FFD36B"
            textColor="#1F1320"
          />
          <View style={{ height: 12 }} />
          <Pressable
            onPress={() => {
              console.log("[welcome] sign-in pressed");
              router.push("/onboarding/sign-in");
            }}
            testID="already-account-btn"
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.signInButtonPressed,
            ]}
          >
            <Text style={styles.signInButtonText}>
              I already have an account
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.accent },
  safe: { flex: 1, justifyContent: "space-between", padding: 28 },
  top: { marginTop: 24, alignItems: "center" },
  wordmarkWrap: { alignSelf: "center", alignItems: "center" },
  brandRow: { alignItems: "center", justifyContent: "center" },
  periodRow: { alignItems: "center", marginTop: 4 },
  brandLogo: {
    width: 28,
    height: 28,
    tintColor: "#FFE6A1",
  },
  brand: {
    fontSize: 54,
    fontWeight: "900" as const,
    color: "#FFE6A1",
    letterSpacing: -2,
    fontStyle: "italic",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 18,
      },
      android: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 12,
      },
      default: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 18,
      },
    }),
  },
  brandShadow: {
    position: "absolute",
    top: 3,
    left: 2,
    fontSize: 54,
    fontWeight: "900" as const,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: -2,
    fontStyle: "italic",
  },
  underline: {
    marginTop: 6,
    height: 4,
    width: 72,
    borderRadius: 2,
    backgroundColor: "#FFD36B",
    alignSelf: "center",
  },
  bottom: {},
  signInButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  signInButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800" as const,
    letterSpacing: 0.2,
  },
  headlineWrap: { alignSelf: "stretch", alignItems: "center" },
  headline: {
    fontSize: 40,
    fontWeight: "900" as const,
    color: "#FFE6A1",
    letterSpacing: -1.5,
    fontStyle: "italic",
    lineHeight: 44,
    textAlign: "center",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 16,
      },
      android: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      default: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 16,
      },
    }),
  },
  headlineShadow: {
    position: "absolute",
    top: 3,
    left: 0,
    right: 0,
    fontSize: 40,
    fontWeight: "900" as const,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: -1.5,
    fontStyle: "italic",
    lineHeight: 44,
    textAlign: "center",
  },
  headlineUnderline: {
    marginTop: 8,
    height: 3,
    width: 56,
    borderRadius: 2,
    backgroundColor: "#FFD36B",
    alignSelf: "center",
  },
});
