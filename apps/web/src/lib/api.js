export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
const API_BASE_URL = __API_BASE_URL__;
export async function apiFetch(path, options = {}, token) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
        throw new ApiError(data?.message || '请求失败', response.status);
    }
    return data;
}
