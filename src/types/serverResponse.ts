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
