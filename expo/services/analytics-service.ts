import type { ServiceResponse } from "./service-types";

export type AnalyticsEventName =
  | "signup_started"
  | "signup_completed"
  | "onboarding_started"
  | "onboarding_completed"
  | "profile_photo_uploaded"
  | "swipe_like"
  | "swipe_pass"
  | "match_created"
  | "chat_opened"
  | "message_sent"
  | "report_submitted"
  | "block_submitted"
  | "unmatch_submitted"
  | "account_deletion_requested"
  | "app_error";

export type AnalyticsProperties = Record<string, string | number | boolean | null>;

export interface AnalyticsService {
  track(
    eventName: AnalyticsEventName,
    properties?: AnalyticsProperties
  ): Promise<ServiceResponse<void>>;
  identify(profileId: string): Promise<ServiceResponse<void>>;
  reset(): Promise<ServiceResponse<void>>;
}
