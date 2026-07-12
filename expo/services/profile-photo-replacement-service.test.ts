import { describe, expect, test } from "bun:test";

import type { Profile } from "@/types";

import {
  buildSignedPhotosByMemberId,
  isOwnedProfilePhotoPath,
  persistProfilePhotosTransactionally,
  type ProfilePhotoMetadata,
  type ProfilePhotoReplacementDependencies,
} from "./profile-photo-replacement-service";
import type { ServiceResponse } from "./service-types";

const profileId = "00000000-0000-4000-8000-000000000001";
const memberOne = "10000000-0000-4000-8000-000000000001";
const memberTwo = "10000000-0000-4000-8000-000000000002";

const baseProfile: Profile = {
  id: profileId,
  accountType: "couple",
  people: [
    {
      name: "One",
      age: 30,
      gender: "Non-binary",
      race: "Prefer not to say",
      photo: "local-one",
      photos: ["local-one", "https://signed.example/unchanged"],
      interests: [],
    },
    {
      name: "Two",
      age: 31,
      gender: "Woman",
      race: "Prefer not to say",
      photo: "local-two",
      photos: ["local-two"],
      interests: [],
    },
  ],
  location: { city: "Portland", lat: 45.5, lng: -122.6 },
  preferences: ["Everyone"],
  lookingFor: "Together",
  socials: {},
  createdAt: 1,
  ageConfirmed: true,
};

const currentPhotos: ProfilePhotoMetadata[] = [
  {
    id: "photo-1",
    memberId: memberOne,
    moderationStatus: "approved",
    profileId,
    sortOrder: 0,
    storagePath: `${profileId}/profile_photo/old-one.jpg`,
  },
  {
    id: "photo-2",
    memberId: memberOne,
    moderationStatus: "approved",
    profileId,
    sortOrder: 1,
    storagePath: `${profileId}/profile_photo/unchanged.jpg`,
  },
];

const ok = <T>(value: T): ServiceResponse<T> => ({ ok: true, value });
const fail = <T>(code: string): ServiceResponse<T> => ({
  ok: false,
  error: { code, message: code },
});

interface FakeOptions {
  cleanupFailures?: string[];
  displacedPaths?: string[];
  replacementFailure?: boolean;
  uploadFailureAt?: number;
  uploadPaths?: string[];
}

function fakeDependencies(options: FakeOptions = {}) {
  const events: string[] = [];
  const removed: string[] = [];
  const replacementInputs: Parameters<
    ProfilePhotoReplacementDependencies["replaceMetadata"]
  >[0][] = [];
  let uploadIndex = 0;
  const uploadPaths = options.uploadPaths ?? [
    `${profileId}/profile_photo/new-one.jpg`,
    `${profileId}/profile_photo/new-two.jpg`,
  ];

  const dependencies: ProfilePhotoReplacementDependencies = {
    async loadCurrentMetadata() {
      events.push("metadata:read");
      return ok(currentPhotos);
    },
    async upload() {
      const index = uploadIndex++;
      events.push(`upload:${index}`);
      if (options.uploadFailureAt === index) return fail("upload_failed");
      const storagePath = uploadPaths[index] ?? uploadPaths.at(-1)!;
      return ok({
        storagePath,
        publicUrl: `https://signed.example/new-${index}`,
      });
    },
    async replaceMetadata(input) {
      events.push("rpc");
      replacementInputs.push(input);
      if (options.replacementFailure) return fail("rpc_failed");
      const committedPhotos = [
        ...currentPhotos.filter(
          (photo) =>
            !input.desiredPhotos.some(
              (desired) =>
                desired.memberId === photo.memberId &&
                desired.sortOrder === photo.sortOrder
            )
        ),
        ...input.desiredPhotos.map((desired, index) => ({
          id: `committed-${index}`,
          memberId: desired.memberId,
          moderationStatus: "pending" as const,
          profileId,
          sortOrder: desired.sortOrder,
          storagePath: desired.storagePath,
        })),
      ];
      return ok({
        committedPhotos,
        displacedPaths: options.displacedPaths ?? [],
      });
    },
    async remove(storagePath) {
      events.push(`remove:start:${storagePath}`);
      await Promise.resolve();
      removed.push(storagePath);
      events.push(`remove:end:${storagePath}`);
      return options.cleanupFailures?.includes(storagePath)
        ? fail("remove_failed")
        : ok(undefined);
    },
  };

  return { dependencies, events, removed, replacementInputs };
}

const members = [
  { id: memberOne, sort_order: 0 },
  { id: memberTwo, sort_order: 1 },
];

