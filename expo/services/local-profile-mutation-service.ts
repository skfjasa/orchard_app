import { LinkedPartner, Profile } from "@/types";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function applyProfileMutation(
  profile: Profile | null,
  mutateProfile: (profile: Profile | null) => Profile | null,
  persistProfile: (profile: Profile) => void
): Profile | null {
  const next = mutateProfile(profile);
  if (!next) return profile;
  persistProfile(next);
  return next;
}

export function applyProfilePatch(
  profile: Profile | null,
  patch: Partial<Profile>
): Profile | null {
  if (!profile) return profile;
  return { ...profile, ...patch };
}

export function addPartnerInvite(
  profile: Profile | null,
  email: string,
  displayName?: string,
  now = Date.now()
): Profile | null {
  if (!profile) return profile;

  const linkedPartner: LinkedPartner = {
    id: `lp-${now}`,
    email: email.trim(),
    displayName,
    inviteCode: makeInviteCode(),
    status: "pending",
    invitedAt: now,
    role: "partner",
  };

  return {
    ...profile,
    linkedPartners: [...(profile.linkedPartners ?? []), linkedPartner],
  };
}

export function resendPartnerInvite(
  profile: Profile | null,
  partnerId: string,
  now = Date.now()
): Profile | null {
  if (!profile) return profile;
  const linkedPartners = (profile.linkedPartners ?? []).map((linkedPartner) =>
    linkedPartner.id === partnerId
      ? { ...linkedPartner, inviteCode: makeInviteCode(), invitedAt: now }
      : linkedPartner
  );
  return { ...profile, linkedPartners };
}

export function acceptPartnerLink(
  profile: Profile | null,
  partnerId: string,
  now = Date.now()
): Profile | null {
  if (!profile) return profile;
  const linkedPartners = (profile.linkedPartners ?? []).map((linkedPartner) =>
    linkedPartner.id === partnerId
      ? { ...linkedPartner, status: "linked" as const, linkedAt: now }
      : linkedPartner
  );
  return { ...profile, linkedPartners };
}

export function removePartnerLink(
  profile: Profile | null,
  partnerId: string
): Profile | null {
  if (!profile) return profile;
  const linkedPartners = (profile.linkedPartners ?? []).filter(
    (linkedPartner) => linkedPartner.id !== partnerId
  );
  return {
    ...profile,
    linkedPartners: linkedPartners.length > 0 ? linkedPartners : undefined,
  };
}

export function makeInviteCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return out;
}
