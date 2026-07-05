import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import {
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Mic,
  Pause,
  Play,
  Plus,
  Quote,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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

import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import { searchCities } from "@/constants/cities";
import Colors from "@/constants/colors";
import { useProfile } from "@/providers/profile-provider";
import {
  Gender,
  GENDER_OPTIONS,
  INTEREST_CATEGORIES,
  LookingFor,
  MAX_INTERESTS,
  MAX_PROMPTS,
  MAX_VOICE_PROMPT_SEC,
  PersonProfile,
  Preference,
  PREFERENCE_OPTIONS,
  PROMPT_QUESTIONS,
  PromptAnswer,
  VOICE_PROMPT_QUESTIONS,
  VoicePrompt,
} from "@/types";

export default function EditProfileScreen() {
  return (
    <ProtectedRoute loadingTestID="edit-profile-loader">
      <EditProfileContent />
    </ProtectedRoute>
  );
}

function EditProfileContent() {
  const { profile, updateProfile } = useProfile();

  const [people, setPeople] = useState<PersonProfile[]>(profile?.people ?? []);
  const [bio, setBio] = useState<string>(profile?.bio ?? "");
  const [lookingFor, setLookingFor] = useState<LookingFor>(
    profile?.lookingFor ?? "Solo"
  );
  const [preferences, setPreferences] = useState<Preference[]>(
    profile?.preferences ?? []
  );
  const [instagram, setInstagram] = useState<string>(
    profile?.socials?.instagram ?? ""
  );
  const [twitter, setTwitter] = useState<string>(
    profile?.socials?.twitter ?? ""
  );
  const [tiktok, setTiktok] = useState<string>(profile?.socials?.tiktok ?? "");
  const [city, setCity] = useState<string>(profile?.location.city ?? "");
  const [cityFocused, setCityFocused] = useState<boolean>(false);

  const citySuggestions = useMemo(() => {
    if (!cityFocused) return [];
    return searchCities(city ?? "", 6);
  }, [city, cityFocused]);

  const showCitySuggestions =
    cityFocused &&
    citySuggestions.length > 0 &&
    city.trim().length > 0 &&
    citySuggestions[0]?.toLowerCase() !== city.trim().toLowerCase();

  if (!profile) return null;

  const updatePerson = (idx: number, patch: Partial<PersonProfile>) => {
    setPeople((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...patch } : p))
    );
  };

  const togglePreference = (p: Preference) => {
    setPreferences((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const save = () => {
    updateProfile({
      people,
      bio: bio.trim() || undefined,
      socials: {
        instagram: instagram.trim() || undefined,
        twitter: twitter.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
      },
      location: { ...profile.location, city: city.trim() || profile.location.city },
      lookingFor,
      preferences: preferences.length > 0 ? preferences : profile.preferences,
    });
    Alert.alert("Saved", "Your profile has been updated.", [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerRight: () => (
            <Pressable
              onPress={save}
              hitSlop={10}
              testID="save-profile-btn"
            >
              <Text style={styles.saveBtn}>Save</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.light.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Bio">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A line or two about you..."
              placeholderTextColor={Colors.light.textMuted}
              multiline
              style={[styles.input, { minHeight: 96, textAlignVertical: "top" }]}
              testID="bio-input"
            />
          </Section>

          <Section title="Location">
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={Colors.light.textMuted}
              style={styles.input}
              testID="city-input"
              onFocus={() => setCityFocused(true)}
              onBlur={() => {
                setTimeout(() => setCityFocused(false), 150);
              }}
              autoCorrect={false}
            />
            {showCitySuggestions && (
              <View style={styles.suggestionsCard} testID="city-suggestions">
                {citySuggestions.map((c, i) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setCity(c);
                      setCityFocused(false);
                    }}
                    style={({ pressed }) => [
                      styles.suggestionRow,
                      i !== citySuggestions.length - 1 && styles.suggestionDivider,
                      pressed && { backgroundColor: Colors.light.surfaceAlt },
                    ]}
                    testID={`city-suggestion-${i}`}
                  >
                    <View style={styles.suggestionIcon}>
                      <MapPin size={14} color={Colors.light.tint} />
                    </View>
                    <Text style={styles.suggestionText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Section>

          <Section title="Looking to connect">
            <Text style={styles.helperText}>
              Mode {lookingFor === "Solo" ? "· meet one at a time" : "· meet as a pair"}
            </Text>
            <View style={styles.segmented}>
              <ModeButton
                label="Solo"
                active={lookingFor === "Solo"}
                onPress={() => setLookingFor("Solo")}
                testID="mode-solo"
              />
              <ModeButton
                label="Together"
                active={lookingFor === "Together"}
                onPress={() => setLookingFor("Together")}
                testID="mode-together"
              />
            </View>

            <Text style={[styles.helperText, { marginTop: 14 }]}>
              Preferences · who you’d like to meet
            </Text>
            <View style={styles.prefWrap}>
              {PREFERENCE_OPTIONS.map((p) => {
                const selected = preferences.includes(p);
                return (
                  <Pressable
                    key={p}
                    onPress={() => togglePreference(p)}
                    style={({ pressed }) => [
                      selected ? styles.prefChipOn : styles.prefChip,
                      pressed && { opacity: 0.85 },
                    ]}
                    testID={`pref-${p}`}
                  >
                    {selected && <Check size={11} color="#FFF" />}
                    <Text
                      style={
                        selected ? styles.prefChipOnText : styles.prefChipText
                      }
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          <Section title="Socials">
            <LabelInput
              label="Instagram"
              value={instagram}
              onChangeText={setInstagram}
              placeholder="handle (no @)"
            />
            <LabelInput
              label="Twitter / X"
              value={twitter}
              onChangeText={setTwitter}
              placeholder="handle (no @)"
            />
            <LabelInput
              label="TikTok"
              value={tiktok}
              onChangeText={setTiktok}
              placeholder="handle (no @)"
            />
          </Section>

          {people.map((person, idx) => (
            <PersonEditor
              key={idx}
              person={person}
              onChange={(patch) => updatePerson(idx, patch)}
              showName={people.length > 1}
            />
          ))}

          <Pressable
            onPress={save}
            style={({ pressed }) => [
              styles.saveBig,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
            testID="save-profile-big"
          >
            <Check color="#FFF" size={18} />
            <Text style={styles.saveBigText}>Save changes</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function PersonEditor({
  person,
  onChange,
  showName,
}: {
  person: PersonProfile;
  onChange: (patch: Partial<PersonProfile>) => void;
  showName: boolean;
}) {
  const [name, setName] = useState<string>(person.name);
  const [age, setAge] = useState<string>(String(person.age));

  useEffect(() => {
    onChange({ name: name.trim() || person.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  useEffect(() => {
    const n = parseInt(age, 10);
    if (!Number.isNaN(n) && n > 17 && n < 120) onChange({ age: n });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age]);

  return (
    <View>
      {showName && (
        <View style={styles.personHeader}>
          <Image
            source={{ uri: person.photo }}
            style={styles.personAvatar}
            contentFit="cover"
          />
          <Text style={styles.personHeaderText}>{person.name}</Text>
        </View>
      )}

      <Section title={showName ? `${person.name} · Basics` : "Basics"}>
        <LabelInput label="Name" value={name} onChangeText={setName} />
        <LabelInput
          label="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />
        <GenderPicker
          gender={person.gender}
          onChange={(g) => onChange({ gender: g })}
        />
      </Section>

      <InterestsEditor
        interests={person.interests ?? []}
        onChange={(next) => onChange({ interests: next })}
      />

      <PromptsEditor
        prompts={person.prompts ?? []}
        onChange={(next) => onChange({ prompts: next })}
      />

      <VoicePromptEditor
        voice={person.voicePrompt}
        onChange={(next) => onChange({ voicePrompt: next })}
        personName={person.name}
      />
    </View>
  );
}

function GenderPicker({
  gender,
  onChange,
}: {
  gender: Gender;
  onChange: (g: Gender) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <View style={styles.labelRow}>
      <Text style={styles.labelText}>Gender</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.genderBtn}
        testID="gender-picker"
      >
        <Text style={styles.genderBtnText}>{gender}</Text>
        <ChevronDown size={14} color={Colors.light.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors.light.background }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gender</Text>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={10}
              testID="close-gender"
            >
              <X color={Colors.light.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
            {GENDER_OPTIONS.map((g) => {
              const isSelected = g === gender;
              return (
                <Pressable
                  key={g}
                  onPress={() => {
                    onChange(g);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    isSelected && styles.pickerRowOn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      isSelected && { color: "#FFF" },
                    ]}
                  >
                    {g}
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

function InterestsEditor({
  interests,
  onChange,
}: {
  interests: string[];
  onChange: (next: string[]) => void;
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
    <Section
      title="Interests"
      right={
        <Text style={styles.sectionRight}>
          {interests.length}/{MAX_INTERESTS}
        </Text>
      }
    >
      {interests.length === 0 ? (
        <Text style={styles.interestsEmpty}>
          Add a few things you love. Helps us show you to the right people.
        </Text>
      ) : (
        <View style={styles.interestsWrap}>
          {interests.map((i) => (
            <View key={i} style={styles.interestChipOn}>
              <Heart size={11} color="#FFF" fill="#FFF" />
              <Text style={styles.interestChipOnText}>{i}</Text>
            </View>
          ))}
        </View>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.addPrompt,
          pressed && { opacity: 0.85 },
        ]}
        testID="edit-interests"
      >
        <Plus size={16} color={Colors.palette.evergreen} />
        <Text style={styles.addPromptText}>
          {interests.length > 0 ? "Edit interests" : "Add interests"}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors.light.background }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Interests · {interests.length}/{MAX_INTERESTS}
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={10}
              testID="close-interests"
            >
              <X color={Colors.light.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {INTEREST_CATEGORIES.map((cat) => (
              <View key={cat.title} style={{ marginBottom: 20 }}>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <View style={styles.interestsWrap}>
                  {cat.items.map((item) => {
                    const selected = interests.includes(item);
                    const disabled =
                      !selected && interests.length >= MAX_INTERESTS;
                    return (
                      <Pressable
                        key={item}
                        disabled={disabled}
                        onPress={() => toggle(item)}
                        style={({ pressed }) => [
                          selected
                            ? styles.interestChipOn
                            : styles.interestChip,
                          disabled && { opacity: 0.35 },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        {selected && (
                          <Heart size={11} color="#FFF" fill="#FFF" />
                        )}
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
    </Section>
  );
}

function PromptsEditor({
  prompts,
  onChange,
}: {
  prompts: PromptAnswer[];
  onChange: (next: PromptAnswer[] | undefined) => void;
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
    const next = prompts.filter((_, idx) => idx !== i);
    onChange(next.length ? next : undefined);
  };

  const updateAnswer = (i: number, answer: string) => {
    onChange(prompts.map((p, idx) => (idx === i ? { ...p, answer } : p)));
  };

  const updateQuestion = (i: number, question: string) => {
    onChange(prompts.map((p, idx) => (idx === i ? { ...p, question } : p)));
  };

  return (
    <Section
      title="Prompts"
      right={
        <Text style={styles.sectionRight}>
          {prompts.length}/{MAX_PROMPTS}
        </Text>
      }
    >
      {prompts.map((p, i) => (
        <View key={i} style={styles.promptEdit}>
          <Pressable
            onPress={() => {
              setPickerIdx(i);
              setPickerOpen(true);
            }}
            style={styles.promptQ}
            testID={`prompt-q-${i}`}
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
            style={[styles.input, { minHeight: 70, textAlignVertical: "top" }]}
            testID={`prompt-a-${i}`}
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
          style={({ pressed }) => [
            styles.addPrompt,
            pressed && { opacity: 0.85 },
          ]}
          testID="add-prompt"
        >
          <Plus size={16} color={Colors.palette.evergreen} />
          <Text style={styles.addPromptText}>Add a prompt</Text>
        </Pressable>
      )}

      <PromptPickerModal
        open={pickerOpen}
        selected={pickerIdx !== null ? prompts[pickerIdx]?.question : undefined}
        disabled={prompts.map((p) => p.question)}
        onClose={() => setPickerOpen(false)}
        onSelect={(q) => {
          if (pickerIdx !== null) updateQuestion(pickerIdx, q);
          setPickerOpen(false);
        }}
      />
    </Section>
  );
}

function PromptPickerModal({
  open,
  selected,
  disabled,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected?: string;
  disabled: string[];
  onClose: () => void;
  onSelect: (q: string) => void;
}) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose a prompt</Text>
          <Pressable onPress={onClose} hitSlop={10} testID="close-picker">
            <X color={Colors.light.text} size={22} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
          {PROMPT_QUESTIONS.map((q) => {
            const isSelected = q === selected;
            const isDisabled = disabled.includes(q) && !isSelected;
            return (
              <Pressable
                key={q}
                disabled={isDisabled}
                onPress={() => onSelect(q)}
                style={({ pressed }) => [
                  styles.pickerRow,
                  isSelected && styles.pickerRowOn,
                  isDisabled && { opacity: 0.35 },
                  pressed && !isDisabled && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[
                    styles.pickerText,
                    isSelected && { color: "#FFF" },
                  ]}
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
  );
}

function VoicePromptEditor({
  voice,
  onChange,
  personName,
}: {
  voice?: VoicePrompt;
  onChange: (next: VoicePrompt | undefined) => void;
  personName: string;
}) {
  const [question, setQuestion] = useState<string>(
    voice?.question ?? VOICE_PROMPT_QUESTIONS[0]
  );
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [permDenied, setPermDenied] = useState<boolean>(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) setPermDenied(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (e) {
        console.log("[voice] perm error", e);
      }
    })();
  }, []);

  const startRecord = useCallback(async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      console.log("[voice] record error", e);
      Alert.alert("Couldn't start recording", "Try again in a moment.");
    }
  }, [recorder]);

  const stopRecord = useCallback(async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const duration = recorderState.durationMillis ?? 0;
      if (uri) {
        onChange({
          question,
          uri,
          durationMs: duration,
          recordedAt: Date.now(),
        });
      }
    } catch (e) {
      console.log("[voice] stop error", e);
    }
  }, [recorder, recorderState.durationMillis, question, onChange]);

  useEffect(() => {
    if (
      recorderState.isRecording &&
      (recorderState.durationMillis ?? 0) >= MAX_VOICE_PROMPT_SEC * 1000
    ) {
      stopRecord();
    }
  }, [recorderState.isRecording, recorderState.durationMillis, stopRecord]);

  const seconds = Math.min(
    MAX_VOICE_PROMPT_SEC,
    Math.round((recorderState.durationMillis ?? 0) / 1000)
  );

  const updateQuestion = (q: string) => {
    setQuestion(q);
    if (voice) onChange({ ...voice, question: q });
  };

  return (
    <Section
      title="Voice prompt"
      right={
        <Text style={styles.sectionRight}>
          {voice ? "Recorded" : "Optional"}
        </Text>
      }
    >
      <Pressable
        onPress={() => setPickerOpen(true)}
        style={styles.promptQ}
        testID="voice-q"
      >
        <Mic size={12} color={Colors.palette.evergreen} />
        <Text style={styles.promptQText} numberOfLines={2}>
          {question}
        </Text>
        <ChevronDown size={14} color={Colors.light.textMuted} />
      </Pressable>

      {voice ? (
        <VoicePromptPlayback
          voice={voice}
          name={personName}
          onDelete={() => onChange(undefined)}
        />
      ) : (
        <View style={styles.voiceRecordCard}>
          <View style={styles.voiceIconBig}>
            <Mic
              size={26}
              color="#FFF"
              fill={recorderState.isRecording ? "#FFF" : undefined}
            />
          </View>
          <Text style={styles.voiceRecTitle}>
            {recorderState.isRecording
              ? `Recording... ${seconds}s`
              : permDenied
                ? "Mic access needed"
                : "Tap to record up to 30s"}
          </Text>
          <Text style={styles.voiceRecSub}>
            {recorderState.isRecording
              ? `Max ${MAX_VOICE_PROMPT_SEC}s`
              : "Keep it short and real."}
          </Text>
          <Pressable
            onPress={recorderState.isRecording ? stopRecord : startRecord}
            disabled={permDenied && !recorderState.isRecording}
            style={({ pressed }) => [
              styles.voiceRecBtn,
              recorderState.isRecording && { backgroundColor: Colors.palette.danger },
              (permDenied && !recorderState.isRecording) && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            testID="voice-record-btn"
          >
            <Text style={styles.voiceRecBtnText}>
              {recorderState.isRecording ? "Stop" : "Record"}
            </Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors.light.background }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Voice prompt</Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              hitSlop={10}
              testID="close-voice-picker"
            >
              <X color={Colors.light.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
            {VOICE_PROMPT_QUESTIONS.map((q) => {
              const isSelected = q === question;
              return (
                <Pressable
                  key={q}
                  onPress={() => {
                    updateQuestion(q);
                    setPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    isSelected && styles.pickerRowOn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      isSelected && { color: "#FFF" },
                    ]}
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
    </Section>
  );
}

function VoicePromptPlayback({
  voice,
  name,
  onDelete,
}: {
  voice: VoicePrompt;
  name: string;
  onDelete: () => void;
}) {
  const player = useAudioPlayer({ uri: voice.uri });
  const status = useAudioPlayerStatus(player);
  const seconds = Math.max(1, Math.round(voice.durationMs / 1000));

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || status.currentTime >= status.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progress =
    status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.voicePlayback}>
      <View style={styles.voicePlaybackTop}>
        <View style={styles.voiceBadgeDark}>
          <Mic size={11} color="#FFF" />
          <Text style={styles.voiceBadgeText}>Your voice</Text>
        </View>
        <Text style={styles.voicePlayName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.voicePlayLen}>{seconds}s</Text>
      </View>
      <View style={styles.voiceRow}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.voicePlayBtn,
            pressed && { opacity: 0.85 },
          ]}
          testID="voice-preview-play"
        >
          {status.playing ? (
            <Pause size={18} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={18} color="#FFF" fill="#FFF" />
          )}
        </Pressable>
        <View style={styles.voiceTrack}>
          <View
            style={[
              styles.voiceFill,
              { width: `${Math.max(3, Math.min(100, progress * 100))}%` },
            ]}
          />
        </View>
      </View>
      <Pressable
        onPress={onDelete}
        style={styles.promptRemove}
        hitSlop={10}
        testID="voice-delete"
      >
        <Trash2 size={14} color={Colors.palette.danger} />
        <Text style={styles.promptRemoveText}>Delete recording</Text>
      </Pressable>
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.modeBtn,
        active && styles.modeBtnOn,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.modeBtnText, active && styles.modeBtnTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function LabelInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.labelText}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textMuted}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.labelInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  saveBtn: {
    color: Colors.palette.coral,
    fontSize: 16,
    fontWeight: "800" as const,
  },
  section: { paddingHorizontal: 20, marginTop: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionRight: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.line,
    padding: 14,
    gap: 10,
  },
  input: {
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  labelText: {
    width: 96,
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
  },
  labelInput: {
    flex: 1,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 28,
    paddingBottom: 2,
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surfaceAlt,
  },
  personHeaderText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  promptEdit: {
    padding: 12,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 14,
    gap: 8,
  },
  promptQ: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  promptQText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.palette.evergreen,
  },
  promptRemove: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  promptRemoveText: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.palette.danger,
    letterSpacing: 0.3,
  },
  addPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.palette.evergreen,
  },
  addPromptText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
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
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  pickerRowOn: {
    backgroundColor: Colors.palette.evergreen,
    borderColor: Colors.palette.evergreen,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  voiceRecordCard: {
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceAlt,
    gap: 4,
  },
  voiceIconBig: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.palette.coral,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  voiceRecTitle: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  voiceRecSub: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  voiceRecBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.palette.evergreen,
  },
  voiceRecBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800" as const,
    letterSpacing: 0.4,
  },
  voicePlayback: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.palette.evergreen,
    gap: 10,
  },
  voicePlaybackTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voiceBadgeDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  voiceBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
  },
  voicePlayName: {
    flex: 1,
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  voicePlayLen: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voicePlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.palette.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  voiceFill: {
    height: "100%",
    backgroundColor: Colors.palette.honey,
    borderRadius: 3,
  },
  saveBig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.palette.coral,
  },
  saveBigText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  genderBtnText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  interestChipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  interestChipOn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  interestChipOnText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "800" as const,
  },
  interestsEmpty: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  suggestionsCard: {
    marginTop: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.line,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  suggestionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  suggestionIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  segmented: { flexDirection: "row", gap: 10, marginTop: 8 },
  modeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  modeBtnOn: {
    backgroundColor: Colors.palette.evergreen,
    borderColor: Colors.palette.evergreen,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  modeBtnTextOn: { color: "#FFF" },
  prefWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  prefChipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  prefChipOn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  prefChipOnText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "800" as const,
  },
  catTitle: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
});
