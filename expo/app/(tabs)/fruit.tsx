import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Citrus, Flame, Heart, MapPin, MessageCircle, Sparkles, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { MVP_MONETIZATION_ENABLED } from "@/constants/features";
import { getPolyFruit } from "@/constants/poly-fruits";
import { MOCK_PROFILE_BACKEND_IDS } from "@/constants/mock-profile-ids";
import { FRUIT_PROFILES } from "@/mocks/fruit-profiles";
import { useProfile } from "@/providers/profile-provider";
import { createAppServices } from "@/services/app-services";
import { DiscoveryProfile } from "@/services";
import { scoreMatch } from "@/utils/match";
import { Profile } from "@/types";

export default function FruitScreen() {
  const appServices = useMemo(() => createAppServices(), []);
  const {
    profile,
    likedIds,
    passedIds,
    likeProfile,
    purchase,
    rememberProfiles,
  } = useProfile();
  const [backendProfiles, setBackendProfiles] = useState<DiscoveryProfile[]>([]);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [sentProfile, setSentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!profile) {
      setBackendProfiles([]);
      return;
    }

    let cancelled = false;
    void appServices.discovery
      .listProfiles({
        profileId: profile.id,
        viewerProfile: profile,
        excludedProfileIds: [],
        includePassed: true,
        limit: 20,
      })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          console.log("[fruit] profile discovery failed", {
            code: result.error.code,
            message: result.error.message,
          });
          setBackendProfiles([]);
          return;
        }
        rememberProfiles(result.value.map((item) => item.profile));
        setBackendProfiles(result.value);
      });

    return () => {
      cancelled = true;
    };
  }, [appServices, profile, likedIds, passedIds, rememberProfiles]);

  const trending = useMemo(() => {
    const backendNonFixtureProfiles = backendProfiles.filter(
      (item) => !(item.profile.id in MOCK_PROFILE_BACKEND_IDS)
    );
    const byId = new Map<string, Profile>();
    for (const item of FRUIT_PROFILES) byId.set(item.id, item);
    for (const item of backendNonFixtureProfiles) {
      byId.set(item.profile.id, item.profile);
    }
    const backendProfileIds = new Set(
      backendNonFixtureProfiles.map((item) => item.profile.id)
    );
    const pool = [...byId.values()].filter((p) => {
      if (backendProfileIds.has(p.id)) {
        return p.id !== profile?.id && !likedIds.includes(p.id);
      }
      return !likedIds.includes(p.id) && !passedIds.includes(p.id);
    });
    return pool
      .map((p) => {
        const s = profile
          ? scoreMatch(profile, p)
          : { distanceScore: 0.5, distanceKm: 0 };
        const t = p.trendingScore ?? 0.5;
        const isBoostedProfile =
          MVP_MONETIZATION_ENABLED && p.boostedUntil && p.boostedUntil > Date.now()
            ? 1
            : 0;
        const combined =
          t * 0.7 + s.distanceScore * 0.3 + isBoostedProfile * 0.2;
        return { profile: p, combined, distanceKm: s.distanceKm };
      })
      .sort((a, b) => b.combined - a.combined)
      .sort((a, b) => {
        const aBackend = backendProfileIds.has(a.profile.id);
        const bBackend = backendProfileIds.has(b.profile.id);
        if (aBackend === bBackend) return 0;
        return aBackend ? -1 : 1;
      })
      .slice(0, 12);
  }, [backendProfiles, profile, likedIds, passedIds]);

  const handleLike = (candidate: Profile) => {
    void likeProfile(candidate.id).then((result) => {
      if (result.ok && result.matched) {
        setMatchProfile(candidate);
        return;
      }
      if (result.ok) {
        setSentProfile(candidate);
      }
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Citrus
                size={20}
                color={Colors.palette.honey}
                strokeWidth={2.4}
              />
              <Text style={styles.kicker}>The juiciest right now</Text>
            </View>
            <Text style={styles.brand}>Fruit</Text>
          </View>
          <Pressable
            onPress={() => {
              if (MVP_MONETIZATION_ENABLED) {
                router.push("/paywall?reason=boost");
              } else {
                purchase("boost");
              }
            }}
            style={styles.boostBtn}
            testID="boost-yours"
          >
            <Zap size={12} color="#FFF" fill="#FFF" />
            <Text style={styles.boostBtnText}>Boost yours</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.banner}>
            <LinearGradient
              colors={[Colors.palette.coral, Colors.palette.honey]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerContent}>
              <Flame size={18} color="#FFF" fill="#FFF" />
              <Text style={styles.bannerTitle}>Trending in your orchard</Text>
            </View>
            <Text style={styles.bannerSub}>
              Fresh picks, ripe for connection.
            </Text>
          </View>

          {trending.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Citrus size={32} color={Colors.palette.honey} />
              </View>
              <Text style={styles.emptyTitle}>The basket&apos;s empty</Text>
              <Text style={styles.emptySub}>
                Check back soon for fresh trending profiles.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {trending.map((t) => {
                const p = t.profile;
                const boosted =
                  MVP_MONETIZATION_ENABLED &&
                  p.boostedUntil &&
                  p.boostedUntil > Date.now();
                const isCouple = p.accountType === "couple";
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/match/${p.id}`)}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && { transform: [{ scale: 0.97 }] },
                    ]}
                    testID={`fruit-${p.id}`}
                  >
                    <Image
                      source={{ uri: p.people[0].photo }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(20,10,20,0.92)"]}
                      locations={[0.35, 1]}
                      style={StyleSheet.absoluteFillObject}
                      pointerEvents="none"
                    />
                    {boosted && (
                      <View style={styles.boostTag}>
                        <Zap size={10} color="#FFF" fill="#FFF" />
                        <Text style={styles.boostTagText}>BOOST</Text>
                      </View>
                    )}
                    <View style={styles.matchTag}>
                      <Sparkles size={10} color={Colors.palette.evergreen} />
                      <Text style={styles.matchTagText}>
                        {Math.round(t.combined * 100)}%
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {isCouple && p.people[1]
                          ? `${p.people[0].name} & ${p.people[1].name}`
                          : `${p.people[0].name}, ${p.people[0].age}`}
                      </Text>
                      {(() => {
                        const fruit = getPolyFruit(p.polyType);
                        if (!fruit || !p.polyType) return null;
                        return (
                          <View
                            style={[
                              styles.polyChip,
                              { backgroundColor: fruit.color },
                            ]}
                          >
                            <Text style={styles.polyChipEmoji}>
                              {fruit.emoji}
                            </Text>
                            <Text
                              style={styles.polyChipText}
                              numberOfLines={1}
                            >
                              {p.polyType}
                            </Text>
                          </View>
                        );
                      })()}
                      <View style={styles.cardMeta}>
                        <MapPin size={11} color="rgba(255,255,255,0.85)" />
                        <Text style={styles.cardMetaText} numberOfLines={1}>
                          {p.location.city} ·{" "}
                          {Math.round(t.distanceKm)} km
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={(event: GestureResponderEvent) => {
                        event.stopPropagation();
                        handleLike(p);
                      }}
                      style={({ pressed }) => [
                        styles.likeBtn,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.94 }] },
                      ]}
                      testID={`fruit-like-${p.id}`}
                    >
                      <Heart color="#FFF" size={18} fill="#FFF" />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <FruitMatchOverlay
        profile={matchProfile}
        onClose={() => setMatchProfile(null)}
        onMessage={(profileId) => {
          setMatchProfile(null);
          router.push(`/chat/${profileId}`);
        }}
      />
      <FruitSentOverlay
        profile={sentProfile}
        onClose={() => setSentProfile(null)}
      />
    </View>
  );
}

function profileLabel(profile: Profile) {
  const primary = profile.people[0];
  const secondary = profile.people[1];
  return profile.accountType === "couple" && secondary
    ? `${primary.name} & ${secondary.name}`
    : primary.name;
}

function FruitMatchOverlay({
  profile,
  onClose,
  onMessage,
}: {
  profile: Profile | null;
  onClose: () => void;
  onMessage: (profileId: string) => void;
}) {
  if (!profile) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <View style={styles.overlayCard}>
        <Text style={styles.overlayTitle}>{"It's a match!"}</Text>
        <Text style={styles.overlaySub}>
          You and {profileLabel(profile)} can start chatting now.
        </Text>
        <View style={styles.overlayActions}>
          <Pressable onPress={onClose} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Keep browsing</Text>
          </Pressable>
          <Pressable
            onPress={() => onMessage(profile.id)}
            style={styles.primaryBtn}
          >
            <MessageCircle color="#FFF" size={16} />
            <Text style={styles.primaryText}>Message</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FruitSentOverlay({
  profile,
  onClose,
}: {
  profile: Profile | null;
  onClose: () => void;
}) {
  if (!profile) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <View style={styles.overlayCard}>
        <Text style={styles.overlayTitle}>Like sent</Text>
        <Text style={styles.overlaySub}>
          {profileLabel(profile)} will see your like if you match.
        </Text>
        <Pressable onPress={onClose} style={[styles.primaryBtn, styles.singlePrimaryBtn]}>
          <Text style={styles.primaryText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kicker: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  brand: {
    fontSize: 34,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  boostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.palette.evergreen,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  boostBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  banner: {
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
    minHeight: 88,
    justifyContent: "center",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    aspectRatio: 3 / 4.2,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    shadowColor: "#1F1320",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  likeBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palette.coral,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  boostTag: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.palette.honey,
  },
  boostTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 0.4,
  },
  matchTag: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  matchTagText: {
    color: Colors.palette.evergreen,
    fontSize: 10,
    fontWeight: "800" as const,
  },
  cardInfo: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  cardName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  polyChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 5,
    maxWidth: "100%",
  },
  polyChipEmoji: { fontSize: 10 },
  polyChipText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  cardMetaText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "600" as const,
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(31,19,32,0.48)",
    zIndex: 20,
  },
  overlayCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: "900" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  overlaySub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  overlayActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  singlePrimaryBtn: {
    marginTop: 20,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "900" as const,
    color: "#FFF",
  },
});
