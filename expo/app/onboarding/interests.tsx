import { router } from "expo-router";
import { Check, ChevronDown, Heart, Plus, Quote, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, SectionLabel } from "@/components/ui";
import Colors from "@/constants/colors";
import { useOnboarding } from "@/providers/onboarding-provider";
import {
  INTEREST_CATEGORIES,
  MAX_INTERESTS,
  MAX_PROMPTS,
  PROMPT_QUESTIONS,
  PromptAnswer,
} from "@/types";

export default function InterestsScreen() {
  const { draft, setPerson } = useOnboarding();
  const isCouple = draft.accountType === "couple";
  const p1 = draft.people[0] ?? {};
  const p2 = draft.people[1] ?? {};

  const p1Interests = p1.interests ?? [];
  const p2Interests = p2.interests ?? [];

  const canContinue = isCouple
    ? p1Interests.length > 0 && p2Interests.length > 0
    : p1Interests.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.step}>Step 4 of 6</Text>
        <Text style={styles.title}>What&apos;s your jam?</Text>
        <Text style={styles.sub}>
          Pick the flavors you love and answer a prompt or two. Prompts are optional, but they&apos;re the zest that makes your profile pop.
        </Text>

        <View style={{ height: 24 }} />

        <PersonBlock
          label={isCouple ? p1.name ?? "Partner 1" : "You"}
          interests={p1Interests}
          prompts={p1.prompts ?? []}
          onInterests={(next) => setPerson(0, { interests: next })}
          onPrompts={(next) => setPerson(0, { prompts: next })}
          testIDPrefix="p1"
        />

        {isCouple && (
          <>
            <View style={{ height: 28 }} />
            <PersonBlock
              label={p2.name ?? "Partner 2"}
              interests={p2Interests}
              prompts={p2.prompts ?? []}
              onInterests={(next) => setPerson(1, { interests: next })}
              onPrompts={(next) => setPerson(1, { prompts: next })}
              testIDPrefix="p2"
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/preferences")}
          disabled={!canContinue}
          testID="continue-interests"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function PersonBlock({
  label,
  interests,
  prompts,
  onInterests,
  onPrompts,
  testIDPrefix,
}: {
  label: string;
  interests: string[];
  prompts: PromptAnswer[];
  onInterests: (next: string[]) => void;
  onPrompts: (next: PromptAnswer[]) => void;
  testIDPrefix: string;
}) {
  return (
    <View>
      <Text style={styles.personLabel}>{label}</Text>

      <SectionLabel>Interests ({interests.length}/{MAX_INTERESTS})</SectionLabel>
      <InterestsPicker
        interests={interests}
        onChange={onInterests}
        testID={`${testIDPrefix}-interests`}
      />

      <View style={{ height: 22 }} />
      <SectionLabel>Prompts (optional, up to {MAX_PROMPTS})</SectionLabel>
      <PromptsPicker
        prompts={prompts}
        onChange={onPrompts}
        testID={`${testIDPrefix}-prompts`}
      />
    </View>
  );
}

function InterestsPicker({
  interests,
  onChange,
  testID,
}: {
  interests: string[];
  onChange: (next: string[]) => void;
  testID?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const toggle = (item: string) => {
    if (interests.includes(item)) {
      onChange(interests.filter((x) => x !== item));
      return;
    }
    if (interests.length >= MAX_INTERESTS) return;
    onChange([...interests, item]);
  };

  return (
    <View>
      {interests.length === 0 ? (
        <Text style={styles.emptyHint}>
          Pick things you love — food, music, hobbies, travel.
        </Text>
      ) : (
        <View style={styles.chipWrap}>
          {interests.map((i) => (
            <View key={i} style={styles.interestChipOn}>
              <Heart size={11} color="#FFF" fill="#FFF" />
              <Text style={styles.interestChipOnText}>{i}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 10 }} />
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        testID={testID}
      >
        <Plus size={16} color={Colors.palette.evergreen} />
        <Text style={styles.addBtnText}>
          {interests.length > 0 ? "Edit interests" : "Add interests"}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Interests · {interests.length}/{MAX_INTERESTS}
            </Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <X color={Colors.light.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {INTEREST_CATEGORIES.map((cat) => (
              <View key={cat.title} style={{ marginBottom: 20 }}>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <View style={styles.chipWrap}>
                  {cat.items.map((item) => {
                    const selected = interests.includes(item);
                    const disabled = !selected && interests.length >= MAX_INTERESTS;
                    return (
                      <Pressable
                        key={item}
                        disabled={disabled}
                        onPress={() => toggle(item)}
                        style={({ pressed }) => [
                          selected ? styles.interestChipOn : styles.interestChip,
                          disabled && { opacity: 0.35 },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        {selected && <Heart size={11} color="#FFF" fill="#FFF" />}
                        <Text
                          style={
                            selected
                              ? styles.interestChipOnText
                              : styles.interestChipText
                          }
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function PromptsPicker({
  prompts,
  onChange,
  testID,
}: {
  prompts: PromptAnswer[];
  onChange: (next: PromptAnswer[]) => void;
  testID?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

  const addPrompt = () => {
    if (prompts.length >= MAX_PROMPTS) return;
    const used = prompts.map((p) => p.question);
    const nextQ = PROMPT_QUESTIONS.find((q) => !used.includes(q));
    if (!nextQ) return;
    onChange([...prompts, { question: nextQ, answer: "" }]);
  };

  const remove = (i: number) => {
    onChange(prompts.filter((_, idx) => idx !== i));
  };

  const updateAnswer = (i: number, answer: string) => {
    onChange(prompts.map((p, idx) => (idx === i ? { ...p, answer } : p)));
  };

  const updateQuestion = (i: number, question: string) => {
    onChange(prompts.map((p, idx) => (idx === i ? { ...p, question } : p)));
  };

  return (
    <View>
      {prompts.map((p, i) => (
        <View key={i} style={styles.promptEdit}>
          <Pressable
            onPress={() => {
              setPickerIdx(i);
              setPickerOpen(true);
            }}
            style={styles.promptQ}
            testID={`${testID}-q-${i}`}
          >
            <Quote size={12} color={Colors.palette.evergreen} />
            <Text style={styles.promptQText} numberOfLines={2}>
              {p.question}
            </Text>
            <ChevronDown size={14} color={Colors.light.textMuted} />
          </Pressable>
          <TextInput
            value={p.answer}
            onChangeText={(t) => updateAnswer(i, t)}
            placeholder="Your answer..."
            placeholderTextColor={Colors.light.textMuted}
            multiline
            style={styles.promptInput}
            testID={`${testID}-a-${i}`}
          />
          <Pressable
            onPress={() => remove(i)}
            style={styles.promptRemove}
            hitSlop={10}
          >
            <Trash2 size={14} color={Colors.palette.danger} />
            <Text style={styles.promptRemoveText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      {prompts.length < MAX_PROMPTS && (
        <Pressable
          onPress={addPrompt}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          testID={`${testID}-add`}
        >
          <Plus size={16} color={Colors.palette.evergreen} />
          <Text style={styles.addBtnText}>
            {prompts.length === 0 ? "Add a prompt" : "Add another prompt"}
          </Text>
        </Pressable>
      )}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a prompt</Text>
            <Pressable onPress={() => setPickerOpen(false)} hitSlop={10}>
              <X color={Colors.light.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
            {PROMPT_QUESTIONS.map((q) => {
              const currentQ =
                pickerIdx !== null ? prompts[pickerIdx]?.question : undefined;
              const isSelected = q === currentQ;
              const isDisabled =
                prompts.map((p) => p.question).includes(q) && !isSelected;
              return (
                <Pressable
                  key={q}
                  disabled={isDisabled}
                  onPress={() => {
                    if (pickerIdx !== null) updateQuestion(pickerIdx, q);
                    setPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    isSelected && styles.pickerRowOn,
                    isDisabled && { opacity: 0.35 },
                    pressed && !isDisabled && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[styles.pickerText, isSelected && { color: "#FFF" }]}
                  >
                    {q}
                  </Text>
                  {isSelected && <Check color="#FFF" size={16} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    lineHeight: 36,
  },
  sub: { fontSize: 15, color: Colors.light.textMuted, marginTop: 8 },
  personLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.accent,
    marginBottom: 14,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.light.textMuted,
    lineHeight: 18,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestChip: {
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
  interestChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  interestChipOn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.palette.evergreen,
    borderWidth: 1,
    borderColor: Colors.palette.evergreen,
  },
  interestChipOnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.light.line,
    backgroundColor: Colors.light.surface,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.palette.evergreen,
  },
  promptEdit: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.line,
    padding: 12,
    gap: 10,
    marginBottom: 10,
  },
  promptQ: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  promptQText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  promptInput: {
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 70,
    textAlignVertical: "top",
  },
  promptRemove: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  promptRemoveText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.palette.danger,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  catTitle: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  pickerRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerRowOn: {
    backgroundColor: Colors.palette.evergreen,
    borderColor: Colors.palette.evergreen,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
