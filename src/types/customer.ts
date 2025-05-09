import { Request } from 'express';
import {CustomerState, Gender} from "../models/customer.entity";

// Interfaces para Request

export interface Locations {
    alias: string;
    address: string;
    coordinates: number[];
}

export interface CustomerCreateRequest {
    isActive: boolean;
    state: CustomerState
    fullName: string;
    email: string;
    password: string;
    cellphone?: string;
    identification?: string;
    age?: number;
    address?: string;
    gender?: string;
    birtdate?: string;
    interests?: string[];
    dietaryRestrictions?: string[];
    preferredPaymentMethod?: string;
    locations?: Locations[];
}

export interface CustomerManageStatusRequest {
    changeTo: CustomerState;
    reason: string;
}

export interface CustomerUpdateRequest extends Partial<CustomerCreateRequest> {}


// Interfaces para extender Request de Express

export interface CustomerCreateRequestExtended extends Request {
    body: CustomerCreateRequest;
}

export interface CustomerUpdateRequestExtended extends Request {
    body: CustomerUpdateRequest;
    params: {
        id: string;
    };
}

export interface CustomerGetRequestExtended extends Request {
    params: {
        id: string;
    };
}

export interface CustomerManageStatusRequestExtended extends Request {
    body: CustomerManageStatusRequest;
    params: {
        id: string;
    };
}

export interface CustomerStatsRequestExtended extends Request {
    params: {
        start: string,
        end: string
    };
}

export interface CustomerPaginationRequestExtended extends Request {
    query: {
        limit: string;
        page: string;
    };
}

export interface CustomerValidateEmailRequestExtended extends Request {
    body: {
        hash: string;
    };
}

// Interfaces para Response

export interface CustomerCreateResponse {
    id?: string;
    message: string;
}

export interface CustomerResponse {
    id?: string;
    isActive?: boolean;
    state?: CustomerState
    fullName?: string;
    email?: string;
    cellphone?: string;
    identification?: string;
    age?: number;
    address?: string;
    gender?: Gender;
    birtdate?: Date;
    score?: number;
    isEmailVerified?: boolean;
    isHabeasDataConfirm?: boolean;
    interests?: string[];
    dietaryRestrictions?: string[];
    preferredPaymentMethod?: string;
    totalSpent?: string;
    avatar?: string;
    locations?: Locations[];
    lastOrderDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    message?: string;
    code?: string;
    stateHistory?: any;


}

export interface CustomerPaginatedResponse {
    items: CustomerResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CustomerStats {
    total_customers: number;
    active_customers: number;
    inactive_customers: number;
    verified_pending: number;
}