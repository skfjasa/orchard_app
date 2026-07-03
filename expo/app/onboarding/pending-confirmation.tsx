import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { MailCheck } from "lucide-react-native";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";

export default function PendingConfirmationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : undefined;

  const openMail = () => {
    void Linking.openURL("mailto:").catch(() => undefined);
  };

  return (
    <View style={styles.root} testID="pending-confirmation-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <Image
        source={require("../../assets/images/icon.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          "rgba(31,19,32,0.45)",
          "rgba(31,19,32,0.78)",
          "rgba(31,19,32,0.96)",
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <MailCheck size={30} color="#1F1320" />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.body}>
            We sent a confirmation link{email ? ` to ${email}` : ""}. After you
            confirm, Orchard will finish saving your profile and photos.
          </Text>
          <Text style={styles.note}>
            Keep this browser available so the saved profile draft can be
            restored after confirmation.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Open mail app"
            onPress={openMail}
            backgroundColor="#FFD36B"
            textColor="#1F1320"
            testID="open-mail-btn"
          />
          <View style={{ height: 10 }} />
          <Button
            label="I confirmed, sign in"
            variant="ghost"
            textColor="#FFFFFF"
            onPress={() => router.replace("/onboarding/sign-in")}
            testID="pending-sign-in-btn"
          />
          <Pressable
            onPress={() => router.replace("/onboarding")}
            style={({ pressed }) => [
              styles.secondaryLink,
              pressed && { opacity: 0.75 },
            ]}
            testID="pending-back-btn"
          >
            <Text style={styles.secondaryLinkText}>Back to start</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1F1320" },
  safe: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD36B",
    marginBottom: 22,
  },
  title: {
    color: "#FFE6A1",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900" as const,
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: -1.2,
    ...Platform.select({
      default: {
        textShadowColor: "rgba(255, 180, 70, 0.45)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 14,
      },
    }),
  },
  body: {
    marginTop: 16,
    color: "#F6EEE1",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    fontWeight: "700" as const,
  },
  note: {
    marginTop: 14,
    color: "rgba(246,238,225,0.72)",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  actions: {
    paddingBottom: 8,
  },
  secondaryLink: {
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryLinkText: {
    color: "rgba(246,238,225,0.78)",
    fontSize: 13,
    fontWeight: "800" as const,
  },
});
