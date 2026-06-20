import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";

import {
  AccountType,
  Gender,
  LookingFor,
  PersonProfile,
  PolyamoryType,
  Preference,
  Race,
  Socials,
} from "@/types";

export interface Draft {
  accountType: AccountType;
  people: Partial<PersonProfile>[];
  city: string;
  preferences: Preference[];
  lookingFor: LookingFor;
  polyType?: PolyamoryType;
  bio: string;
  socials: Socials;
  emails: string[];
  usernames: string[];
  passwords: string[];
  ageConfirmed: boolean;
  legalAcceptedAt?: number;
}

const INITIAL: Draft = {
  accountType: "single",
  people: [{ photos: [] }],
  city: "",
  preferences: [],
  lookingFor: "Solo",
  bio: "",
  socials: {},
  emails: ["", ""],
  usernames: ["", ""],
  passwords: ["", ""],
  ageConfirmed: false,
  legalAcceptedAt: undefined,
};

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [draft, setDraft] = useState<Draft>(INITIAL);

  const setAccountType = useCallback((t: AccountType) => {
    setDraft((d) => ({
      ...d,
      accountType: t,
      people:
        t === "couple"
          ? [d.people[0] ?? { photos: [] }, d.people[1] ?? { photos: [] }]
          : [d.people[0] ?? { photos: [] }],
      lookingFor: t === "couple" ? "Together" : d.lookingFor,
    }));
  }, []);

  const setEmail = useCallback((index: number, email: string) => {
    setDraft((d) => {
      const emails = [...d.emails];
      emails[index] = email;
      return { ...d, emails };
    });
  }, []);

  const setUsername = useCallback((index: number, username: string) => {
    setDraft((d) => {
      const usernames = [...d.usernames];
      usernames[index] = username;
      return { ...d, usernames };
    });
  }, []);

  const setPassword = useCallback((index: number, password: string) => {
    setDraft((d) => {
      const passwords = [...d.passwords];
      passwords[index] = password;
      return { ...d, passwords };
    });
  }, []);

  const acceptLegal = useCallback(() => {
    setDraft((d) => ({
      ...d,
      ageConfirmed: true,
      legalAcceptedAt: Date.now(),
    }));
  }, []);

  const setPerson = useCallback(
    (index: number, patch: Partial<PersonProfile>) => {
      setDraft((d) => {
        const people = d.people.slice();
        people[index] = { ...people[index], ...patch };
        return { ...d, people };
      });
    },
    []
  );

  const addPhoto = useCallback((index: number, uri: string) => {
    setDraft((d) => {
      const people = d.people.slice();
      const curr = people[index] ?? {};
      const photos = [...(curr.photos ?? [])];
      if (photos.length >= 5) return d;
      photos.push(uri);
      people[index] = { ...curr, photos, photo: curr.photo ?? photos[0] };
      return { ...d, people };
    });
  }, []);

  const removePhoto = useCallback((index: number, photoIndex: number) => {
    setDraft((d) => {
      const people = d.people.slice();
      const curr = people[index] ?? {};
      const photos = [...(curr.photos ?? [])];
      photos.splice(photoIndex, 1);
      people[index] = {
        ...curr,
        photos,
        photo: photos[0] ?? undefined,
      };
      return { ...d, people };
    });
  }, []);

  const setCity = useCallback((city: string) => {
    setDraft((d) => ({ ...d, city }));
  }, []);

  const togglePreference = useCallback((p: Preference) => {
    setDraft((d) => {
      if (p === "Everyone") {
        return {
          ...d,
          preferences: d.preferences.includes("Everyone") ? [] : ["Everyone"],
        };
      }
      const without = d.preferences.filter((x) => x !== "Everyone");
      return {
        ...d,
        preferences: without.includes(p)
          ? without.filter((x) => x !== p)
          : [...without, p],
      };
    });
  }, []);

  const setLookingFor = useCallback((v: LookingFor) => {
    setDraft((d) => ({ ...d, lookingFor: v }));
  }, []);

  const setPolyType = useCallback((v: PolyamoryType | undefined) => {
    setDraft((d) => ({ ...d, polyType: v }));
  }, []);

  const setGender = useCallback(
    (index: number, g: Gender) => {
      setPerson(index, { gender: g });
    },
    [setPerson]
  );

  const setRace = useCallback(
    (index: number, r: Race) => {
      setPerson(index, { race: r });
    },
    [setPerson]
  );

  const setBio = useCallback((bio: string) => {
    setDraft((d) => ({ ...d, bio }));
  }, []);

  const setSocial = useCallback(
    (key: keyof Socials, value: string) => {
      setDraft((d) => ({
        ...d,
        socials: { ...d.socials, [key]: value },
      }));
    },
    []
  );

  const reset = useCallback(() => setDraft(INITIAL), []);

  return useMemo(
    () => ({
      draft,
      setAccountType,
      setPerson,
      addPhoto,
      removePhoto,
      setCity,
      togglePreference,
      setLookingFor,
      setPolyType,
      setGender,
      setRace,
      setBio,
      setSocial,
      setEmail,
      setUsername,
      setPassword,
      acceptLegal,
      reset,
    }),
    [
      draft,
      setAccountType,
      setPerson,
      addPhoto,
      removePhoto,
      setCity,
      togglePreference,
      setLookingFor,
      setPolyType,
      setGender,
      setRace,
      setBio,
      setSocial,
      setEmail,
      setUsername,
      setPassword,
      acceptLegal,
      reset,
    ]
  );
});
