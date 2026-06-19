import type { StorageService } from "@/services";

import { ok } from "./mock-service-response";
import type { MockServiceState } from "./mock-service-state";

export function createMockStorageService(state: MockServiceState): StorageService {
  return {
    async upload(input) {
      const storagePath = `mock/${input.profileId}/${input.purpose}/${Date.now()}`;
      state.uploads.push({
        storagePath,
        localUri: input.localUri,
        createdAt: Date.now(),
      });
      return ok({ storagePath, publicUrl: input.localUri });
    },

    async remove(storagePath) {
      state.uploads = state.uploads.filter(
        (upload) => upload.storagePath !== storagePath
      );
      return ok(undefined);
    },
  };
}
