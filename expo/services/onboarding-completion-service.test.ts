import { describe, expect, test } from "bun:test";

import type { AppServices } from "./app-services";
import { completeBackendOnboardingProfile } from "./backend-profile-action-service";
import { bootstrapBackendProfile } from "./backend-profile-bootstrap-service";
import {
  completeOnboardingInPhases,
  type OnboardingCompletionDependencies,
  type OnboardingCompletionResult,
  type ProfilePhotoPersistenceResult,
} from "./onboarding-completion-service";
import { selectProfileBootstrapPath } from "./profile-bootstrap-route-service";
import type { CurrentProfileResult } from "./profile-service";
import type { ServiceResponse } from "./service-types";
import {
  toIncompleteProfileInsert,
  toIncompleteProfileUpdate,
  toOnboardingFinalizationUpdate,
  toPostOnboardingProfileUpdate,
} from "./supabase-profile-mappers";
import type { Profile } from "@/types";

const profile: Profile = {
  id: "00000000-0000-4000-8000-000000000001",
  accountType: "single",
  people: [
    {
      name: "Test Person",
      age: 30,
      gender: "Non-binary",
      race: "Prefer not to say",
      photo: "data:image/jpeg;base64,test",
      photos: ["data:image/jpeg;base64,test"],
      interests: [],
    },
  ],
  location: { city: "Portland", lat: 45.5, lng: -122.6 },
  preferences: ["Everyone"],
  lookingFor: "Solo",
  polyType: "Non-hierarchical poly",
  bio: "Test profile",
  socials: {},
  createdAt: 1,
  ageConfirmed: true,
};

const success = <T>(value: T): ServiceResponse<T> => ({ ok: true, value });
const failure = <T>(code: string): ServiceResponse<T> => ({
  ok: false,
  error: { code, message: code },
});

function stagedDependencies(failStage?: string): {
  calls: string[];
  dependencies: OnboardingCompletionDependencies<string[]>;
} {
  const calls: string[] = [];
  return {
    calls,
    dependencies: {
      async prepareProfile() {
        calls.push("prepare");
        return failStage === "prepare"
          ? failure("profile_preparation_failed")
          : success({ status: "prepared" as const });
      },
      async persistMembers() {
        calls.push("members");
        return failStage === "members"
          ? failure<string[]>("profile_members_write_failed")
          : success(["member-0"]);
      },
      async persistSettings() {
        calls.push("settings");
        return failStage === "settings"
          ? failure<void>("user_settings_write_failed")
          : success(undefined);
      },
      async persistPhotos() {
        calls.push("photos");
        return failStage === "photos"
          ? failure<ProfilePhotoPersistenceResult>("profile_photos_write_failed")
          : success({ profile, warnings: [] });
      },
      async finalizeProfile() {
        calls.push("finalize");
        return failStage === "finalize" || failStage === "zero_rows"
          ? failure<Profile>("profile_finalization_failed")
          : success(profile);
      },
    },
  };
}

function profileServices(
  reads: ServiceResponse<CurrentProfileResult>[],
  completion: ServiceResponse<OnboardingCompletionResult> = success({
    profile,
    warnings: [],
  })
) {
  let completionCalls = 0;
  const services = {
    mode: "supabase",
    capabilities: { profiles: "supabase" },
    profiles: {
      async getCurrentProfile() {
        return reads.shift() ?? failure("unexpected_read");
      },
      async completeOnboarding() {
        completionCalls += 1;
        return completion;
      },
    },
  } as unknown as AppServices;
  return { services, completionCalls: () => completionCalls };
}

function pendingStorage(pending: Profile | null) {
  let clearCalls = 0;
  return {
    storage: {
      async load() {
        return pending;
      },
      async clear() {
        clearCalls += 1;
      },
    },
    clearCalls: () => clearCalls,
  };
}

