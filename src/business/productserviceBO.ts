import { ProductService, ProductServiceState } from '../models/productservice.entity';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
// import { ProductServiceRepository } from '../repositories/product-service.repository';

export class ProductServiceBO {
  private repository: Repository<ProductService>;
  // private productServiceRepository: ProductServiceRepository;

  constructor() {
    this.repository = AppDataSource.getRepository(ProductService);
    // this.productServiceRepository = new ProductServiceRepository();
  }

  // Métodos de negocio
  async createProductService(productServiceData: Omit<ProductService, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductService> {
    // Validaciones de negocio
    this.validateProductServiceData(productServiceData);

    // Calcular el precio final considerando descuentos
    const finalPrice = this.calculateFinalPrice(
      parseFloat(productServiceData.price),
      parseFloat(productServiceData.discount || '0')
    );

    // Asignar el precio final calculado
    Object.assign(productServiceData, {
      finalPrice: finalPrice.toString(),
      // Aseguramos que el tipo sea válido
      type: this.validateProductType(productServiceData.type)
    });

    // Verificar si es un servicio y tiene horario
    if (productServiceData.type === 'service' && !productServiceData.serviceScheduling) {
      throw new Error('Un servicio debe tener configuración de horarios');
    }

    // Crear y guardar el producto/servicio
    const newProductService = this.repository.create({ ...productServiceData });
    return await this.repository.save(newProductService);
  }

  async getProductServiceById(id: string): Promise<ProductService | null> {
    return this.repository.findOneBy({ id });
  }

  async getAllProductServices(
    limit: number = 10,
    page: number = 0,
    filters?: {
      vendorId?: string;
      branchId?: string;
      categoryId?: string;
      type?: string;
      state?: ProductServiceState;
      isHighlighted?: boolean;
      isBestseller?: boolean;
      isNew?: boolean;
      search?: string;
    }
  ): Promise<[ProductService[] | null, number]> {
    const queryBuilder = this.repository.createQueryBuilder('product_service');

    // Aplicar filtros si existen
    if (filters) {
      if (filters.vendorId) {
        queryBuilder.andWhere('product_service.vendorId = :vendorId', { vendorId: filters.vendorId });
      }

      if (filters.branchId) {
        queryBuilder.andWhere('product_service.branchId = :branchId', { branchId: filters.branchId });
      }

      if (filters.categoryId) {
        queryBuilder.andWhere('product_service.categoryId = :categoryId', { categoryId: filters.categoryId });
      }

      if (filters.type) {
        queryBuilder.andWhere('product_service.type = :type', { type: filters.type });
      }

      if (filters.state) {
        queryBuilder.andWhere('product_service.state = :state', { state: filters.state });
      }

      if (filters.isHighlighted !== undefined) {
        queryBuilder.andWhere('product_service.isHighlighted = :isHighlighted', { isHighlighted: filters.isHighlighted });
      }

      if (filters.isBestseller !== undefined) {
        queryBuilder.andWhere('product_service.isBestseller = :isBestseller', { isBestseller: filters.isBestseller });
      }

      if (filters.isNew !== undefined) {
        queryBuilder.andWhere('product_service.isNew = :isNew', { isNew: filters.isNew });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(product_service.name ILIKE :search OR product_service.description ILIKE :search OR product_service.shortDescription ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    // Aplicar paginación
    queryBuilder.take(limit).skip(page * limit);

    // Ordenar por fecha de creación (más reciente primero)
    queryBuilder.orderBy('product_service.createdAt', 'DESC');

    return await queryBuilder.getManyAndCount();
  }

  async getProductsByVendor(vendorId: string, limit: number = 10, page: number = 0): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, { vendorId });
  }

  async getProductsByBranch(branchId: string, limit: number = 10, page: number = 0): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, { branchId });
  }

