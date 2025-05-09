export interface ResponseData<T> {
    data: T | null;
    error: any | null;
    status: string;
}

export interface ApiResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
    status: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}