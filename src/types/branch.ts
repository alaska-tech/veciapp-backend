import { Request } from 'express';
import multer from 'multer';
import {Branch, BranchState} from "../models/branch.entity";
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
    rank?: number;
    state?: BranchState;
}

export interface BranchManageStatusRequest {
    changeTo: BranchState;
    reason: string;
}

export interface BranchUpdateRequest extends Partial<BranchCreateRequest> {}


// Interfaces para extender Request de Express

export interface BranchCreateRequestExtended extends Request {
    body: BranchCreateRequest;
    params: {
        vendorId: string;
    };
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
    query: {
        limit: string;
        page: string;
    };
}

export interface NearbyBranchPaginationRequestExtended extends Request {
    query: {
        latitude: string;
        longitude: string;
        maxDistance?: string;
        limit?: string;
        page?: string;
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
    productServices?: string
}

export interface BranchStats {
    total_branches: number;
    active_branches: number;
    inactive_branches: number;
}

export interface NearbyBranchesOptions {
    latitude: string;
    longitude: string;
    maxDistance?: string;
    limit?: string;
    page?: string;
}

export interface NearbyBranch extends Branch {
    distance: number; // distancia en metros
}

export interface PaginatedNearbyResponse {
    data: NearbyBranch[];
    meta: {
        total: number | string;
        page: number | string;
        limit: number | string;
        lastPage: number | string;
    };
}

export interface FileUpload {
    logo?: string;
    images?: string[];
}

export interface RemoveImageRequest {
    imageUrl: string;
}

export interface FileUploadRequestExtended extends Request {
    params: {
        id: string;
    };
    body: FileUpload;
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export interface RemoveImageRequestExtended extends Request {
    params: {
        id: string;
    };
    body: RemoveImageRequest;
}