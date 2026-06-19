import { router } from "expo-router";
import { Heart, User, Users } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui";
import Colors from "@/constants/colors";
import { useOnboarding } from "@/providers/onboarding-provider";

export default function AccountTypeScreen() {
  const { draft, setAccountType } = useOnboarding();
  const selected = draft.accountType;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.step}>Step 1 of 6</Text>
        <Text style={styles.title}>How do you slice the pineapple?</Text>
        <Text style={styles.sub}>
          You can update this later from your profile.
        </Text>

        <View style={{ height: 28 }} />

        <TypeCard
          selected={selected === "single"}
          onPress={() => setAccountType("single")}
          icon={<User color={Colors.light.text} size={24} />}
          title="Solo"
          desc="I'm joining as an individual looking to explore ethically non-monogamous connections."
          testID="type-single"
        />
        <View style={{ height: 14 }} />
        <TypeCard
          selected={selected === "couple"}
          onPress={() => setAccountType("couple")}
          icon={<Users color={Colors.light.text} size={24} />}
          title="Couple"
          desc="We're a duo with a shared account. Our feed, matches, and inbox are mirrored for both of us."
          testID="type-couple"
        />

        <View style={styles.note}>
          <Heart color={Colors.light.tint} size={16} />
          <Text style={styles.noteText}>
            All profiles are respected equally. Solos can match with couples and
            vice versa.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/basics")}
          testID="continue-type"
        />
      </View>
    </View>
  );
}

function TypeCard({
  selected,
  onPress,
  icon,
  title,
  desc,
  testID,
}: {
  selected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.95 },
      ]}
    >
      <View style={styles.cardIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 24, paddingBottom: 40 },
  step: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.tint,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginTop: 8,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  sub: {
    fontSize: 15,
    color: Colors.light.textMuted,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.line,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  cardSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: "#FFF",
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: Colors.light.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.accent,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 28,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