describe("transactional profile photo replacement", () => {
  test("all uploads finish before one metadata RPC", async () => {
    const fake = fakeDependencies();
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(true);
    expect(fake.events).toEqual(["metadata:read", "upload:0", "upload:1", "rpc"]);
    expect(fake.replacementInputs).toHaveLength(1);
  });

  test("upload failure prevents RPC and awaits cleanup of earlier uploads", async () => {
    const fake = fakeDependencies({ uploadFailureAt: 1 });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(false);
    expect(fake.replacementInputs).toHaveLength(0);
    expect(fake.events.at(-1)).toBe(
      `remove:end:${profileId}/profile_photo/new-one.jpg`
    );
  });

  test("upload compensation failure is observable", async () => {
    const path = `${profileId}/profile_photo/new-one.jpg`;
    const fake = fakeDependencies({
      cleanupFailures: [path],
      uploadFailureAt: 1,
    });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("profile_photos_upload_cleanup_failed");
      expect(result.error.message).toContain(path);
    }
  });

  test("RPC failure cleans every new object and preserves old objects", async () => {
    const fake = fakeDependencies({ replacementFailure: true });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(false);
    expect(fake.removed).toEqual([
      `${profileId}/profile_photo/new-one.jpg`,
      `${profileId}/profile_photo/new-two.jpg`,
    ]);
    expect(fake.removed).not.toContain(currentPhotos[0].storagePath);
  });

  test("RPC cleanup failure is observable", async () => {
    const path = `${profileId}/profile_photo/new-two.jpg`;
    const fake = fakeDependencies({
      cleanupFailures: [path],
      replacementFailure: true,
    });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("profile_photos_replacement_cleanup_failed");
    }
  });

  test("old objects are removed only after commit", async () => {
    const oldPath = currentPhotos[0].storagePath;
    const fake = fakeDependencies({ displacedPaths: [oldPath] });
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.events.indexOf("rpc")).toBeLessThan(
      fake.events.indexOf(`remove:start:${oldPath}`)
    );
  });

  test("only returned displaced paths are removed", async () => {
    const oldPath = currentPhotos[0].storagePath;
    const fake = fakeDependencies({ displacedPaths: [oldPath] });
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.removed).toEqual([oldPath]);
  });

  test("committed paths are never removed", async () => {
    const committedPath = `${profileId}/profile_photo/new-one.jpg`;
    const fake = fakeDependencies({ displacedPaths: [committedPath] });
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.removed).not.toContain(committedPath);
  });

  test("duplicate displaced paths are removed once", async () => {
    const oldPath = currentPhotos[0].storagePath;
    const fake = fakeDependencies({ displacedPaths: [oldPath, oldPath] });
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.removed).toEqual([oldPath]);
  });

  test("cross-owned displaced paths are not deleted and produce a warning", async () => {
    const invalid = "00000000-0000-4000-8000-000000000099/profile_photo/old.jpg";
    const fake = fakeDependencies({ displacedPaths: [invalid] });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.removed).toHaveLength(0);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.warnings[0]?.storagePaths).toEqual([invalid]);
  });

  test("malformed displaced paths are not deleted", async () => {
    const fake = fakeDependencies({ displacedPaths: ["/profile_photo/old.jpg"] });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(fake.removed).toHaveLength(0);
    expect(result.ok && result.value.warnings).toHaveLength(1);
  });

  test("post-commit deletion failure is non-fatal and explicit", async () => {
    const oldPath = currentPhotos[0].storagePath;
    const fake = fakeDependencies({
      cleanupFailures: [oldPath],
      displacedPaths: [oldPath],
    });
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.warnings).toEqual([
        { code: "profile_photo_cleanup_failed", storagePaths: [oldPath] },
      ]);
    }
  });

  test("unchanged remote photos retain authoritative slots without URL parsing", async () => {
    const remoteOnly = {
      ...baseProfile,
      people: [
        {
          ...baseProfile.people[0],
          photo: "https://signed.example/opaque?token=not-a-path",
          photos: ["https://signed.example/opaque?token=not-a-path"],
        },
      ],
    };
    const fake = fakeDependencies();
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members: [members[0]],
      profile: remoteOnly,
    });
    expect(result.ok).toBe(true);
    expect(fake.replacementInputs).toHaveLength(0);
    expect(fake.events).toEqual(["metadata:read"]);
  });

  test("mixed remote and local slots submit only local replacements", async () => {
    const fake = fakeDependencies();
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members: [members[0]],
      profile: baseProfile,
    });
    expect(fake.replacementInputs[0].desiredPhotos).toEqual([
      {
        memberId: memberOne,
        sortOrder: 0,
        storagePath: `${profileId}/profile_photo/new-one.jpg`,
      },
    ]);
  });

  test("multi-member and multi-photo slots map by member and sort order", async () => {
    const multi = {
      ...baseProfile,
      people: baseProfile.people.map((person, index) => ({
        ...person,
        photos: [`local-${index}-0`, `local-${index}-1`],
      })),
    };
    const fake = fakeDependencies({
      uploadPaths: [0, 1, 2, 3].map(
        (index) => `${profileId}/profile_photo/new-${index}.jpg`
      ),
    });
    await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: multi,
    });
    expect(fake.replacementInputs[0].desiredPhotos.map((photo) => [
      photo.memberId,
      photo.sortOrder,
    ])).toEqual([
      [memberOne, 0],
      [memberOne, 1],
      [memberTwo, 0],
      [memberTwo, 1],
    ]);
  });

  test("ownership validation mirrors the item 4 path contract", () => {
    expect(
      isOwnedProfilePhotoPath(
        profileId,
        `${profileId}/profile_photo/valid-file.jpg`
      )
    ).toBe(true);
    expect(
      isOwnedProfilePhotoPath(
        profileId,
        `00000000-0000-4000-8000-000000000099/profile_photo/file.jpg`
      )
    ).toBe(false);
    expect(isOwnedProfilePhotoPath(profileId, "/profile_photo/file.jpg")).toBe(false);
  });

  test("successful uploads replace local presentation URLs", async () => {
    const fake = fakeDependencies();
    const result = await persistProfilePhotosTransactionally({
      dependencies: fake.dependencies,
      members,
      profile: baseProfile,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.profile.people[0].photo).toBe(
        "https://signed.example/new-0"
      );
      expect(result.value.profile.people[1].photo).toBe(
        "https://signed.example/new-1"
      );
    }
  });
});

describe("profile photo presentation reads", () => {
  test("authoritative storage paths become signed presentation URLs", async () => {
    const rows = [
      {
        memberId: memberOne,
        storagePath: `${profileId}/profile_photo/read.jpg`,
        sortOrder: 0,
      },
    ];
    const signed = await buildSignedPhotosByMemberId(
      rows,
      async (path) => `https://signed.example/${encodeURIComponent(path)}`
    );
    expect(signed[memberOne][0]).toContain("https://signed.example/");
  });
});
