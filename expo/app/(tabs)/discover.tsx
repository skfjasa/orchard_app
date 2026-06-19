import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Heart,
  MapPin,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react-native";
import SuperLikeIcon from "@/components/SuperLikeIcon";
import SuperLikeBurst from "@/components/SuperLikeBurst";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getPolyFruit } from "@/constants/poly-fruits";
import { MOCK_PROFILES } from "@/mocks/profiles";
import { useProfile } from "@/providers/profile-provider";
import { Profile } from "@/types";
import { rankProfiles } from "@/utils/match";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 40;
const SWIPE_THRESHOLD = 120;

export default function DiscoverScreen() {
  const {
    profile,
    likedIds,
    passedIds,
    likeProfile,
    passProfile,
    totalSlots,
    slotsUsed,
    slotsRemaining,
    isAtMatchLimit,
    isBoosted,
    superLikeProfile,
    superLikeBalance,
  } = useProfile();

  const ranked = useMemo(() => {
    if (!profile) return [];
    const available = MOCK_PROFILES.filter(
      (p) => !likedIds.includes(p.id) && !passedIds.includes(p.id)
    );
    return rankProfiles(profile, available);
  }, [profile, likedIds, passedIds]);

  const pan = useRef(new Animated.ValueXY()).current;
  const swipingRef = useRef<boolean>(false);
  const currentIdRef = useRef<string | undefined>(undefined);
  const [burstVisible, setBurstVisible] = useState<boolean>(false);
  const pendingSuperLikeRef = useRef<string | null>(null);

  const current = ranked[0];
  const next = ranked[1];

  useEffect(() => {
    const id = current?.profile.id;
    if (id !== currentIdRef.current) {
      currentIdRef.current = id;
      pan.setValue({ x: 0, y: 0 });
      swipingRef.current = false;
    }
  }, [current?.profile.id, pan]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const springBack = () => {
    swipingRef.current = false;
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handleSuperLike = () => {
    if (!current || swipingRef.current) return;
    const profileId = current.profile.id;
    const alreadyMatched = likedIds.includes(profileId);
    if (!alreadyMatched && isAtMatchLimit) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      router.push("/paywall?reason=limit");
      return;
    }
    if (superLikeBalance <= 0) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      router.push("/paywall?reason=superlikes");
      return;
    }
    swipingRef.current = true;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    pendingSuperLikeRef.current = profileId;
    setBurstVisible(true);
    setTimeout(() => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }, 120);
    Animated.sequence([
      Animated.delay(420),
      Animated.timing(pan, {
        toValue: { x: 0, y: -SCREEN_W * 1.2 },
        duration: 360,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const handleBurstDone = () => {
    setBurstVisible(false);
    const pid = pendingSuperLikeRef.current;
    pendingSuperLikeRef.current = null;
    if (!pid) return;
    const res = superLikeProfile(pid);
    if (!res.ok && res.reason === "limit") {
      router.push("/paywall?reason=limit");
    } else if (!res.ok && res.reason === "superlikes") {
      router.push("/paywall?reason=superlikes");
    }
  };

  const swipe = (direction: "left" | "right") => {
    if (!current || swipingRef.current) return;
    if (
      direction === "right" &&
      isAtMatchLimit &&
      !likedIds.includes(current.profile.id)
    ) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      router.push("/paywall?reason=limit");
      springBack();
      return;
    }
    swipingRef.current = true;
    const profileId = current.profile.id;
    const toX = direction === "right" ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    triggerHaptic(
      direction === "right"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      if (direction === "right") {
        likeProfile(profileId);
      } else {
        passProfile(profileId);
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          !swipingRef.current &&
          (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) &&
          Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          if (swipingRef.current) return;
          if (g.dx > SWIPE_THRESHOLD) swipe("right");
          else if (g.dx < -SWIPE_THRESHOLD) swipe("left");
          else springBack();
        },
        onPanResponderTerminate: () => {
          if (!swipingRef.current) springBack();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.profile.id, isAtMatchLimit, likedIds]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ["-12deg", "0deg", "12deg"],
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const nextScale = pan.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: [1, 0.94, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>
              Hello, {profile?.people[0]?.name ?? "friend"}
            </Text>
            <Text style={styles.brand}>Discover</Text>
          </View>
          <Pressable
            onPress={() => router.push("/paywall")}
            style={styles.slotsBadge}
            testID="slots-badge"
          >
            <Heart
              size={12}
              color={Colors.palette.coral}
              fill={Colors.palette.coral}
            />
            <Text style={styles.slotsText}>
              {slotsRemaining}/{totalSlots} slots
            </Text>
          </Pressable>
        </View>

        {isBoosted && (
          <View style={styles.boostBanner}>
            <Zap size={14} color={Colors.palette.honey} fill={Colors.palette.honey} />
            <Text style={styles.boostBannerText}>
              {"You're boosted \u2014 trending in your area"}
            </Text>
          </View>
        )}

        <View style={styles.deck}>
          {next && (
            <Animated.View
              style={[
                styles.cardWrap,
                styles.cardBehind,
                { transform: [{ scale: nextScale }] },
              ]}
              pointerEvents="none"
            >
              <ProfileCard data={next.profile} score={next.score.total} />
            </Animated.View>
          )}
          {current ? (
            <Animated.View
              key={current.profile.id}
              style={[
                styles.cardWrap,
                {
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { rotate },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <ProfileCard
                data={current.profile}
                score={current.score.total}
                distanceKm={current.score.distanceKm}
                onPress={() => router.push(`/match/${current.profile.id}`)}
              />
              <Animated.View
                style={[
                  styles.stamp,
                  styles.stampLike,
                  { opacity: likeOpacity },
                ]}
              >
                <Text style={styles.stampText}>LIKE</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.stamp,
                  styles.stampNope,
                  { opacity: nopeOpacity },
                ]}
              >
                <Text style={styles.stampText}>PASS</Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <View style={styles.emptyDeck}>
              <View style={styles.emptyCircle}>
                <Heart color={Colors.light.tint} size={32} />
              </View>
              <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
              <Text style={styles.emptySub}>
                Check back soon for new profiles nearby.
              </Text>
            </View>
          )}
        </View>

        {current && (
          <View style={styles.actions}>
            <ActionButton
              onPress={() => swipe("left")}
              bg={Colors.light.surface}
              border
              testID="pass-btn"
            >
              <X color={Colors.light.text} size={26} strokeWidth={2.5} />
            </ActionButton>
            <View style={styles.superLikeWrap}>
              <ActionButton
                onPress={handleSuperLike}
                bg={Colors.palette.evergreen}
                size={54}
                testID="superlike-btn"
              >
                <SuperLikeIcon size={28} color="#FFF" />
              </ActionButton>
              <View
                style={[
                  styles.superLikeBadge,
                  superLikeBalance === 0 && styles.superLikeBadgeEmpty,
                ]}
              >
                <Text style={styles.superLikeBadgeText}>
                  {superLikeBalance}
                </Text>
              </View>
            </View>
            <ActionButton
              onPress={() => swipe("right")}
              bg={Colors.light.tint}
              testID="like-btn"
            >
              <Heart color="#FFF" size={26} strokeWidth={2.5} fill="#FFF" />
            </ActionButton>
          </View>
        )}
      </SafeAreaView>
      <SuperLikeBurst visible={burstVisible} onDone={handleBurstDone} />
    </View>
  );
}

function ActionButton({
  children,
  onPress,
  bg,
  border,
  size = 64,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  bg: string;
  border?: boolean;
  size?: number;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: border ? 1 : 0,
          borderColor: Colors.light.line,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.92 : 1 }],
          shadowColor: "#1F1320",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

function ProfileCard({
  data,
  score,
  distanceKm,
  onPress,
}: {
  data: Profile;
  score: number;
  distanceKm?: number;
  onPress?: () => void;
}) {
  const primary = data.people[0];
  const secondary = data.people[1];
  const isCouple = data.accountType === "couple";
  const scorePct = Math.round(score * 100);
  const isBoostedProfile =
    data.boostedUntil && data.boostedUntil > Date.now();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardImgs}>
        <Image
          source={{ uri: primary.photo }}
          style={isCouple ? styles.halfImg : styles.fullImg}
          contentFit="cover"
          contentPosition="top"
          transition={200}
        />
        {isCouple && secondary && (
          <Image
            source={{ uri: secondary.photo }}
            style={styles.halfImg}
            contentFit="cover"
            contentPosition="top"
            transition={200}
          />
        )}
      </View>
      <LinearGradient
        colors={["transparent", "rgba(20,10,20,0)", "rgba(20,10,20,0.92)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.scorePill}>
        <Sparkles size={12} color={Colors.palette.honey} />
        <Text style={styles.scorePillText}>{scorePct}% match</Text>
      </View>

      <View style={styles.topRightStack}>
        {isBoostedProfile && (
          <View style={styles.boostedPill}>
            <Zap size={11} color="#FFF" fill="#FFF" />
            <Text style={styles.boostedPillText}>Boosted</Text>
          </View>
        )}
        {isCouple && (
          <View style={styles.coupleBadge}>
            <Users size={12} color="#FFF" />
            <Text style={styles.coupleBadgeText}>Couple</Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>
          {isCouple && secondary
            ? `${primary.name} & ${secondary.name}`
            : primary.name}
          {!isCouple && `, ${primary.age}`}
        </Text>
        {isCouple && secondary && (
          <Text style={styles.cardAges}>
            {primary.age} & {secondary.age}
          </Text>
        )}
        {data.polyType && (() => {
          const fruit = getPolyFruit(data.polyType);
          if (!fruit) return null;
          return (
            <View
              style={[styles.polyChip, { backgroundColor: fruit.color }]}
              testID={`poly-chip-${data.id}`}
            >
              <Text style={styles.polyChipEmoji}>{fruit.emoji}</Text>
              <Text style={styles.polyChipText}>{data.polyType}</Text>
            </View>
          );
        })()}
        <View style={styles.cardMeta}>
          <MapPin size={13} color="rgba(255,255,255,0.85)" />
          <Text style={styles.cardMetaText}>
            {data.location.city}
            {typeof distanceKm === "number"
              ? ` \u00b7 ${Math.round(distanceKm)} km`
              : ""}
          </Text>
        </View>
        {data.bio && (
          <Text style={styles.cardBio} numberOfLines={2}>
            {data.bio}
          </Text>
        )}
        <View style={styles.tagRow}>
          <Tag label={data.lookingFor} tone="honey" />
          {data.preferences.slice(0, 2).map((p) => (
            <Tag key={p} label={p} tone="ghost" />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function Tag({ label, tone }: { label: string; tone: "honey" | "ghost" }) {
  return (
    <View
      style={[
        styles.tag,
        tone === "honey"
          ? { backgroundColor: Colors.palette.honey }
          : { backgroundColor: "rgba(255,255,255,0.18)" },
      ]}
    >
      <Text
        style={[
          styles.tagText,
          tone === "honey" ? { color: Colors.light.accent } : { color: "#FFF" },
        ]}
      >
        {label}
      </Text>
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
    paddingBottom: 10,
  },
  hello: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  brand: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
  },
  slotsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  slotsText: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  boostBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.palette.evergreen,
  },
  boostBannerText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  trendingWrap: {
    marginTop: 6,
    marginBottom: 10,
  },
  trendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  trendingTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  trendingTitle: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: 0.2,
  },
  trendingAction: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.light.tint,
    letterSpacing: 0.3,
  },
  trendingList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  trendCard: {
    width: 100,
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    marginRight: 8,
  },
  trendBoost: {
    position: "absolute",
    top: 7,
    right: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: Colors.palette.honey,
  },
  trendBoostText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "900" as const,
    letterSpacing: 0.4,
  },
  trendInfo: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
  },
  trendName: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800" as const,
  },
  trendCity: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    fontWeight: "600" as const,
    marginTop: 1,
  },
  deck: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardWrap: {
    width: CARD_W,
    aspectRatio: 3 / 4,
    position: "absolute",
  },
  cardBehind: { opacity: 0.95 },
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    shadowColor: "#1F1320",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardImgs: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  fullImg: { flex: 1, height: "100%" },
  halfImg: { flex: 1, height: "100%" },
  scorePill: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(31,19,32,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  scorePillText: {
    color: "#FFF",
    fontWeight: "700" as const,
    fontSize: 12,
  },
  topRightStack: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 6,
    alignItems: "flex-end",
  },
  boostedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.palette.honey,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  boostedPillText: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  coupleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.palette.coral,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  coupleBadgeText: {
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cardInfo: { position: "absolute", left: 20, right: 20, bottom: 24 },
  cardName: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  cardAges: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  polyChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 8,
  },
  polyChipEmoji: { fontSize: 12 },
  polyChipText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  cardMetaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  cardBio: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    fontWeight: "500" as const,
  },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  stamp: {
    position: "absolute",
    top: 30,
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stampLike: {
    right: 24,
    borderColor: Colors.palette.sage,
    transform: [{ rotate: "18deg" }],
  },
  stampNope: {
    left: 24,
    borderColor: Colors.palette.danger,
    transform: [{ rotate: "-18deg" }],
  },
  stampText: {
    fontSize: 22,
    fontWeight: "900" as const,
    letterSpacing: 2,
    color: "#FFF",
  },
  actions: {
    flexDirection: "row",
    gap: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  superLikeWrap: { position: "relative" },
  superLikeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: Colors.palette.honey,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  superLikeBadgeEmpty: {
    backgroundColor: Colors.palette.muted,
  },
  superLikeBadgeText: {
    color: Colors.light.accent,
    fontSize: 11,
    fontWeight: "900" as const,
  },
  emptyDeck: { alignItems: "center", paddingHorizontal: 40 },
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
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
