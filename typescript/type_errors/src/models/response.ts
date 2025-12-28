/**
 * API Response Type Definitions
 */

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: ApiError;
    meta?: ResponseMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ResponseMeta {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    meta: ResponseMeta;
}

export type ExtractData<R> = R extends ApiResponse<infer T> ? T : never;

export type ApiResult<T> = 
    | { success: true; data: T }
    | { success: false; error: ApiError };

export function handleResult<T>(result: ApiResult<T>): T {
    if (result.success) {
        return result.data;
    }
    // because both branches have success property
    throw new Error(result.error.message);
}

export function createResponse<T>(data: T): ApiResponse<T>;
export function createResponse<T>(data: T, meta: ResponseMeta): PaginatedResponse<T>;
export function createResponse<T>(
    data: T,
    meta?: ResponseMeta
): ApiResponse<T> | PaginatedResponse<T> {
    return {
        success: true,
        data,
        meta
    };
}

export function parseResponse<T>(json: string): ApiResponse<T> {
    const parsed = JSON.parse(json);
    return parsed as ApiResponse<T>;
}
