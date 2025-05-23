import { ShoppingCart } from "../models/shoppingcart.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  CreateShoppingCartRequest,
  CreateShoppingCartRequestExtended, UpdateShoppingCartRequest,
  UpdateShoppingCartRequestExtended,
} from "../types/shoppingcart";
import { PaginatedResponse } from "../types/serverResponse";

export class ShoppingcartBO {
  private repository: Repository<ShoppingCart>;

  constructor() {
    this.repository = AppDataSource.getRepository(ShoppingCart);
  }

  // Métodos de negocio
  async getShoppingCartById(id: string): Promise<ShoppingCart | null> {
    return this.repository.findOneBy({ id });
  }

  async getShoppingCartByCustomerId(customerId: string): Promise<ShoppingCart[]> {
    return this.repository.findBy({ customerId });
  }

  async getAllShoppingCarts(limit: number, page: number): Promise<PaginatedResponse<ShoppingCart>> {
    const [data, total] = (limit && page) ? await this.repository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: {
        addedAt: 'DESC'
      }
    }) : await this.repository.findAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async createShoppingCart(shoppingCartData: CreateShoppingCartRequest): Promise<ShoppingCart> {
    // Implementar validaciones de negocio
    const shoppingCartDataBody = shoppingCartData;

    console.log('Body recibido:', shoppingCartDataBody);

    if (!shoppingCartDataBody.customerId) {
      throw new Error('El ID del cliente es requerido');
    }

    if (!shoppingCartDataBody.productServiceId) {
      throw new Error('El ID del producto/servicio es requerido');
    }

    if (!shoppingCartDataBody.branchId) {
      throw new Error('El ID de la sucursal es requerido');
    }

    if (!shoppingCartDataBody.quantity || shoppingCartDataBody.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a cero');
    }

    if (!shoppingCartDataBody.unitPrice) {
      throw new Error('El precio unitario es requerido');
    }

    // Calcular el precio total
    const unitPrice = parseFloat(shoppingCartDataBody.unitPrice);
    const totalPrice = (unitPrice * shoppingCartDataBody.quantity).toFixed(2);

    // Comprobar si ya existe un item con el mismo producto para el mismo cliente
    const existingItem = await this.repository.findOne({
      where: {
        customerId: shoppingCartDataBody.customerId,
        productServiceId: shoppingCartDataBody.productServiceId,
        branchId: shoppingCartDataBody.branchId
      }
    });

    if (existingItem) {
      // Si existe, actualizar la cantidad y el precio total
      existingItem.quantity += shoppingCartDataBody.quantity;
      existingItem.totalPrice = (parseFloat(existingItem.totalPrice) + parseFloat(totalPrice)).toFixed(2);
      return this.repository.save(existingItem);
    }

    // Si no existe, crear un nuevo item
    const newShoppingCart = this.repository.create({
      ...shoppingCartDataBody,
      totalPrice,
      addedAt: new Date()
    });

    return this.repository.save(newShoppingCart);
  }

  async updateShoppingCart(id: string, shoppingCartData: UpdateShoppingCartRequest): Promise<ShoppingCart | null> {
    const shoppingCart = await this.getShoppingCartById(id);
    if (!shoppingCart) return null;

    const shoppingCartDataBody = shoppingCartData;

    if (shoppingCartDataBody.quantity && shoppingCartDataBody.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a cero');
    }

    // Actualizar los campos
    if (shoppingCartDataBody.quantity) {
      shoppingCart.quantity = shoppingCartDataBody.quantity;

      // Recalcular el precio total si cambia la cantidad
      const unitPrice = parseFloat(shoppingCart.unitPrice);
      shoppingCart.totalPrice = (unitPrice * shoppingCart.quantity).toFixed(2);
    }

    if (shoppingCartDataBody.productServiceId) {
      shoppingCart.productServiceId = shoppingCartDataBody.productServiceId;
    }

    return this.repository.save(shoppingCart);
  }

  async deleteShoppingCart(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async clearCustomerCart(customerId: string): Promise<boolean> {
    const result = await this.repository.delete({ customerId });
    return result.affected ? result.affected > 0 : false;
  }
}