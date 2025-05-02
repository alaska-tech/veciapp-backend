import { Request } from 'express';
import {vendorState} from "../models/vendor.entity";

// Interfaces para Request

export interface BankAccount {
    number: string;
    entity: string;
    type: string;
}

export interface VendorCreateRequest {
    isActive: boolean;
    state: vendorState
    internalCode: string;
    fullName: string;
    email: string;
    cellphone?: string;
    identification?: string;
    age?: number;
    address?: string;
    gender?: string;
    bio?: string;
    rut?: string;
    commercialRegistry?: string;
    bankAccount?: BankAccount;
}

export interface VendorManageStatusRequest {
    changeTo: vendorState;
    reason: string;
}

export interface VendorUpdateRequest extends Partial<VendorCreateRequest> {}


// Interfaces para extender Request de Express

export interface VendorCreateRequestExtended extends Request {
    body: VendorCreateRequest;
}

export interface VendorUpdateRequestExtended extends Request {
    body: VendorUpdateRequest;
    params: {
        id: string;
    };
}

export interface VendorGetRequestExtended extends Request {
    params: {
        id: string;
    };
}

export interface VendorManageStatusRequestExtended extends Request {
    body: VendorManageStatusRequest;
    params: {
        id: string;
    };
}

export interface VendorStatsRequestExtended extends Request {
    params: {
        start: string,
        end: string
    };
}

export interface VendorPaginationRequestExtended extends Request {
    params: {
        limit: string;
        page: string;
    };
}

export interface VendorValidateEmailRequestExtended extends Request {
    body: {
        hash: string;
        code: string;
        pass: string;
    };
}

// Interfaces para Response

export interface VendorCreateResponse {
    id?: string;
    message: string;
}

export interface VendorResponse {
    id?: string;
    internalCode?: string;
    fullname?: string;
    email?: string;
    cellphone?: string;
    identification?: string;
    isHabeasDataConfirm?: boolean;
    age?: number;
    address?: string;
    gender?: string;
    bio?: string;
    rut?: string;
    commercialRegistry?: string;
    bankAccount?: BankAccount;
    createdAt?: Date;
    updatedAt?: Date;
    message?: string;
    code?: string;
}

export interface VendorPaginatedResponse {
    items: VendorResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface VendorStats {
    total_vendors: number;
    active_vendors: number;
    inactive_vendors: number;
    verified_pending: number;
}