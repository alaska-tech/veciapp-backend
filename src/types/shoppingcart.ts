import { Request } from 'express';
import { ShoppingCart } from '../models/shoppingcart.entity';

// Interfaces para las peticiones

export interface GetShoppingCartByCustomerIdRequestExtended extends Request {
  params: { customerId: string }
}

export interface GetAllShoppingCartsRequestExtended extends Request {
  query: {
    limit?: string,
    page?: string
  }
}

export interface CreateShoppingCartRequest {
  customerId: string;
  productServiceId: string;
  branchId: string;
  quantity: number;
  unitPrice: string;
  createdBy?: string;
}

export interface CreateShoppingCartRequestExtended extends Request {
  body: CreateShoppingCartRequest
}

export interface UpdateShoppingCartRequest {
  quantity?: number;
  productServiceId?: string;
  updatedBy?: string;
}

export interface UpdateShoppingCartRequestExtended extends Request {
  params: { id: string };
  body: UpdateShoppingCartRequest;
}

export interface ClearCustomerCartRequestExtended extends Request {
  params: { customerId: string }
}

// Interfaces para las respuestas

export interface CreateShoppingCartResponse {
  id?: string;
  message: string;
}

export interface ClearCustomerCartResponse {
  message: string;
}

export interface ShoppingCartData {
  id: string;
  customerId: string;
  productServiceId: string;
  branchId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  addedAt: Date;
  updatedAt: Date;
}

export interface ShoppingCartsResponse {
  shoppingCarts: ShoppingCartData[];
}

export interface PaginatedShoppingCartResponse {
  data: ShoppingCart[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  }
}