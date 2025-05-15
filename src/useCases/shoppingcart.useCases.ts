import { Request, Response } from "express";
import { ShoppingCartBO } from "../business/ShoppingcartBO";
import {
  CreateShoppingCartRequestExtended,
  CreateShoppingCartResponse,
  GetAllShoppingCartsRequestExtended,
  UpdateShoppingCartRequestExtended,
  ClearCustomerCartRequestExtended,
  ClearCustomerCartResponse,
  GetShoppingCartByIdRequestExtended,
  GetShoppingCartByCustomerIdRequestExtended,
  ShoppingCartResponse,
  ShoppingCartsResponse,
  PaginatedShoppingCartResponse
} from "../types/shoppingcart";
import {ApiResponse} from '../types/serverResponse';
import { responseError, responseOk } from "../utils/standardResponseServer";

// Función de mapeo
function mapShoppingCartToData(cart: import('../models/shoppingcart.entity').ShoppingCart): import('../types/shoppingcart').ShoppingCartData {
  return {
    id: cart.id,
    customerId: cart.customerId,
    productServiceId: cart.productServiceId,
    branchId: cart.branchId,
    quantity: cart.quantity,
    unitPrice: cart.unitPrice,
    totalPrice: cart.totalPrice,
    addedAt: cart.addedAt,
    updatedAt: cart.updatedAt,
  };
}

export class ShoppingCartUseCases {
  private shoppingCartBO: ShoppingCartBO = new ShoppingCartBO();

