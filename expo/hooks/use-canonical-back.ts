import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

function replaceTo(href: Href) {
  router.replace(href);
}

export function useCanonicalBack(
  href: Href | null,
  enabled = true
) {
  const goBack = useCallback(() => {
    if (!href) return;
    if (Platform.OS === "web") {
      replaceTo(href);
      return;
    }
    router.dismissTo(href);
  }, [href]);

  useFocusEffect(
    useCallback(() => {
      if (!href || !enabled) return undefined;
      if (Platform.OS === "web") {
        const onPopState = () => {
          replaceTo(href);
        };

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
      }

      if (Platform.OS !== "android") return undefined;

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
