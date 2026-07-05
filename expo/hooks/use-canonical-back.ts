import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

export function useCanonicalBack(href: Href | null, enabled = true) {
  const goBack = useCallback(() => {
    if (!href) return;
    router.replace(href);
  }, [href]);

  useFocusEffect(
    useCallback(() => {
      if (!href || !enabled || Platform.OS !== "android") return undefined;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          goBack();
          return true;
        }
      );

      return () => subscription.remove();
    }, [enabled, goBack, href])
  );

  return goBack;
}
