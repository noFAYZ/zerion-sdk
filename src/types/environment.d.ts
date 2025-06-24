// src/types/environment.d.ts

declare global {
    // Extend globalThis to include potential runtime objects
    var globalThis: {
      window?: Window;
      document?: Document;
      navigator?: Navigator;
      process?: NodeJS.Process;
      Buffer?: typeof Buffer;
      btoa?: (data: string) => string;
      atob?: (data: string) => string;
      importScripts?: (...urls: string[]) => void;
      self?: WorkerGlobalScope;
      global?: NodeJS.Global;
    } & typeof globalThis;
  
    // For environments that don't have globalThis
    var window: Window | undefined;
    var global: NodeJS.Global | undefined;
    var self: WorkerGlobalScope | undefined;
    var process: NodeJS.Process | undefined;
    var Buffer: typeof Buffer | undefined;
  }
  
  // Environment detection types
  export interface EnvironmentInfo {
    isBrowser: boolean;
    isNode: boolean;
    isWebWorker: boolean;
    supportsUserAgent: boolean;
    supportsWithCredentials: boolean;
    preferredAdapter: 'xhr' | 'http';
    globalObject: any;
  }
  
  export interface EnvironmentRecommendations {
    environment: 'browser' | 'node' | 'webworker' | 'unknown';
    recommendations: string[];
    warnings: string[];
  }
  
  // HTTP Client specific types
  export interface HttpClientConfig {
    isBrowser: boolean;
    isNode: boolean;
    isWebWorker: boolean;
    supportsUserAgent: boolean;
    supportsWithCredentials: boolean;
    preferredAdapter: string;
    globalObject: any;
  }
  
  export {};