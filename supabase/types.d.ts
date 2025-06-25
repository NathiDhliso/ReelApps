/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
      delete(key: string): void;
      toObject(): Record<string, string>;
    };
  };
}

// Make this a module to avoid global pollution
export {};