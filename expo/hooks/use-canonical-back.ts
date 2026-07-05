import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

export function useCanonicalBack(href: Href, enabled = true) {
  const goBack = useCallback(() => {
    router.replace(href);
  }, [href]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || Platform.OS !== "android") return undefined;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          goBack();
          return true;
        }
      );

      return () => subscription.remove();
    }, [enabled, goBack])
  );

  return goBack;
}