describe("two-phase onboarding mappings", () => {
  test("new profile preparation marks onboarding incomplete", () => {
    expect(toIncompleteProfileInsert(profile).onboarding_completed).toBe(false);
  });

  test("new profile preparation marks the profile invisible", () => {
    expect(toIncompleteProfileInsert(profile).is_visible).toBe(false);
  });

  test("incomplete-profile retry stays incomplete and invisible", () => {
    const update = toIncompleteProfileUpdate(profile);
    expect(update.onboarding_completed).toBe(false);
    expect(update.is_visible).toBe(false);
  });

  test("finalization publishes completion and visibility together", () => {
    const update = toOnboardingFinalizationUpdate();
    expect(update.onboarding_completed).toBe(true);
    expect(update.is_visible).toBe(true);
  });

  test("ordinary post-onboarding edits cannot publish onboarding", () => {
    const update = toPostOnboardingProfileUpdate({ bio: "Updated" });
    expect(update).not.toHaveProperty("onboarding_completed");
    expect(update).not.toHaveProperty("is_visible");
  });
});

describe("two-phase onboarding orchestration", () => {
  test("successful dependent writes are followed by one finalization", async () => {
    const { calls, dependencies } = stagedDependencies();
    expect((await completeOnboardingInPhases(dependencies)).ok).toBe(true);
    expect(calls).toEqual(["prepare", "members", "settings", "photos", "finalize"]);
  });

  test("an already-completed profile is returned without resetting or rewriting it", async () => {
    const calls: string[] = [];
    const result = await completeOnboardingInPhases({
      async prepareProfile() {
        calls.push("prepare");
        return success({ status: "already_completed" as const, profile });
      },
      async persistMembers() { calls.push("members"); return success([]); },
      async persistSettings() { calls.push("settings"); return success(undefined); },
      async persistPhotos() {
        calls.push("photos");
        return success({ profile, warnings: [] });
      },
      async finalizeProfile() { calls.push("finalize"); return success(profile); },
    });
    expect(result).toEqual(success({ profile, warnings: [] }));
    expect(calls).toEqual(["prepare"]);
  });

  for (const [stage, expectedCalls] of [
    ["prepare", ["prepare"]],
    ["members", ["prepare", "members"]],
    ["settings", ["prepare", "members", "settings"]],
    ["photos", ["prepare", "members", "settings", "photos"]],
  ] as const) {
    test(`${stage} failure prevents finalization`, async () => {
      const { calls, dependencies } = stagedDependencies(stage);
      expect((await completeOnboardingInPhases(dependencies)).ok).toBe(false);
      expect(calls).toEqual([...expectedCalls]);
    });
  }

  test("finalization failure is returned instead of success", async () => {
    const { dependencies } = stagedDependencies("finalize");
    const result = await completeOnboardingInPhases(dependencies);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("profile_finalization_failed");
  });

  test("zero-row finalization is treated as finalization failure", async () => {
    const { dependencies } = stagedDependencies("zero_rows");
    const result = await completeOnboardingInPhases(dependencies);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("profile_finalization_failed");
  });

  test("retry after partial member persistence is idempotent", async () => {
    const members = new Set<string>();
    const dependencies = stagedDependencies().dependencies;
    dependencies.persistMembers = async () => {
      members.add("profile-1:0");
      return success(["profile-1:0"]);
    };
    await completeOnboardingInPhases(dependencies);
    await completeOnboardingInPhases(dependencies);
    expect(members.size).toBe(1);
  });

  test("retry after settings persistence is idempotent", async () => {
    const settings = new Set<string>();
    const dependencies = stagedDependencies().dependencies;
    dependencies.persistSettings = async () => {
      settings.add("profile-1");
      return success(undefined);
    };
    await completeOnboardingInPhases(dependencies);
    await completeOnboardingInPhases(dependencies);
    expect(settings.size).toBe(1);
  });

  test("photo ownership failures stay photo-stage failures and prevent finalization", async () => {
    const { calls, dependencies } = stagedDependencies("photos");
    const result = await completeOnboardingInPhases(dependencies);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("profile_photos_write_failed");
    expect(calls).not.toContain("finalize");
  });

  test("post-commit photo cleanup warning still finalizes and remains explicit", async () => {
    const { calls, dependencies } = stagedDependencies();
    dependencies.persistPhotos = async () => {
      calls.push("photos");
      return success({
        profile,
        warnings: [
          {
            code: "profile_photo_cleanup_failed",
            storagePaths: [`${profile.id}/profile_photo/displaced.jpg`],
          },
        ],
      });
    };
    const result = await completeOnboardingInPhases(dependencies);
    expect(result.ok).toBe(true);
    expect(calls.at(-1)).toBe("finalize");
    if (result.ok) expect(result.value.warnings).toHaveLength(1);
  });
});

