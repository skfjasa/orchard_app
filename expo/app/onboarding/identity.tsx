import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Chip, SectionLabel } from "@/components/ui";
import Colors from "@/constants/colors";
import { useOnboarding } from "@/providers/onboarding-provider";
import { Gender, GENDER_OPTIONS, Race } from "@/types";

const GENDERS: Gender[] = GENDER_OPTIONS;

const RACES: Race[] = [
  "Asian",
  "Black",
  "Hispanic / Latinx",
  "Middle Eastern",
  "Native American",
  "Pacific Islander",
  "White",
  "Mixed",
  "Prefer not to say",
];

export default function IdentityScreen() {
  const { draft, setGender, setRace } = useOnboarding();
  const isCouple = draft.accountType === "couple";
  const p1 = draft.people[0] ?? {};
  const p2 = draft.people[1] ?? {};

  const canContinue =
    !!p1.gender && !!p1.race && (!isCouple || (!!p2.gender && !!p2.race));

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Step 3 of 6</Text>
        <Text style={styles.title}>Show us your true peel</Text>
        <Text style={styles.sub}>
          Share how you identify — every fruit in the basket is welcome here.
        </Text>

        <View style={{ height: 24 }} />

        <PersonIdentity
          label={isCouple ? (p1.name ?? "Partner 1") : "You"}
          gender={p1.gender}
          race={p1.race}
          onGender={(g) => setGender(0, g)}
          onRace={(r) => setRace(0, r)}
        />

        {isCouple && (
          <>
            <View style={{ height: 28 }} />
            <PersonIdentity
              label={p2.name ?? "Partner 2"}
              gender={p2.gender}
              race={p2.race}
              onGender={(g) => setGender(1, g)}
              onRace={(r) => setRace(1, r)}
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/interests")}
          disabled={!canContinue}
          testID="continue-identity"
        />
      </View>
    </View>
  );
}

function PersonIdentity({
  label,
  gender,
  race,
  onGender,
  onRace,
}: {
  label: string;
  gender: Gender | undefined;
  race: Race | undefined;
  onGender: (g: Gender) => void;
  onRace: (r: Race) => void;
}) {
  return (
    <View>
      <Text style={styles.personLabel}>{label}</Text>
      <SectionLabel>Gender</SectionLabel>
      <View style={styles.chipWrap}>
        {GENDERS.map((g) => (
          <Chip
            key={g}
            label={g}
            selected={gender === g}
            onPress={() => onGender(g)}
          />
        ))}
      </View>
      <View style={{ height: 18 }} />
      <SectionLabel>Race / Ethnicity</SectionLabel>
      <View style={styles.chipWrap}>
        {RACES.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={race === r}
            onPress={() => onRace(r)}
          />
        ))}
      </View>
    </View>
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
  },
  sub: { fontSize: 15, color: Colors.light.textMuted, marginTop: 8 },
  personLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.accent,
    marginBottom: 14,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
