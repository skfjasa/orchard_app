import { makeSimulatedReply } from "@/services/local-interaction-service";
import type { Profile } from "@/types";

export function scheduleSimulatedTextReply(
  other: Profile,
  onReply: (reply: string) => void
): ReturnType<typeof setTimeout> {
  const reply = makeSimulatedReply(other);
  const delay = 1800 + Math.floor(Math.random() * 2500);
  return setTimeout(() => {
    onReply(reply);
  }, delay);
}

export function scheduleSimulatedPhotoApproval(
  onApprove: () => void
): ReturnType<typeof setTimeout> {
  const delay = 2500 + Math.floor(Math.random() * 3500);
  return setTimeout(onApprove, delay);
}
