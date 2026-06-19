import { router } from "expo-router";
import { Info, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Chip, SectionLabel } from "@/components/ui";
import Colors from "@/constants/colors";
import { getPolyFruit, POLY_FRUIT_MAP } from "@/constants/poly-fruits";
import { useOnboarding } from "@/providers/onboarding-provider";
import { POLYAMORY_TYPES, PolyamoryType, PREFERENCE_OPTIONS, Preference } from "@/types";

const PREFS: Preference[] = PREFERENCE_OPTIONS;

export default function PreferencesScreen() {
  const { draft, togglePreference, setLookingFor, setPolyType } =
    useOnboarding();
  const isCouple = draft.accountType === "couple";

  const canContinue = draft.preferences.length > 0;
  const [infoType, setInfoType] = useState<PolyamoryType | null>(null);
  const infoFruit = infoType ? getPolyFruit(infoType) : undefined;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Step 5 of 6</Text>
        <Text style={styles.title}>Who makes you go bananas?</Text>
        <Text style={styles.sub}>
          Pick the bunch you&apos;re ripe to meet — these mirror the identities from step 3. You can change this anytime.
        </Text>

        <View style={{ height: 24 }} />
        <SectionLabel>Preferences</SectionLabel>
        <View style={styles.chipWrap}>
          {PREFS.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={draft.preferences.includes(p)}
              onPress={() => togglePreference(p)}
              testID={`pref-${p}`}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
        <SectionLabel>Looking to connect</SectionLabel>
        <Text style={styles.helper}>
          {isCouple
            ? "Are you meeting new people as a couple, or separately?"
            : "Are you open to meeting people as a pair, or one at a time?"}
        </Text>
        <View style={{ height: 12 }} />
        <View style={styles.segmented}>
          <SegButton
            label="Solo"
            active={draft.lookingFor === "Solo"}
            onPress={() => setLookingFor("Solo")}
          />
          <SegButton
            label="Together"
            active={draft.lookingFor === "Together"}
            onPress={() => setLookingFor("Together")}
          />
        </View>

        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            {draft.lookingFor === "Solo"
              ? isCouple
                ? "Each of you will appear to matches individually. Perfect for independent dates."
                : "You'll see and be seen by individuals one at a time."
              : isCouple
              ? "You'll be shown as a duo to matches. Great for shared experiences."
              : "You'll primarily be shown to couples and pairs."}
          </Text>
        </View>

        <View style={{ height: 32 }} />
        <SectionLabel>Your style of polyamory</SectionLabel>
        <Text style={styles.helper}>
          Pick what fits best — this shows on your profile so matches know your flavor.
        </Text>
        <View style={{ height: 12 }} />
        <View style={styles.chipWrap}>
          {POLYAMORY_TYPES.map((t: PolyamoryType) => {
            const selected = draft.polyType === t;
            const fruit = POLY_FRUIT_MAP[t];
            return (
              <View key={t} style={styles.polyChipRow}>
                <Pressable
                  testID={`poly-${t}`}
                  onPress={() => setPolyType(selected ? undefined : t)}
                  style={({ pressed }) => [
                    styles.polyChip,
                    selected && {
                      backgroundColor: fruit.color,
                      borderColor: fruit.color,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.polyChipEmoji}>{fruit.emoji}</Text>
                  <Text
                    style={[
                      styles.polyChipText,
                      selected && styles.polyChipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setInfoType(t);
                    }}
                    hitSlop={10}
                    testID={`poly-info-${t}`}
                    style={styles.infoBtn}
                  >
                    <Info
                      size={14}
                      color={selected ? "#fff" : Colors.palette.coralDeep}
                    />
                  </Pressable>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={infoType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoType(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setInfoType(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {infoFruit && infoType && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalBadge,
                      { backgroundColor: infoFruit.color },
                    ]}
                  >
                    <Text style={styles.modalBadgeEmoji}>
                      {infoFruit.emoji}
                    </Text>
                  </View>
                  <Text style={styles.modalTitle}>{infoType}</Text>
                  <Pressable
                    onPress={() => setInfoType(null)}
                    hitSlop={12}
                    style={styles.modalClose}
                    testID="poly-info-close"
                  >
                    <X size={20} color={Colors.light.textMuted} />
                  </Pressable>
                </View>
                <Text style={styles.modalBody}>{infoFruit.definition}</Text>
                <Button
                  label={
                    draft.polyType === infoType
                      ? "Selected"
                      : `Choose ${infoType}`
                  }
                  onPress={() => {
                    if (draft.polyType !== infoType) setPolyType(infoType);
                    setInfoType(null);
                  }}
                  testID="poly-info-select"
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/photos")}
          disabled={!canContinue}
          testID="continue-preferences"
        />
      </View>
    </View>
  );
}

function SegButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Chip
      label={label}
      selected={active}
      onPress={onPress}
      style={{ flex: 1, alignItems: "center" }}
    />
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
  sub: { fontSize: 15, color: Colors.light.textMuted, marginTop: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  polyChipRow: {},
  polyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.line,
    backgroundColor: Colors.light.surface,
  },
  polyChipEmoji: { fontSize: 14 },
  polyChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  polyChipTextSelected: { color: "#fff" },
  infoBtn: {
    marginLeft: 2,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBadgeEmoji: { fontSize: 20 },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  modalClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.textMuted,
  },
  helper: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: -4,
    marginBottom: 6,
  },
  segmented: { flexDirection: "row", gap: 10 },
  explainer: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  explainerText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 19,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
