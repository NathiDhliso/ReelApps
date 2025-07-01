/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_HOME_URL?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_ELEVENLABS_API_KEY?: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Add DOM type declarations
declare global {
  interface Window {
    location: Location;
  }
  
  var window: Window & typeof globalThis;
  var document: Document;
  
  interface KeyboardEvent extends Event {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  }
}
