export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare function apiFetch<T>(path: string, options?: RequestInit, token?: string | null): Promise<T>;
