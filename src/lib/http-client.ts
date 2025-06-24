import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ZerionConfig, ZerionAPIError, Environment } from '../types';
import { isBrowser, isNode, encodeBase64, getHttpClientConfig } from '../utils/environment'

export class HttpClient {
  private client: AxiosInstance;
  private config: ZerionConfig;
  private retries: number;
  private retryDelay: number;

  constructor(config: ZerionConfig) {
    this.config = config;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    const httpConfig = getHttpClientConfig();

    // Create base headers that work in both environments
    const baseHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Only add User-Agent in server environments
    if (httpConfig.supportsUserAgent) {
      baseHeaders['User-Agent'] = 'Zerion SDK/1.0.0';
    }

    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.zerion.io',
      timeout: config.timeout || 30000,
      headers: baseHeaders,
      // Environment-specific configuration
      ...(httpConfig.isBrowser && {
        withCredentials: false,
        adapter: 'xhr' // Force XMLHttpRequest adapter for better browser compatibility
      })
    });

    this.setupAuth();
    this.setupInterceptors();
  }

  private setupAuth(): void {
    const authHeader = this.createAuthHeader(this.config.apiKey);
    this.client.defaults.headers.common['Authorization'] = authHeader;
  }

  private createAuthHeader(apiKey: string): string {
    return `Basic ${encodeBase64(`${apiKey}:`)}`;
  }

  private setupInterceptors(): void {
    const httpConfig = getHttpClientConfig();

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Browser-specific request modifications
        if (httpConfig.isBrowser) {
          // Remove any headers that browsers don't allow
          delete config.headers['User-Agent'];
          
          // Handle potential CORS preflight issues
          if (config.method?.toLowerCase() === 'get') {
            // For GET requests, we can sometimes avoid preflight
            config.headers['Content-Type'] = 'application/json';
          }
        }

    
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
  
        return response;
      },
      async (error) => {
        // Handle CORS errors specifically
        if (httpConfig.isBrowser && this.isCorsError(error)) {
          const corsError = new ZerionAPIError(
            'CORS error: This request must be made from a server environment or through a proxy. Browser requests are limited to localhost, 127.0.0.1, and *.local domains.',
            'CORS_ERROR',
            undefined,
            error
          );
          return Promise.reject(corsError);
        }

        // Simple retry logic
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private isCorsError(error: AxiosError): boolean {
    // Check if it's a CORS error
    return (
      !error.response && 
      error.code === 'ERR_NETWORK' &&
      error.message.includes('CORS')
    ) || (
      error.message.includes('Access to XMLHttpRequest') &&
      error.message.includes('CORS policy')
    );
  }

  private async retryRequest(error: AxiosError, attempt: number = 1): Promise<any> {
    if (attempt >= this.retries) {
      throw this.handleError(error);
    }

    await this.delay(this.retryDelay * attempt);
    
    try {
      return await this.client.request(error.config!);
    } catch (retryError) {
      return this.retryRequest(retryError as AxiosError, attempt + 1);
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      // Don't retry CORS errors
      const httpConfig = getHttpClientConfig();
      if (httpConfig.isBrowser && this.isCorsError(error)) {
        return false;
      }
      return true; // Network errors
    }
    
    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: unknown): ZerionAPIError {
    const httpConfig = getHttpClientConfig();
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        const { status, data } = axiosError.response;
        const message = this.extractErrorMessage(data) || `Request failed with status ${status}`;
        
        return new ZerionAPIError(
          message,
          this.extractErrorCode(data),
          status,
          data
        );
      } else if (axiosError.request) {
        // Request made but no response received
        let message = 'Network error: No response received from server';
        
        // Provide more specific error messages for browser environment
        if (httpConfig.isBrowser) {
          if (this.isCorsError(axiosError)) {
            message = 'CORS error: Cross-origin request blocked. For production use, proxy requests through your backend server.';
          } else if (axiosError.code === 'ERR_NETWORK') {
            message = 'Network error: Unable to connect to Zerion API. Check your internet connection and ensure the API is accessible.';
          }
        }
        
        return new ZerionAPIError(
          message,
          'NETWORK_ERROR',
          undefined,
          axiosError.request
        );
      } else {
        // Something else happened
        return new ZerionAPIError(
          `Request setup error: ${axiosError.message}`,
          'REQUEST_ERROR'
        );
      }
    }

    // Non-axios error
    if (error instanceof Error) {
      return new ZerionAPIError(error.message, 'UNKNOWN_ERROR');
    }

    return new ZerionAPIError('An unknown error occurred', 'UNKNOWN_ERROR');
  }

  private extractErrorMessage(data: any): string | undefined {
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error?.message) return data.error.message;
    if (data?.errors?.[0]?.detail) return data.errors[0].detail;
    return undefined;
  }

  private extractErrorCode(data: any): string | undefined {
    if (data?.code) return data.code;
    if (data?.error?.code) return data.error.code;
    if (data?.errors?.[0]?.code) return data.errors[0].code;
    return undefined;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public setEnvironment(env: Environment): void {
    if (env === 'testnet') {
      this.client.defaults.headers.common['X-Env'] = 'testnet';
    } else {
      delete this.client.defaults.headers.common['X-Env'];
    }
  }

  public setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  public setRetries(retries: number): void {
    this.retries = retries;
  }

  public setRetryDelay(delay: number): void {
    this.retryDelay = delay;
  }

  // Method to check if running in browser environment
  public isBrowserEnvironment(): boolean {
    return isBrowser();
  }

  // Method to get environment-specific recommendations
  public getEnvironmentInfo(): { environment: 'browser' | 'server'; recommendations: string[] } {
    const httpConfig = getHttpClientConfig();
    
    if (httpConfig.isBrowser) {
      return {
        environment: 'browser',
        recommendations: [
          'For production use, consider proxying API requests through your backend server',
          'CORS is limited to localhost, 127.0.0.1, and *.local domains',
          'API keys should be kept secure and not exposed in client-side code',
          'Consider using environment variables for API keys in development'
        ]
      };
    } else {
      return {
        environment: 'server',
        recommendations: [
          'Full API access available in server environment',
          'Store API keys securely using environment variables',
          'Consider implementing rate limiting for high-volume applications',
          'Use connection pooling for better performance'
        ]
      };
    }
  }
}