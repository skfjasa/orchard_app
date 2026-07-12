import { describe, expect, test } from "bun:test";

import {
  AUTH_CALLBACK_PATH,
  buildPasswordResetRedirectOptions,
  buildSignUpRedirectOptions,
  resolveAuthRedirectUrl,
} from "./auth-redirect-service";

const currentOrigin = "https://maturely-usher-electable.ngrok-free.dev";
const currentCallback = `${currentOrigin}${AUTH_CALLBACK_PATH}`;
const nativeCallback = "exp://127.0.0.1:8081/--/onboarding/sign-in";

function resolveWeb(configuredUrl?: string, webOrigin = "https://dynamic.example") {
  return resolveAuthRedirectUrl({
    configuredUrl,
    createNativeUrl: () => nativeCallback,
    platform: "web",
    webOrigin,
  });
}

describe("auth redirect resolution", () => {
  test("configured root origin gains the callback path", () => {
    expect(resolveWeb(currentOrigin)).toBe(currentCallback);
  });

  test("configured root origin with trailing slash gains the callback path", () => {
    expect(resolveWeb(`${currentOrigin}/`)).toBe(currentCallback);
  });

  test("full configured callback remains unchanged", () => {
    expect(resolveWeb(currentCallback)).toBe(currentCallback);
  });

  test("full callback trailing slash is normalized", () => {
    expect(resolveWeb(`${currentCallback}/`)).toBe(currentCallback);
  });

  test("callback path is never duplicated", () => {
    expect(resolveWeb(currentCallback)).not.toContain(
      `${AUTH_CALLBACK_PATH}${AUTH_CALLBACK_PATH}`
    );
  });

  test("dynamic web origin receives the callback path", () => {
    expect(resolveWeb(undefined, "https://dynamic.example")).toBe(
      "https://dynamic.example/onboarding/sign-in"
    );
  });

  test("native builds retain the generated Expo deep link", () => {
    expect(
      resolveAuthRedirectUrl({
        configuredUrl: currentCallback,
        createNativeUrl: () => nativeCallback,
        platform: "native",
      })
    ).toBe(nativeCallback);
  });

  test("explicit non-HTTP native callback remains supported", () => {
    expect(
      resolveAuthRedirectUrl({
        configuredUrl: "orchard://onboarding/sign-in",
        createNativeUrl: () => nativeCallback,
        platform: "native",
      })
    ).toBe("orchard://onboarding/sign-in");
  });

  test("malformed configured URL falls back to dynamic web origin", () => {
    expect(resolveWeb("not a valid url", currentOrigin)).toBe(currentCallback);
  });

  test("unrelated configured web path falls back safely", () => {
    expect(resolveWeb(`${currentOrigin}/obsolete`, currentOrigin)).toBe(
      currentCallback
    );
  });

  test("signup receives the resolved confirmation callback", () => {
    expect(buildSignUpRedirectOptions(resolveWeb(currentOrigin))).toEqual({
      emailRedirectTo: currentCallback,
    });
  });

  test("password reset receives the same resolved callback", () => {
    expect(buildPasswordResetRedirectOptions(resolveWeb(currentOrigin))).toEqual({
      redirectTo: currentCallback,
    });
  });

  test("resulting web callback route remains parseable", () => {
    expect(new URL(resolveWeb(currentOrigin)).pathname).toBe(
      "/onboarding/sign-in"
    );
  });
});
