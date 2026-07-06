import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

export function useCanonicalBack(
  href: Href | null,
  enabled = true,
  options: { web?: boolean; webAction?: "dismissTo" | "replace" } = {}
) {
  const goBack = useCallback(() => {
    if (!href) return;
    router.dismissTo(href);
  }, [href]);

  useFocusEffect(
    useCallback(() => {
      if (!href || !enabled) return undefined;
      if (options.web && Platform.OS === "web") {
        const onPopState = () => {
          setTimeout(() => {
            if (options.webAction === "replace") {
              router.replace(href);
              return;
            }
            router.dismissTo(href);
          }, 0);
        };

        globalThis.addEventListener?.("popstate", onPopState);
        return () => {
          globalThis.removeEventListener?.("popstate", onPopState);
        };
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
    }, [enabled, goBack, href, options.web, options.webAction])
  );

  return goBack;
}
