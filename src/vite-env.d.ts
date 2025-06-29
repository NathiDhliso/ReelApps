/// <reference types="vite/client" />

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
