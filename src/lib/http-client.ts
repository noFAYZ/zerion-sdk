import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ZerionConfig, ZerionAPIError, Environment } from '../types';

export class HttpClient {
  private client: AxiosInstance;
  private config: ZerionConfig;
  private retries: number;
  private retryDelay: number;

  constructor(config: ZerionConfig) {
    this.config = config;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.zerion.io',
      timeout: config.timeout || 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Zerion SDK/1.0.0',
      },
    });

    this.setupAuth();
    this.setupInterceptors();
  }

  private setupAuth(): void {
    const authHeader = this.createAuthHeader(this.config.apiKey);
    this.client.defaults.headers.common['Authorization'] = authHeader;
  }

  private createAuthHeader(apiKey: string): string {
    const encoded = Buffer.from(`${apiKey}:`).toString('base64');
    return `Basic ${encoded}`;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Simple logging without metadata
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Zerion SDK] → ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Zerion SDK] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
      },
      async (error) => {
        // Simple retry logic
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }
        return Promise.reject(this.handleError(error));
      }
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
    if (!error.response) return true; // Network errors
    
    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: unknown): ZerionAPIError {
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
        return new ZerionAPIError(
          'Network error: No response received from server',
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
}