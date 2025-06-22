import { PaginationParams } from '../types';

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  return /^zk_(prod|dev)_[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Normalizes an address to lowercase
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Builds query parameters from an object
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.append(key, value.join(','));
      }
    } else if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue !== undefined && subValue !== null) {
          if (Array.isArray(subValue)) {
            if (subValue.length > 0) {
              searchParams.append(`${key}[${subKey}]`, subValue.join(','));
            }
          } else {
            searchParams.append(`${key}[${subKey}]`, String(subValue));
          }
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }
  
  return searchParams.toString();
}

/**
 * Builds pagination query parameters
 */
export function buildPaginationParams(pagination?: PaginationParams): Record<string, any> {
  if (!pagination?.page) return {};
  
  const params: Record<string, any> = {};
  
  if (pagination.page.after) {
    params['page[after]'] = pagination.page.after;
  }
  
  if (pagination.page.before) {
    params['page[before]'] = pagination.page.before;
  }
  
  if (pagination.page.size) {
    params['page[size]'] = pagination.page.size;
  }
  
  return params;
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delayTime = baseDelay * Math.pow(2, attempt - 1);
      await delay(delayTime);
    }
  }
  
  throw lastError!;
}

/**
 * Validates required parameters
 */
export function validateRequired(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(key => {
    const value = params[key];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

/**
 * Formats a number with appropriate precision
 */
export function formatNumber(value: number, precision: number = 2): string {
  if (value === 0) return '0';
  
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(precision) + 'B';
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(precision) + 'M';
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(precision) + 'K';
  }
  
  return value.toFixed(precision);
}

/**
 * Formats a timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Parses a timestamp from various formats
 */
export function parseTimestamp(input: string | number | Date): number {
  if (typeof input === 'number') {
    // Assume Unix timestamp (seconds)
    return input > 1e10 ? Math.floor(input / 1000) : input;
  }
  
  if (typeof input === 'string') {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp format: ${input}`);
    }
    return Math.floor(date.getTime() / 1000);
  }
  
  if (input instanceof Date) {
    return Math.floor(input.getTime() / 1000);
  }
  
  throw new Error(`Invalid timestamp type: ${typeof input}`);
}

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Creates a reference string for NFT
 */
export function createNFTReference(chainId: string, contractAddress: string, tokenId: string): string {
  return `${chainId}:${contractAddress}:${tokenId}`;
}

/**
 * Parses an NFT reference string
 */
export function parseNFTReference(reference: string): { chainId: string; contractAddress: string; tokenId: string } {
  const parts = reference.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid NFT reference format: ${reference}`);
  }
  
  const [chainId, contractAddress, tokenId] = parts;
  return { chainId, contractAddress, tokenId };
}

/**
 * Calculates percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Safely parses JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}