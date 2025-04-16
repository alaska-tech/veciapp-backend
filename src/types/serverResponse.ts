export interface ResponseData<T> {
    data: T | null;
    error: any | null;
    status: string;
}