import {Request} from "express";

export interface FavoriteResponse {
  id?: string;
  userId: string;
  productServiceId: string;
  productService?: any;
  createdAt?: Date;
}

export interface CreateFavoriteRequest {
  userId: string;
  productServiceId: string;
}

//---------Requests---------//
export interface CreateFavoriteRequestExtended extends Request {
  body: CreateFavoriteRequest;
}

export interface GetFavoritesByUserIdRequestExtended extends Request {
  params: {
    userId: string;
  };
  query: {
    limit?: string;
    page?: string;
  };
}

export interface DeleteFavoriteRequestExtended extends Request {
  params: {
    userId: string;
    productServiceId: string;
  };
}

//---------Responses---------//
export interface CreateFavoriteResponse {
  id?: string;
  message: string;
}