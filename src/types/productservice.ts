import { Request } from 'express';

// --- ENUMS ---
export enum ProductServiceState {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum ProductServiceStateHistory {
  CREATED = 'created',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
}

export enum ProductServiceInventoryUpdateType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
}

// --- REQUESTS GENERALES ---

export interface CreateProductServiceRequest {
  vendorId: string;
  branchId: string;
  categoryId: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  shortDescription?: string;
  price: string;
  discount?: string;
  currency?: string;
  mainImage?: string;
  images?: string[];
  tags?: string[];
  inventory: number;
  presentation?: string;
  ingredients?: string[];
  allergens?: string[];
  isHighlighted?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  state?: ProductServiceState;
  serviceScheduling?: {
    professionalRequired: boolean;
    attentionLimitPerSlot: number;
    availableHours: {
      [day: string]: { open: string; close: string; isOpen: boolean };
    };
  };
  createdBy?: string;
  updatedBy?: string;
  stateHistory?: StateHistoryEntry[];
}

export interface UpdateProductServiceRequest extends Partial<CreateProductServiceRequest> {}

export interface CreateProductServiceRequestExtended extends Request {
  body: CreateProductServiceRequest;
}

export interface UpdateProductServiceRequestExtended extends Request {
  params: { id: string };
  body: UpdateProductServiceRequest;
}

export interface GetProductServiceByIdRequest extends Request {
  params: { id: string }
}

export interface DeleteProductServiceRequest extends Request {
  params: { id: string }
}

export interface UpdateInventoryBody extends Request {
    action: ProductServiceInventoryUpdateType;
    quantity: number;
    updatedBy?: string;
}

export interface UpdateInventoryRequest extends Request {
  params: { id: string };
  body: UpdateInventoryBody
}

export interface ToggleFeatureRequest extends Request {
  params: { id: string };
  body: {
    feature: 'isHighlighted' | 'isBestseller' | 'isNew';
  }
}

export interface UpdateProductStateRequest extends Request {
  params: { id: string };
  body: {
    state: ProductServiceState;
    updatedBy?: string;
  }
}

export interface GetAllProductServicesRequest extends Request {
  query: {
    limit?: string;
    page?: string;
    vendorId?: string;
    branchId?: string;
    categoryId?: string;
    type?: string;
    state?: ProductServiceState;
    isHighlighted?: string;
    isBestseller?: string;
    isNew?: string;
    search?: string;
  }
}

export interface SearchProductsRequest extends Request {
  query: {
    search: string;
    limit?: string;
    page?: string;
    vendorId?: string;
    branchId?: string;
    categoryId?: string;
    type?: string;
    tags?: string[];
    state?: ProductServiceState;
  }
}

// --- RESPONSES GENERALES ---

export interface ProductServiceData {
  id: string;
  vendorId: string;
  branchId: string;
  categoryId: string;
  type: 'product' | 'service';
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  discount: string;
  finalPrice: string;
  currency: string;
  mainImage: string;
  images: string[];
  tags: string[];
  state: ProductServiceState;
  inventory: number;
  presentation?: string;
  ingredients: string[];
  allergens: string[];
  isHighlighted: boolean;
  isBestseller: boolean;
  isNew: boolean;
  serviceScheduling?: {
    professionalRequired: boolean;
    attentionLimitPerSlot: number;
    availableHours: {
      [day: string]: { open: string; close: string; isOpen: boolean };
    };
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  stateHistory?: StateHistoryEntry[];
}

export interface PaginatedProductServiceResponse {
  data: ProductServiceData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  }
}

export interface ProductServiceDetailResponse {
  data: ProductServiceData;
}

export interface CreateProductServiceResponse {
  id?: string;
  message: string;
}

export interface UpdateProductServiceResponse {
  id?: string;
  message: string;
  data?: ProductServiceData;
}

export interface DeleteProductServiceResponse {
  id?: string;
  message: string;
}

export interface InventoryUpdateResponse {
  id?: string;
  previousInventory?: number;
  currentInventory?: number;
  state?: ProductServiceState;
  message: string;
}

export interface StateUpdateResponse {
  id?: string;
  previousState?: ProductServiceState;
  currentState?: ProductServiceState;
  message: string;
}

export interface ToggleFeatureResponse {
  id?: string;
  feature: string;
  value: boolean;
  message: string;
}

export interface StateHistoryEntry {
  state: ProductServiceStateHistory;
  changedAt: Date;
  reason: string;
}