  async getHighlightedProducts(limit: number = 10, page: number = 0): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, { isHighlighted: true });
  }

  async getBestsellerProducts(limit: number = 10, page: number = 0): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, { isBestseller: true });
  }

  async getNewProducts(limit: number = 10, page: number = 0): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, { isNew: true });
  }

  async updateProductService(id: string, productServiceData: Partial<ProductService>): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    // Si se actualiza precio o descuento, recalcular precio final
    if (productServiceData.price !== undefined || productServiceData.discount !== undefined) {
      const currentPrice = productServiceData.price !== undefined
        ? parseFloat(productServiceData.price)
        : parseFloat(productService.price);

      const currentDiscount = productServiceData.discount !== undefined
        ? parseFloat(productServiceData.discount)
        : parseFloat(productService.discount);

      const finalPrice = this.calculateFinalPrice(currentPrice, currentDiscount);
      productServiceData.finalPrice = finalPrice.toString();
    }

    // Si se está modificando el tipo, validarlo
    if (productServiceData.type) {
      productServiceData.type = this.validateProductType(productServiceData.type);
    }

    // Si es un servicio, asegurarse de que tenga configuración de horarios
    if ((productService.type === 'service' || productServiceData.type === 'service') &&
      !productService.serviceScheduling && !productServiceData.serviceScheduling) {
      throw new Error('Un servicio debe tener configuración de horarios');
    }

    // Actualizar y devolver el producto/servicio
    Object.assign(productService, productServiceData);
    return await this.repository.save(productService);
  }

  async deleteProductService(id: string): Promise<boolean> {
    // Soft delete para mantener historial
    const result = await this.repository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async updateInventory(id: string, quantity: number, isAddition: boolean = true): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    // Solo actualizar inventario si es un producto físico
    if (productService.type !== 'product') {
      throw new Error('Solo se puede actualizar el inventario de productos físicos');
    }

    // Calcular nuevo inventario
    let newInventory = isAddition
      ? productService.inventory + quantity
      : productService.inventory - quantity;

    // Validar que el inventario no sea negativo
    if (newInventory < 0) {
      throw new Error('El inventario no puede ser negativo');
    }

    // Actualizar estado según inventario
    let newState = productService.state;
    if (newInventory === 0) {
      newState = ProductServiceState.OUT_OF_STOCK;
    } else if (newInventory > 0 && productService.state === ProductServiceState.OUT_OF_STOCK) {
      newState = ProductServiceState.AVAILABLE;
    }

    // Actualizar y guardar
    Object.assign(productService, {
      inventory: newInventory,
      state: newState
    });

    return await this.repository.save(productService);
  }

  async toggleHighlighted(id: string): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    Object.assign(productService, { isHighlighted: !productService.isHighlighted });
    return await this.repository.save(productService);
  }

  async toggleBestseller(id: string): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    Object.assign(productService, { isBestseller: !productService.isBestseller });
    return await this.repository.save(productService);
  }

  async toggleNew(id: string): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    Object.assign(productService, { isNew: !productService.isNew });
    return await this.repository.save(productService);
  }

  async updateProductState(id: string, state: ProductServiceState): Promise<ProductService | null> {
    const productService = await this.getProductServiceById(id);
    if (!productService) return null;

    // Si se marca como agotado, verificar inventario
    if (state === ProductServiceState.OUT_OF_STOCK && productService.inventory > 0) {
      throw new Error('No se puede marcar como agotado un producto con inventario disponible');
    }

    // Si se marca como disponible, verificar inventario
    if (state === ProductServiceState.AVAILABLE && productService.inventory === 0 && productService.type === 'product') {
      throw new Error('No se puede marcar como disponible un producto sin inventario');
    }

    Object.assign(productService, { state });
    return await this.repository.save(productService);
  }

  async searchProducts(
    searchTerm: string,
    limit: number = 10,
    page: number = 0,
    filters?: {
      vendorId?: string;
      branchId?: string;
      categoryId?: string;
      type?: string;
      state?: ProductServiceState;
    }
  ): Promise<[ProductService[] | null, number]> {
    return this.getAllProductServices(limit, page, {
      ...filters,
      search: searchTerm
    });
  }

  // Métodos auxiliares privados
  private validateProductServiceData(data: Partial<ProductService>): void {
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre del producto/servicio es requerido');
    }

    if (!data.description || data.description.trim() === '') {
      throw new Error('La descripción del producto/servicio es requerida');
    }

    if (!data.shortDescription || data.shortDescription.trim() === '') {
      throw new Error('La descripción corta del producto/servicio es requerida');
    }

    if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a cero');
    }

    if (data.discount && (isNaN(parseFloat(data.discount)) || parseFloat(data.discount) < 0 || parseFloat(data.discount) > 100)) {
      throw new Error('El descuento debe ser un número entre 0 y 100');
    }

    if (!data.mainImage || data.mainImage.trim() === '') {
      throw new Error('La imagen principal es requerida');
    }

    if (!data.vendorId) {
      throw new Error('El ID del vendedor es requerido');
    }

    if (!data.branchId) {
      throw new Error('El ID de la sucursal es requerido');
    }

    if (!data.categoryId) {
      throw new Error('El ID de la categoría es requerido');
    }

    if (!data.type) {
      throw new Error('El tipo de producto/servicio es requerido');
    }

    // Validar inventario para productos
    if (data.type === 'product' && (data.inventory === undefined || data.inventory < 0)) {
      throw new Error('El inventario debe ser un número mayor o igual a cero para productos');
    }

    // Validar horarios para servicios
    if (data.type === 'service' && !data.serviceScheduling) {
      throw new Error('La configuración de horarios es requerida para servicios');
    }
  }

  private calculateFinalPrice(price: number, discount: number): number {
    if (discount <= 0) return price;
    if (discount >= 100) return 0;

    const discountAmount = price * (discount / 100);
    return parseFloat((price - discountAmount).toFixed(2));
  }

  private validateProductType(type: string): string {
    const validTypes = ['product', 'service'];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new Error('El tipo de producto/servicio debe ser "product" o "service"');
    }
    return type.toLowerCase();
  }
}