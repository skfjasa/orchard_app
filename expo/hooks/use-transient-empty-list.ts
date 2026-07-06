import { useEffect, useRef, useState } from "react";

const TRANSIENT_EMPTY_LIST_HOLD_MS = 1500;

export function useTransientEmptyList<T>(items: T[], enabled = true) {
  const lastNonEmptyItemsRef = useRef<T[]>([]);
  const [holdingEmpty, setHoldingEmpty] = useState(false);

  useEffect(() => {
    if (!enabled) {
      lastNonEmptyItemsRef.current = [];
      setHoldingEmpty(false);
      return undefined;
    }

    if (items.length > 0) {
      lastNonEmptyItemsRef.current = items;
      setHoldingEmpty(false);
      return undefined;
    }

    if (lastNonEmptyItemsRef.current.length === 0) {
      setHoldingEmpty(false);
      return undefined;
    }

    setHoldingEmpty(true);
    const timeout = setTimeout(() => {
      lastNonEmptyItemsRef.current = [];
      setHoldingEmpty(false);
    }, TRANSIENT_EMPTY_LIST_HOLD_MS);

    return () => clearTimeout(timeout);
  }, [enabled, items]);

  if (items.length > 0) return items;
  if (enabled && lastNonEmptyItemsRef.current.length > 0) {
    return lastNonEmptyItemsRef.current;
  }
  if (enabled && holdingEmpty) return lastNonEmptyItemsRef.current;
  return items;
}
