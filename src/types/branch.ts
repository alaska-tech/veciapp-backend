import { Request } from 'express';
import {BranchState} from "../models/branch.entity";
import { Point } from 'typeorm';

// Interfaces para Request

export interface BranchCreateRequest {
    name?: string;
    vendorId?: string;
    address?: string;
    location?: Point;
    businessType?: string;
    operatingHours?: object;
    logo?: string;
    managerName?: string;
    managerPhone?: string;
    images?: string[];
    availablePaymentMethods?: string[];
    description?: string;
}

export interface BranchManageStatusRequest {
    changeTo: BranchState;
    reason: string;
}

export interface BranchUpdateRequest extends Partial<BranchCreateRequest> {}


// Interfaces para extender Request de Express

export interface BranchCreateRequestExtended extends Request {
    body: BranchCreateRequest;
}

export interface BranchUpdateRequestExtended extends Request {
    body: BranchUpdateRequest;
    params: {
        id: string;
    };
}

export interface BranchGetRequestExtended extends Request {
    params: {
        id: string;
    };
}

export interface BranchManageStatusRequestExtended extends Request {
    body: BranchManageStatusRequest;
    params: {
        id: string;
    };
}

export interface BranchStatsRequestExtended extends Request {
    params: {
        start: string,
        end: string
    };
}

export interface BranchPaginationRequestExtended extends Request {
    params: {
        limit: string;
        page: string;
    };
}

export interface BranchValidateEmailRequestExtended extends Request {
    body: {
        hash: string;
        code: string;
        pass: string;
    };
}

// Interfaces para Response


export interface BranchCreateResponse {
    id?: string;
    message: string;
}

export interface BranchResponse {
    name?: string;
    vendorId?: string;
    address?: string;
    location?: Point;
    businessType?: string;
    operatingHours?: object;
    rank?: number;
    state?: BranchState;
    logo?: string;
    managerName?: string;
    managerPhone?: string;
    images?: string[];
    availablePaymentMethods?: string[];
    description?: string;
    message?: string
}

export interface BranchPaginatedResponse {
    items: BranchResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BranchStats {
    total_branches: number;
    active_branches: number;
    inactive_branches: number;
    verified_branches: number;
}