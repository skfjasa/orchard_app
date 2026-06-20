export const LEGAL_CONFIG = {
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || undefined,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || undefined,
  communityStandardsUrl:
    process.env.EXPO_PUBLIC_COMMUNITY_STANDARDS_URL?.trim() || undefined,
  supportEmail:
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || "support@example.com",
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL?.trim() || undefined,
  accountDeletionUrl:
    process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim() || undefined,
};

