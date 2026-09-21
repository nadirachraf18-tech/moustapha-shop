import type { MockActor } from "@/test/mock-actor";
import { vi } from "vitest";

/**
 * Module-level holders for the mocked infrastructure hooks. `vi.mock` factories
 * are hoisted above imports, so they cannot close over per-test variables; they
 * read from these holders instead, and tests mutate them before rendering.
 */
export const actorHolder: { actor: MockActor | null; isFetching: boolean } = {
  actor: null,
  isFetching: false,
};

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  clear: () => void;
}

export const authHolder: AuthState = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: () => {},
  clear: () => {},
};

export function setMockActor(
  actor: MockActor | null,
  isFetching = false,
): void {
  actorHolder.actor = actor;
  actorHolder.isFetching = isFetching;
}

export function setAuthState(state: Partial<AuthState>): void {
  Object.assign(authHolder, state);
}

export function resetInfrastructureMocks(): void {
  actorHolder.actor = null;
  actorHolder.isFetching = false;
  authHolder.isAuthenticated = false;
  authHolder.isInitializing = false;
  authHolder.isLoggingIn = false;
  authHolder.login = () => {};
  authHolder.clear = () => {};
}

vi.mock("@caffeineai/core-infrastructure", async () => {
  const actual = await vi.importActual<
    typeof import("@caffeineai/core-infrastructure")
  >("@caffeineai/core-infrastructure");
  return {
    ...actual,
    useActor: () => ({
      actor: actorHolder.actor,
      isFetching: actorHolder.isFetching,
    }),
    useInternetIdentity: () => ({
      identity: undefined,
      login: authHolder.login,
      clear: authHolder.clear,
      loginStatus: "idle",
      isInitializing: authHolder.isInitializing,
      isLoginIdle: true,
      isLoggingIn: authHolder.isLoggingIn,
      isLoginSuccess: false,
      isLoginError: false,
      isAuthenticated: authHolder.isAuthenticated,
    }),
  };
});
