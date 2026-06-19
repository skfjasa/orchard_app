import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const FRUITS = [
  "🍓",
  "🍒",
  "🍑",
  "🍊",
  "🍍",
  "🍉",
  "🥝",
  "🍇",
  "🍎",
  "🍌",
  "🥭",
  "🍐",
];

interface Particle {
  emoji: string;
  angle: number;
  distance: number;
  size: number;
  rotateTo: string;
  delay: number;
  duration: number;
}

export default function SuperLikeBurst({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone?: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const bannerY = useRef(new Animated.Value(30)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0.6)).current;

  const particles = useMemo<Particle[]>(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const angle =
        (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      return {
        emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)] ?? "🍓",
        angle,
        distance: 140 + Math.random() * 120,
        size: 26 + Math.random() * 20,
        rotateTo: `${Math.floor((Math.random() - 0.5) * 720)}deg`,
        delay: Math.floor(Math.random() * 120),
        duration: 800 + Math.floor(Math.random() * 400),
      };
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    ringScale.setValue(0);
    ringOpacity.setValue(0);
    bannerY.setValue(30);
    bannerOpacity.setValue(0);
    bannerScale.setValue(0.6);

    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
      Animated.sequence([
        Animated.delay(80),
        Animated.parallel([
          Animated.spring(bannerScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(bannerOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(bannerY, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.back(1.6)),
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(bannerOpacity, {
            toValue: 0,
            duration: 260,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(bannerY, {
            toValue: -20,
            duration: 260,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      ]),
    ]).start(() => {
      onDone?.();
    });
  }, [visible, progress, ringScale, ringOpacity, bannerY, bannerOpacity, bannerScale, onDone]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.root} testID="superlike-burst">
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [
              {
                scale: ringScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 3.4],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringInner,
          {
            opacity: ringOpacity,
            transform: [
              {
                scale: ringScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 2.2],
                }),
              },
            ],
          },
        ]}
      />

      {particles.map((p, i) => {
        const dx = Math.cos(p.angle) * p.distance;
        const dy = Math.sin(p.angle) * p.distance - 20;
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dx],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0, dy, dy + 60],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.1, 0.75, 1],
          outputRange: [0, 1, 1, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.2, 1.2, 0.8],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", p.rotateTo],
        });
        return (
          <Animated.Text
            key={`fruit-${i}`}
            style={[
              styles.fruit,
              {
                fontSize: p.size,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                  { rotate },
                ],
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        );
      })}

      <Animated.View
        style={[
          styles.banner,
          {
            opacity: bannerOpacity,
            transform: [
              { translateY: bannerY },
              { scale: bannerScale },
            ],
          },
        ]}
      >
        <Text style={styles.bannerEmoji}>🍓</Text>
        <View>
          <Text style={styles.bannerLabel}>SUPER LIKE</Text>
          <Text style={styles.bannerSub}>Juicy pick!</Text>
        </View>
        <Text style={styles.bannerEmoji}>🍇</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.palette.evergreen,
  },
  ringInner: {
    borderColor: Colors.palette.honey,
    borderWidth: 2,
  },
  fruit: {
    position: "absolute",
    textAlign: "center",
  },
  banner: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: Colors.palette.evergreen,
    shadowColor: "#1F1320",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    maxWidth: SCREEN_W - 40,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerLabel: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900" as const,
    letterSpacing: 1.5,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
    marginTop: 2,
  },
});

// Keep SCREEN_H referenced to avoid unused warning (used for potential future bounds)
void SCREEN_H;
