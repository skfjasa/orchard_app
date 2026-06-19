import type { ServiceResponse } from "./service-types";

export type ReportReason =
  | "harassment"
  | "impersonation"
  | "spam"
  | "underage"
  | "unsafe_behavior"
  | "other";

export interface BlockInput {
  blockerId: string;
  blockedId: string;
}

export interface ReportInput {
  reporterId: string;
  reportedUserId: string;
  reportedMessageId?: string;
  reason: ReportReason;
  details?: string;
}

export interface AccountDeletionRequestInput {
  profileId: string;
  reason?: string;
}

export interface SafetyService {
  blockUser(input: BlockInput): Promise<ServiceResponse<void>>;
  reportUser(input: ReportInput): Promise<ServiceResponse<void>>;
  requestAccountDeletion(
    input: AccountDeletionRequestInput
  ): Promise<ServiceResponse<void>>;
}
