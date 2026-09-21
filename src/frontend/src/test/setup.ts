// Register the infrastructure mocks before any test module graph is loaded.
// `vi.mock` is hoisted within this module, so importing it here guarantees the
// mock is in place before components import `@caffeineai/core-infrastructure`.
import "@/test/infrastructure-mocks";

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// `main.tsx` installs this so TanStack Router can serialise search params that
// contain BigInts. Tests render the router directly, so install it here too.
BigInt.prototype.toJSON = function toJSON(this: bigint) {
  return this.toString();
};

// jsdom does not implement matchMedia, which Radix UI primitives probe on mount.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Radix Select/Dialog rely on these; jsdom lacks them.
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!window.HTMLElement.prototype.setPointerCapture) {
  window.HTMLElement.prototype.setPointerCapture = () => {};
}
if (!window.HTMLElement.prototype.releasePointerCapture) {
  window.HTMLElement.prototype.releasePointerCapture = () => {};
}

// Radix Switch (via @radix-ui/react-use-size) observes its own size on mount;
// jsdom has no ResizeObserver, so the admin product dialog would crash without
// this inert stand-in.
if (!("ResizeObserver" in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverStub,
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});
