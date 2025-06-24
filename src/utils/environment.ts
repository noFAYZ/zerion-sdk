
/**
 * Environment detection utilities that work across different JavaScript environments
 */

// Type guards for different environments
declare const globalThis: any;

/**
 * Safely checks if we're in a browser environment
 */
export function isBrowser(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.window !== 'undefined' &&
    typeof globalThis.window.document !== 'undefined' &&
    typeof globalThis.window.navigator !== 'undefined'
  );
}

/**
 * Safely checks if we're in a Node.js environment
 */
export function isNode(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.process !== 'undefined' &&
    typeof globalThis.process.versions !== 'undefined' &&
    typeof globalThis.process.versions.node !== 'undefined'
  );
}

/**
 * Safely checks if we're in a Web Worker environment
 */
export function isWebWorker(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.importScripts === 'function' &&
    typeof globalThis.navigator !== 'undefined' &&
    !isBrowser()
  );
}

/**
 * Gets the appropriate global object for the current environment
 */
export function getGlobalThis(): any {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof self !== 'undefined') return self;
  throw new Error('Unable to locate global object');
}

/**
 * Safely encodes a string to base64 using the appropriate method for the environment
 */
export function encodeBase64(str: string): string {
  const globalObj = getGlobalThis();
  
  // Try browser btoa first
  if (typeof globalObj.btoa === 'function') {
    return globalObj.btoa(str);
  }
  
  // Try Node.js Buffer
  if (typeof Buffer !== 'undefined' && Buffer.from) {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  
  // Fallback to manual base64 encoding (not recommended for production)
  return manualBase64Encode(str);
}

/**
 * Manual base64 encoding fallback (simplified, not production-ready)
 */
function manualBase64Encode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63) +
              chars.charAt((bitmap >> 12) & 63) +
              (i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
              (i - 1 < str.length ? chars.charAt(bitmap & 63) : '=');
  }
  
  return result;
}

/**
 * Gets environment-specific HTTP client configuration
 */
export function getHttpClientConfig() {
  const globalObj = getGlobalThis();
  
  return {
    isBrowser: isBrowser(),
    isNode: isNode(),
    isWebWorker: isWebWorker(),
    supportsUserAgent: !isBrowser(),
    supportsWithCredentials: isBrowser() || isWebWorker(),
    preferredAdapter: isBrowser() ? 'xhr' : 'http',
    globalObject: globalObj
  };
}

/**
 * Environment-specific recommendations for API usage
 */
export function getEnvironmentRecommendations(): {
  environment: string;
  recommendations: string[];
  warnings: string[];
} {
  if (isBrowser()) {
    return {
      environment: 'browser',
      recommendations: [
        'Use API routes or proxy server for production to avoid CORS issues',
        'Store API keys securely on the server side, not in client code',
        'Consider implementing request caching for better performance',
        'Use environment variables for development configuration'
      ],
      warnings: [
        'Direct API calls from browser are limited by CORS policy',
        'API keys should never be exposed in client-side code',
        'Some headers like User-Agent cannot be set from browser'
      ]
    };
  } else if (isNode()) {
    return {
      environment: 'node',
      recommendations: [
        'Store API keys securely using environment variables',
        'Implement proper error handling and retry logic',
        'Consider connection pooling for high-volume applications',
        'Use request timeout and rate limiting'
      ],
      warnings: [
        'Ensure API keys are not logged or exposed in error messages',
        'Be mindful of rate limits when making bulk requests'
      ]
    };
  } else if (isWebWorker()) {
    return {
      environment: 'webworker',
      recommendations: [
        'Web Workers can make cross-origin requests but still have limitations',
        'Consider message passing between main thread and worker',
        'Implement proper error handling for network requests'
      ],
      warnings: [
        'Some browser APIs may not be available in Web Worker context',
        'CORS policies still apply to Web Worker requests'
      ]
    };
  } else {
    return {
      environment: 'unknown',
      recommendations: [
        'Environment detection failed - proceed with caution',
        'Test thoroughly in your specific runtime environment'
      ],
      warnings: [
        'Unknown environment detected',
        'Some features may not work as expected'
      ]
    };
  }
}