import {Request} from 'express'

// Interface for General Request

export interface GetIsActiveExtended extends Request {
    body: { isActive: boolean }
}

export interface ToggleParameterStatusRequestExtended extends Request{
    params: { id: string }
}

export interface GetParameterByNameRequestExtended extends Request {
    params: { name: string }
}

export interface GetAllParameterRequestExtended extends Request {
    query: {
        limit?: string,
        page?: string
    }
}

export interface CreateParameterRequestExtended extends Request {
    body: {
        displayName: string;
        name: string;
        data?: string;
        description: string;
        value: string;
        type: 'string' | 'number' | 'boolean' | 'json';
        isActive?: boolean;
        createdBy: string;
    }
}

export interface UpdateParameterRequestExtended extends Request {
    params: { id: string };
    body: {
        displayName?: string;
        name?: string;
        description?: string;
        value?: string;
        type?: 'string' | 'number' | 'boolean' | 'json';
        isActive?: boolean;
        updatedBy?: string;
    }
}

export interface DeleteParameterRequestExtended extends Request {
    body: { id: string }
}

// Interface for General Response

export interface ApiResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
    status: string;
}

export interface ToggleParameterStatusResponse {
    id?: string,
    isActive?: boolean,
    message: string
}

export interface CreateParameterResponse {
    id?: string,
    message: string
}

export interface GetParameterByNameResponse {
    id?: string,
    name?: string,
    message: string
}

export interface DeleteParameterResponse {
    message: string
}

export interface ParametersData {
    id: string;
    displayName: string;
    name: string;
    description: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ParameterResponse {
    parameters?: ParametersData[];
    count: number
}