describe("profile bootstrap and resumption", () => {
  test("missing, incomplete, and completed server results are distinct", () => {
    const results: CurrentProfileResult[] = [
      { status: "missing" },
      { status: "incomplete", profile },
      { status: "completed", profile },
    ];
    expect(results.map((result) => result.status)).toEqual([
      "missing",
      "incomplete",
      "completed",
    ]);
  });

  test("profile read failure remains distinct from missing", async () => {
    const { services } = profileServices([failure("profile_read_failed")]);
    const result = await bootstrapBackendProfile({ services, userId: profile.id });
    expect(result.status).toBe("failed");
  });

  test("incomplete profile without a local draft selects onboarding resume", async () => {
    const { services } = profileServices([
      success({ status: "incomplete", profile }),
    ]);
    const pending = pendingStorage(null);
    const result = await bootstrapBackendProfile({
      pendingStorage: pending.storage,
      services,
      userId: profile.id,
    });
    expect(result.status).toBe("incomplete");
    expect(selectProfileBootstrapPath({
      backendProfileIncomplete: true,
      hasProfile: false,
      hasSession: true,
      mode: "supabase",
    })).toBe("onboarding_profile");
  });

  test("completed profile continues through the protected-app path", async () => {
    const { services } = profileServices([
      success({ status: "completed", profile }),
    ]);
    const result = await bootstrapBackendProfile({ services, userId: profile.id });
    expect(result.status).toBe("loaded");
    expect(selectProfileBootstrapPath({
      backendProfileIncomplete: false,
      hasProfile: true,
      hasSession: true,
      mode: "supabase",
    })).toBe("protected_app");
  });

  test("confirmation-required resumption uses the same completion service", async () => {
    const fake = profileServices([success({ status: "missing" })]);
    const pending = pendingStorage(profile);
    const result = await bootstrapBackendProfile({
      email: "test@example.test",
      pendingStorage: pending.storage,
      services: fake.services,
      userId: profile.id,
    });
    expect(result.status).toBe("loaded");
    expect(fake.completionCalls()).toBe(1);
    expect(pending.clearCalls()).toBe(1);
  });

  test("an incomplete server row resumes through the two-phase completion service", async () => {
    const fake = profileServices([
      success({ status: "incomplete", profile }),
    ]);
    const pending = pendingStorage(profile);
    const result = await bootstrapBackendProfile({
      pendingStorage: pending.storage,
      services: fake.services,
      userId: profile.id,
    });
    expect(result.status).toBe("loaded");
    expect(fake.completionCalls()).toBe(1);
  });

  test("immediate-session signup uses backend completion once", async () => {
    const fake = profileServices([]);
    const result = await completeBackendOnboardingProfile({
      profile,
      services: fake.services,
    });
    expect(result.status).toBe("completed");
    expect(fake.completionCalls()).toBe(1);
  });

  test("mock onboarding remains local and skips backend completion", async () => {
    let calls = 0;
    const services = {
      mode: "mock",
      capabilities: { profiles: "mock" },
      profiles: { async completeOnboarding() { calls += 1; return success(profile); } },
    } as unknown as AppServices;
    const result = await completeBackendOnboardingProfile({ profile, services });
    expect(result.status).toBe("skipped");
    expect(calls).toBe(0);
  });
});
