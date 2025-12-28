/**
 * HTTP Client
 */

import { ApiResponse, PaginatedResponse, ApiError } from '../models/response';

export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
    timeout?: number;
}

export interface HttpClient {
    get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
    post<T, D>(url: string, data: D, config?: RequestConfig): Promise<ApiResponse<T>>;
    put<T, D>(url: string, data: D, config?: RequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

export class Client implements HttpClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseUrl: string, headers?: Record<string, string>) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
    }

    async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        const response = await this.request('GET', url, undefined, config);
        return response;
    }

    async post<T, D>(url: string, data: D, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request('POST', url, data, config);
    }

    async put<T, D>(url: string, data: D, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request('PUT', url, data, config);
    }

    async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request('DELETE', url, undefined, config);
    }

    private async request<T>(
        method: string,
        url: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        const fullUrl = `${this.baseUrl}${url}`;
        
        const queryParams = new URLSearchParams(config?.params as Record<string, string>);
        
        const headers = {
            ...this.defaultHeaders,
            ...config?.headers
        };

        const fetchConfig: RequestInit = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        };

        try {
            const response = await fetch(
                `${fullUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
                fetchConfig
            );

            const json = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: null as unknown as T,
                    error: json.error
                };
            }

            return {
                success: true,
                data: json.data
            };
        } catch (err) {
            return {
                success: false,
                data: null as unknown as T,
                error: {
                    code: 'NETWORK_ERROR',
                    message: err.message
                }
            };
        }
    }

    async getPaginated<T>(
        url: string,
        page: number,
        pageSize: number
    ): Promise<PaginatedResponse<T>> {
        const response = await this.get<T>(url, {
            params: { page, pageSize }
        });

        return {
            ...response,
            meta: {
                page,
                pageSize,
                total: 0,
                hasMore: false
            }
        };
    }
}

export function createClient(baseUrl: string): HttpClient {
    return new Client(baseUrl);
}
