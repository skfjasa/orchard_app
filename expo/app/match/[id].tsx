import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Heart,
  Flag,
  Instagram,
  MapPin,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Quote,
  Sparkles,
  ShieldOff,
  Twitter,
  Users,
  X,
  Zap,
} from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import {
  Alert,
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SuperLikeIcon from "@/components/SuperLikeIcon";
import SuperLikeBurst from "@/components/SuperLikeBurst";
import Colors from "@/constants/colors";
import { getPolyFruit } from "@/constants/poly-fruits";
import { MOCK_PROFILES } from "@/mocks/profiles";
import { useProfile } from "@/providers/profile-provider";
import { PersonProfile, PromptAnswer, VoicePrompt } from "@/types";
import { scoreMatch } from "@/utils/match";

const { width: W } = Dimensions.get("window");

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const other = useMemo(() => MOCK_PROFILES.find((p) => p.id === id), [id]);
  const {
    profile,
    likeProfile,
    passProfile,
    likedIds,
    superLikeProfile,
    superLikedIds,
    reportProfile,
    blockProfile,
  } = useProfile();

  const allPhotos: string[] = useMemo(() => {
    if (!other) return [];
    const list: string[] = [];
    for (const p of other.people) {
      const photos = p.photos && p.photos.length > 0 ? p.photos : [p.photo];
      for (const u of photos) list.push(u);
    }
    return list;
  }, [other]);
  const [superBurstVisible, setSuperBurstVisible] = useState<boolean>(false);

  if (!other || !profile) return null;

  const score = scoreMatch(profile, other);
  const pct = Math.round(score.total * 100);
  const isMatched = likedIds.includes(other.id);
  const isCouple = other.accountType === "couple";
  const isBoosted = !!(other.boostedUntil && other.boostedUntil > Date.now());

  const handleLike = () => {
    const res = likeProfile(other.id);
    if (!res.ok && res.reason === "limit") {
      router.back();
      router.push("/paywall?reason=limit");
      return;
    }
    const label = isCouple && other.people[1]
      ? `${other.people[0].name} & ${other.people[1].name}`
      : other.people[0].name;
    if (Platform.OS === "web") {
      const goMessage = typeof window !== "undefined" && window.confirm(
        `It's a match! You can now message ${label}. Open the chat now?`
      );
      if (goMessage) {
        router.replace(`/chat/${other.id}`);
      } else {
        router.back();
      }
      return;
    }
    Alert.alert(
      "It's a match",
      `You can now message ${label}.`,
      [
        {
          text: "Keep browsing",
          style: "cancel",
          onPress: () => router.back(),
        },
        {
          text: "Message",
          onPress: () => {
            router.replace(`/chat/${other.id}`);
          },
        },
      ]
    );
  };
  const handlePass = () => {
    passProfile(other.id);
    router.back();
  };

  const finalizeSuperLike = () => {
    const res = superLikeProfile(other.id);
    if (!res.ok && res.reason === "limit") {
      router.back();
      router.push("/paywall?reason=limit");
      return;
    }
    const label =
      isCouple && other.people[1]
        ? `${other.people[0].name} & ${other.people[1].name}`
        : other.people[0].name;
    if (Platform.OS === "web") {
      const goMessage =
        typeof window !== "undefined" &&
        window.confirm(
          `Super Like sent! ${label} will know you're extra interested. Open the chat now?`
        );
      if (goMessage) {
        router.replace(`/chat/${other.id}`);
      } else {
        router.back();
      }
      return;
    }
    Alert.alert(
      "Super Like sent",
      `${label} will know you're extra interested.`,
      [
        {
          text: "Keep browsing",
          style: "cancel",
          onPress: () => router.back(),
        },
        {
          text: "Message",
          onPress: () => {
            router.replace(`/chat/${other.id}`);
          },
        },
      ]
    );
  };

  const handleSuperLike = () => {
    setSuperBurstVisible(true);
  };

  const isSuperLiked = superLikedIds.includes(other.id);

  const openSocial = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Couldn't open link", "Try again in a moment.")
    );
  };

  const reportOther = async () => {
    const result = await reportProfile(other.id, "unsafe_behavior");
    Alert.alert(
      result.ok ? "Report submitted" : "Report failed",
      result.ok
        ? "Thanks. This profile has been flagged for review."
        : result.error ?? "Try again in a moment."
    );
  };

  const confirmReport = () => {
    const message = `Report ${other.people[0].name}'s profile for review?`;
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        void reportOther();
      }
      return;
    }
    Alert.alert("Report profile?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Report", style: "destructive", onPress: () => void reportOther() },
    ]);
  };

  const blockOther = async () => {
    const result = await blockProfile(other.id);
    if (!result.ok) {
      Alert.alert("Block failed", result.error ?? "Try again in a moment.");
      return;
    }
    Alert.alert("Profile blocked", "You won't see each other here.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const confirmBlock = () => {
    const message =
      "Blocking removes any local match or conversation with this profile.";
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        void blockOther();
      }
      return;
    }
    Alert.alert("Block profile?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Block", style: "destructive", onPress: () => void blockOther() },
    ]);
  };

  const socials = other.socials ?? {};
  const hasSocials = !!(socials.instagram || socials.twitter || socials.tiktok);

  return (
    <>
      <Stack.Screen options={{ headerTransparent: true, title: "" }} />
      <View style={styles.root}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          <HeroCarousel
            photos={allPhotos}
            name={
              isCouple && other.people[1]
                ? `${other.people[0].name} & ${other.people[1].name}`
                : `${other.people[0].name}, ${other.people[0].age}`
            }
            city={other.location.city}
            distanceKm={score.distanceKm}
            pct={pct}
            isCouple={isCouple}
            isBoosted={isBoosted}
            isSuperLiked={isSuperLiked}
            polyType={other.polyType}
          />

          <View style={styles.body}>
            {other.bio && (
              <Section title="Bio">
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{other.bio}</Text>
                </View>
              </Section>
            )}

            <Section title="Why we matched">
              <ScoreBar label="Shared interests" value={score.interestScore} />
              <ScoreBar label="Preferences" value={score.preferenceScore} />
              <ScoreBar label="Distance" value={score.distanceScore} />
              <ScoreBar label="Age" value={score.ageScore} />
              <ScoreBar label="Category" value={score.categoryScore} />
              {score.sharedInterests.length > 0 && (
                <View style={styles.sharedWrap} testID="shared-interests">
                  {score.sharedInterests.slice(0, 8).map((it) => (
                    <View key={it} style={styles.sharedChip}>
                      <Sparkles
                        size={11}
                        color={Colors.palette.honey}
                        fill={Colors.palette.honey}
                      />
                      <Text style={styles.sharedChipText}>{it}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            <Section title="Looking to connect">
              <View style={styles.tagRow}>
                <Pill label={other.lookingFor} tone="dark" />
                {other.preferences.map((p) => (
                  <Pill key={p} label={p} />
                ))}
              </View>
            </Section>

            {other.polyType && (() => {
              const fruit = getPolyFruit(other.polyType);
              return (
                <Section title="Polyamory style">
                  <View style={styles.polyCard}>
                    <View
                      style={[
                        styles.polyBadge,
                        fruit && { backgroundColor: fruit.color },
                      ]}
                    >
                      {fruit ? (
                        <Text style={styles.polyBadgeEmoji}>{fruit.emoji}</Text>
                      ) : (
                        <Heart size={12} color="#FFF" fill="#FFF" />
                      )}
                      <Text style={styles.polyBadgeText}>{other.polyType}</Text>
                    </View>
                    <Text style={styles.polyDesc}>
                      How they practice ethical non-monogamy.
                    </Text>
                  </View>
                </Section>
              );
            })()}

            {hasSocials && (
              <Section title="Socials">
                <View style={styles.socialHub}>
                  {socials.instagram && (
                    <SocialBtn
                      label={`@${socials.instagram}`}
                      icon={<Instagram size={16} color="#FFF" />}
                      bg={Colors.palette.coral}
                      onPress={() =>
                        openSocial(
                          `https://instagram.com/${socials.instagram}`
                        )
                      }
                    />
                  )}
                  {socials.twitter && (
                    <SocialBtn
                      label={`@${socials.twitter}`}
                      icon={<Twitter size={16} color="#FFF" />}
                      bg={Colors.palette.evergreen}
                      onPress={() =>
                        openSocial(`https://x.com/${socials.twitter}`)
                      }
                    />
                  )}
                  {socials.tiktok && (
                    <SocialBtn
                      label={`@${socials.tiktok}`}
                      icon={<Text style={styles.ttText}>TT</Text>}
                      bg={Colors.light.text}
                      onPress={() =>
                        openSocial(`https://tiktok.com/@${socials.tiktok}`)
                      }
                    />
                  )}
                </View>
              </Section>
            )}

            <Section title={isCouple ? "Them" : "About"}>
              {other.people.map((p, i) => (
                <PersonBlock key={i} person={p} />
              ))}
            </Section>

            {other.people.map((p, i) => {
              const interests = p.interests ?? [];
              if (interests.length === 0) return null;
              return (
                <Section
                  key={`interests-${i}`}
                  title={
                    isCouple ? `${p.name}'s interests` : "Interests"
                  }
                >
                  <View style={styles.interestsWrap}>
                    {interests.map((it) => (
                      <View key={it} style={styles.interestChip}>
                        <Sparkles size={11} color={Colors.palette.coral} fill={Colors.palette.coral} />
                        <Text style={styles.interestChipText}>{it}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              );
            })}

            {other.people.map((p, i) => {
              const hasPrompts = p.prompts && p.prompts.length > 0;
              const hasVoice = !!p.voicePrompt;
              if (!hasPrompts && !hasVoice) return null;
              return (
                <Section
                  key={`prompts-${i}`}
                  title={
                    isCouple
                      ? `${p.name}'s prompts`
                      : "Prompts"
                  }
                >
                  {hasVoice && p.voicePrompt && (
                    <VoicePromptCard voice={p.voicePrompt} name={p.name} />
                  )}
                  {p.prompts?.map((pr, idx) => (
                    <PromptCard key={idx} prompt={pr} />
                  ))}
                </Section>
              );
            })}

            <Section title="Safety">
              <View style={styles.safetyRow}>
                <Pressable
                  onPress={confirmReport}
                  style={({ pressed }) => [
                    styles.safetyBtn,
                    pressed && { backgroundColor: Colors.light.surfaceAlt },
                  ]}
                  testID="report-profile"
                >
                  <Flag size={16} color={Colors.palette.danger} />
                  <Text style={styles.safetyBtnText}>Report</Text>
                </Pressable>
                <Pressable
                  onPress={confirmBlock}
                  style={({ pressed }) => [
                    styles.safetyBtn,
                    pressed && { backgroundColor: Colors.light.surfaceAlt },
                  ]}
                  testID="block-profile"
                >
                  <ShieldOff size={16} color={Colors.palette.danger} />
                  <Text style={styles.safetyBtnText}>Block</Text>
                </Pressable>
              </View>
            </Section>
          </View>
        </ScrollView>

        <View style={styles.actionBar}>
          {isMatched ? (
            <Pressable
              onPress={() => {
                console.log("[match] open chat", other.id);
                router.replace(`/chat/${other.id}`);
              }}
              style={styles.chatBtn}
              testID="open-chat"
            >
              <MessageCircle color="#FFF" size={20} />
              <Text style={styles.chatBtnText}>Open chat</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={handlePass}
                style={[styles.roundBtn, styles.roundBtnGhost]}
                testID="match-pass"
              >
                <X color={Colors.light.text} size={26} strokeWidth={2.5} />
              </Pressable>
              <Pressable
                onPress={handleSuperLike}
                style={({ pressed }) => [
                  styles.roundBtn,
                  {
                    backgroundColor: Colors.palette.evergreen,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
                testID="match-superlike"
              >
                <SuperLikeIcon size={26} color="#FFF" />
              </Pressable>
              <Pressable
                onPress={handleLike}
                style={[styles.roundBtn, { backgroundColor: Colors.light.tint }]}
                testID="match-like"
              >
                <Heart color="#FFF" size={26} strokeWidth={2.5} fill="#FFF" />
              </Pressable>
            </>
          )}
        </View>
        <SuperLikeBurst
          visible={superBurstVisible}
          onDone={() => {
            setSuperBurstVisible(false);
            finalizeSuperLike();
          }}
        />
      </View>
    </>
  );
}

function HeroCarousel({
  photos,
  name,
  city,
  distanceKm,
  pct,
  isCouple,
  isBoosted,
  isSuperLiked,
  polyType,
}: {
  photos: string[];
  name: string;
  city: string;
  distanceKm: number;
  pct: number;
  isCouple: boolean;
  isBoosted: boolean;
  isSuperLiked: boolean;
  polyType?: import("@/types").PolyamoryType;
}) {
  const heroFruit = getPolyFruit(polyType);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState<number>(0);
  const HERO_H = W * 1.1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / W);
    if (p !== page) setPage(p);
  };

  return (
    <View style={{ height: HERO_H }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {photos.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: W, height: HERO_H }}
            contentFit="cover"
          />
        ))}
      </ScrollView>
      <LinearGradient
        colors={[
          "rgba(31,19,32,0.45)",
          "rgba(31,19,32,0)",
          "rgba(31,19,32,0)",
          "rgba(31,19,32,0.95)",
        ]}
        locations={[0, 0.25, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.pageDots} pointerEvents="none">
        {photos.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === page ? 1 : 0.4, width: i === page ? 18 : 6 },
            ]}
          />
        ))}
      </View>

      <View style={styles.heroInfo} pointerEvents="box-none">
        <View style={styles.topRow}>
          <View style={styles.scorePill}>
            <Sparkles size={12} color={Colors.palette.honey} />
            <Text style={styles.scoreText}>{pct}% match</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {isSuperLiked && (
              <View style={styles.superTag}>
                <SuperLikeIcon size={12} color="#FFF" />
                <Text style={styles.superTagText}>SUPER LIKED</Text>
              </View>
            )}
            {isBoosted && (
              <View style={styles.boostTag}>
                <Zap size={11} color="#FFF" fill="#FFF" />
                <Text style={styles.boostTagText}>BOOSTED</Text>
              </View>
            )}
            {isCouple && (
              <View style={styles.coupleTag}>
                <Users size={11} color="#FFF" />
                <Text style={styles.coupleTagText}>Couple</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.name}>{name}</Text>
        {heroFruit && polyType && (
          <View
            style={[styles.heroPolyChip, { backgroundColor: heroFruit.color }]}
            testID="hero-poly-chip"
          >
            <Text style={styles.heroPolyEmoji}>{heroFruit.emoji}</Text>
            <Text style={styles.heroPolyText}>{polyType}</Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <MapPin size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.metaText}>
            {city}
            {` \u00b7 ${Math.round(distanceKm)} km`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PromptCard({ prompt }: { prompt: PromptAnswer }) {
  return (
    <View style={styles.promptCard}>
      <View style={styles.promptIconWrap}>
        <Quote size={14} color={Colors.palette.evergreen} />
      </View>
      <Text style={styles.promptQuestion}>{prompt.question}</Text>
      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
    </View>
  );
}

function VoicePromptCard({
  voice,
  name,
}: {
  voice: VoicePrompt;
  name: string;
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

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.voiceCard}>
      <View style={styles.voiceHeader}>
        <View style={styles.voiceBadge}>
          <Mic size={12} color="#FFF" />
          <Text style={styles.voiceBadgeText}>Voice</Text>
        </View>
        <Text style={styles.voiceName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.voiceLen}>{seconds}s</Text>
      </View>
      <Text style={styles.voiceQuestion}>{voice.question}</Text>
      <View style={styles.voiceRow}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.voicePlay,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          testID={`voice-play-${name}`}
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
    </View>
  );
}

function PersonBlock({ person }: { person: PersonProfile }) {
  return (
    <View style={styles.personBlock}>
      <Image
        source={{ uri: person.photo }}
        style={styles.personAvatar}
        contentFit="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.personName}>
          {person.name}, {person.age}
        </Text>
        <Text style={styles.personMeta}>
          {`${person.gender} \u00b7 ${person.race}`}
        </Text>
      </View>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.scoreBarRow}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={styles.scoreBarPct}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.scoreBarBg}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${Math.max(4, value * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

function Pill({ label, tone }: { label: string; tone?: "dark" }) {
  return (
    <View
      style={[
        styles.pill,
        tone === "dark"
          ? { backgroundColor: Colors.light.accent }
          : { backgroundColor: Colors.light.surfaceAlt },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          tone === "dark" ? { color: "#FFF" } : { color: Colors.light.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function SocialBtn({
  icon,
  label,
  bg,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        { backgroundColor: bg },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon}
      <Text style={styles.socialBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  heroInfo: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    paddingTop: 80,
    justifyContent: "flex-end",
  },
  topRow: {
    position: "absolute",
    top: 80,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(31,19,32,0.75)",
    borderRadius: 999,
  },
  scoreText: { color: "#FFF", fontWeight: "800" as const, fontSize: 12 },
  coupleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.palette.coral,
    borderRadius: 999,
  },
  coupleTagText: {
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  boostTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.palette.honey,
    borderRadius: 999,
  },
  superTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.palette.evergreen,
    borderRadius: 999,
  },
  superTagText: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  boostTagText: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  name: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  pageDots: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
  },
  body: { padding: 24, paddingTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  bioCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  bioText: { fontSize: 15, color: Colors.light.text, lineHeight: 22 },
  scoreBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  scoreBarLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  scoreBarPct: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.textMuted,
  },
  scoreBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.surfaceAlt,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: { fontSize: 13, fontWeight: "700" as const },
  socialHub: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  socialBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
  },
  ttText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  personBlock: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
    marginBottom: 10,
  },
  personAvatar: { width: 64, height: 64, borderRadius: 32 },
  personName: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  personMeta: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  promptCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
    marginBottom: 10,
  },
  promptIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  promptQuestion: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  promptAnswer: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  voiceCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.palette.evergreen,
    marginBottom: 10,
  },
  voiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  voiceBadge: {
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
  voiceName: {
    flex: 1,
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  voiceLen: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  voiceQuestion: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 14,
    lineHeight: 20,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voicePlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  polyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  polyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  polyBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
  },
  polyBadgeEmoji: { fontSize: 14 },
  heroPolyChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 8,
  },
  heroPolyEmoji: { fontSize: 13 },
  heroPolyText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  polyDesc: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  sharedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  sharedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.palette.evergreen,
  },
  sharedChipText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "800" as const,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  safetyRow: {
    flexDirection: "row",
    gap: 10,
  },
  safetyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  safetyBtnText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.palette.danger,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  interestChipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    backgroundColor: Colors.light.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
  roundBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  roundBtnGhost: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: Colors.light.accent,
  },
  chatBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800" as const,
  },
});