  createShoppingCart = async (
    req: CreateShoppingCartRequestExtended,
    res: Response<ApiResponse<CreateShoppingCartResponse>>
  ): Promise<void> => {
    try {
      const userInSession = req.user;
      const createdBy = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;
      const body = {
          ...req.body,
          createdBy
      }

      const shoppingCart = await this.shoppingCartBO.createShoppingCart(body);
      res.status(201).json(responseOk({
        id: shoppingCart.id,
        message: "Producto añadido al carrito satisfactoriamente!"
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  }

  getShoppingCartByCustomerId = async (
    req: GetShoppingCartByCustomerIdRequestExtended,
    res: Response<ApiResponse<ShoppingCartsResponse>>
  ): Promise<void> => {
    try {
      const shoppingCarts = await this.shoppingCartBO.getShoppingCartByCustomerId(req.params.customerId);
      const data: ShoppingCartsResponse = {
        shoppingCarts: shoppingCarts.map(mapShoppingCartToData)
      };
      res.status(200).json(responseOk(data));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  }

  getAllShoppingCarts = async (
    req: GetAllShoppingCartsRequestExtended,
    res: Response<ApiResponse<PaginatedShoppingCartResponse>>
  ): Promise<void> => {
    try {
      const { limit, page } = req.query;
      const result = await this.shoppingCartBO.getAllShoppingCarts(
        Number(limit),
        Number(page)
      );
      const data: PaginatedShoppingCartResponse = {
        data: result.data.map(mapShoppingCartToData),
        meta: result.meta
      };
      res.status(200).json(responseOk(data));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  }

  updateShoppingCart = async (
    req: UpdateShoppingCartRequestExtended,
    res: Response<ApiResponse<CreateShoppingCartResponse>>
  ): Promise<void> => {
    try {
      const userInSession = req.user;
      const updatedBy = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;
      const body = {
          ...req.body,
          updatedBy
      }

      const shoppingCart = await this.shoppingCartBO.updateShoppingCart(req.params.id, body);
      if (shoppingCart) {
        res.status(200).json(responseOk({
          id: shoppingCart.id,
          message: "Item del carrito actualizado satisfactoriamente"
        }));
      } else {
        res.status(404).json(responseError({ message: "Item del carrito no encontrado" }));
      }
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  }

  deleteShoppingCart = async (
    req: Request,
    res: Response<ApiResponse<{ message: string }>>
  ): Promise<void> => {
    try {
      const success = await this.shoppingCartBO.deleteShoppingCart(req.params.id);
      if (success) {
        res.status(200).json(responseOk({
          message: "Item del carrito eliminado correctamente"
        }));
      } else {
        res.status(404).json(responseError({ message: "Item del carrito no encontrado" }));
      }
    } catch (error: any) {
      res.status(500).json(responseError({ message: error.message }));
    }
  }

  clearCustomerCart = async (
    req: ClearCustomerCartRequestExtended,
    res: Response<ApiResponse<ClearCustomerCartResponse>>
  ): Promise<void> => {
    try {
      const success = await this.shoppingCartBO.clearCustomerCart(req.params.customerId);
      if (success) {
        res.status(200).json(responseOk({
          message: "Carrito del cliente vaciado correctamente"
        }));
      } else {
        res.status(404).json(responseError({ message: "No se encontraron items en el carrito del cliente" }));
      }
    } catch (error: any) {
      res.status(500).json(responseError({ message: error.message }));
    }
  }
}

// import { Request, Response } from "express";
// import { ShoppingCartBO } from "../business/ShoppingcartBO";
// import {
//   ApiResponse,
//   CreateShoppingCartRequestExtended,
//   CreateShoppingCartResponse,
//   GetAllShoppingCartsRequestExtended,
//   UpdateShoppingCartRequestExtended,
//   ClearCustomerCartRequestExtended,
//   ClearCustomerCartResponse
// } from "../types/shoppingcart";
// import { responseError, responseOk } from "../utils/standardResponseServer";
//
// export class ShoppingCartUseCases {
//   private shoppingCartBO: ShoppingCartBO = new ShoppingCartBO();
//
//   createShoppingCart = async (req: CreateShoppingCartRequestExtended, res: Response<ApiResponse<CreateShoppingCartResponse>>): Promise<void> => {
//     try {
//       const shoppingCart = await this.shoppingCartBO.createShoppingCart(req);
//       res.status(201).json(responseOk({
//         id: shoppingCart.id,
//         message: "Producto añadido al carrito satisfactoriamente!"
//       }));
//     } catch (error: any) {
//       res.status(400).json(responseError({ message: error.message }));
//     }
//   }
//
//   getShoppingCartById = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const shoppingCart = await this.shoppingCartBO.getShoppingCartById(req.params.id);
//       if (shoppingCart) {
//         res.status(200).json(responseOk(shoppingCart));
//       } else {
//         res.status(404).json(responseError({ message: "Item del carrito no encontrado" }));
//       }
//     } catch (error: any) {
//       res.status(400).json(responseError({ message: error.message }));
//     }
//   }
//
//   getShoppingCartByCustomerId = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const shoppingCart = await this.shoppingCartBO.getShoppingCartByCustomerId(req.params.customerId);
//       res.status(200).json(responseOk(shoppingCart));
//     } catch (error: any) {
//       res.status(400).json(responseError({ message: error.message }));
//     }
//   }
//
//   getAllShoppingCarts = async (req: GetAllShoppingCartsRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
//     try {
//       const { limit, page } = req.query;
//       const shoppingCarts = await this.shoppingCartBO.getAllShoppingCarts(
//         Number(limit),
//         Number(page)
//       );
//       res.status(200).json(responseOk(shoppingCarts));
//     } catch (error: any) {
//       res.status(400).json(responseError({ message: error.message }));
//     }
//   }
//
//   updateShoppingCart = async (req: UpdateShoppingCartRequestExtended, res: Response): Promise<void> => {
//     try {
//       const shoppingCart = await this.shoppingCartBO.updateShoppingCart(
//         req.params.id,
//         req
//       );
//       if (shoppingCart) {
//         res.status(200).json(responseOk({
//           id: shoppingCart.id,
//           message: "Item del carrito actualizado satisfactoriamente"
//         }));
//       } else {
//         res.status(404).json(responseError({ message: "Item del carrito no encontrado" }));
//       }
//     } catch (error: any) {
//       res.status(400).json(responseError({ message: error.message }));
//     }
//   }
//
//   deleteShoppingCart = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const success = await this.shoppingCartBO.deleteShoppingCart(req.params.id);
//       if (success) {
//         res.status(200).json(responseOk({
//           message: "Item del carrito eliminado correctamente"
//         }));
//       } else {
//         res.status(404).json(responseError({ message: "Item del carrito no encontrado" }));
//       }
//     } catch (error: any) {
//       res.status(500).json(responseError({ message: error.message }));
//     }
//   }
//
//   clearCustomerCart = async (req: ClearCustomerCartRequestExtended, res: Response<ApiResponse<ClearCustomerCartResponse>>): Promise<void> => {
//     try {
//       const success = await this.shoppingCartBO.clearCustomerCart(req.params.customerId);
//       if (success) {
//         res.status(200).json(responseOk({
//           message: "Carrito del cliente vaciado correctamente"
//         }));
//       } else {
//         res.status(404).json(responseError({ message: "No se encontraron items en el carrito del cliente" }));
//       }
//     } catch (error: any) {
//       res.status(500).json(responseError({ message: error.message }));
//     }
//   }
// }