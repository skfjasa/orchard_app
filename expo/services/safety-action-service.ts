import type { AppServices } from "@/services/app-services";
import type { ReportReason } from "./safety-service";

export type SafetyActionResult = { ok: true } | { ok: false; error: string };

interface ReportProfileInput {
  details?: string;
  reportedMessageId?: string;
  reportedProfileId: string;
  reporterId: string;
  reason: ReportReason;
  services: AppServices;
}

interface BlockProfileInput {
  blockedProfileId: string;
  blockerId: string;
  services: AppServices;
}

interface RequestAccountDeletionInput {
  profileId: string;
  reason?: string;
  services: AppServices;
}

export async function reportProfileThroughSafetyService({
  details,
  reportedMessageId,
  reportedProfileId,
  reporterId,
  reason,
  services,
}: ReportProfileInput): Promise<SafetyActionResult> {
  const result = await services.safety.reportUser({
    reporterId,
    reportedUserId: reportedProfileId,
    reportedMessageId,
    reason,
    details,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
}

export async function blockProfileThroughSafetyService({
  blockedProfileId,
  blockerId,
  services,
}: BlockProfileInput): Promise<SafetyActionResult> {
  const result = await services.safety.blockUser({
    blockerId,
    blockedId: blockedProfileId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
}

export async function requestAccountDeletionThroughSafetyService({
  profileId,
  reason,
  services,
}: RequestAccountDeletionInput): Promise<SafetyActionResult> {
  const result = await services.safety.requestAccountDeletion({
    profileId,
    reason,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
}
