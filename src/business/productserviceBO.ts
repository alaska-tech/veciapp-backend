import {ProductService} from '../models/productservice.entity';
import {DeepPartial, Repository} from 'typeorm';
import {AppDataSource} from '../config/database';
import {
  CreateProductServiceRequest,
  ProductServiceInventoryUpdateType,
  ProductServiceState,
  ProductServiceStateHistory,
  SearchProductsRequest,
  StateHistoryEntry,
  UpdateProductServiceRequest
} from '../types/productservice';
import {PaginatedResponse} from "../types/serverResponse";

export class ProductServiceBO {
  private repository: Repository<ProductService>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProductService);
  }

  // Crear un producto o servicio.
  async createProductService(productServiceData: CreateProductServiceRequest): Promise<ProductService> {
    this.validateProductServiceData(productServiceData);

    const finalPrice = this.calculateFinalPrice(
      parseFloat(productServiceData.price),
      parseFloat(productServiceData.discount || '0')
    );

    if (productServiceData.type === 'service' && !productServiceData.serviceScheduling) {
      throw new Error('Un servicio debe tener configuración de horarios');
    }

    const newStatus: ProductServiceStateHistory = ProductServiceStateHistory.CREATED;
    const stateHistoryEntry: StateHistoryEntry = {
      state: newStatus,
      changedAt: new Date(),
      reason: "Product/Service creado por primera vez"
    };

    const productServiceToCreate: DeepPartial<ProductService> = {
      ...productServiceData,
      finalPrice: finalPrice.toString(),
      state: ProductServiceState.AVAILABLE,
      price: productServiceData.price,
      stateHistory: [stateHistoryEntry],
    };

    const newProductService = this.repository.create(productServiceToCreate);
    return await this.repository.save(newProductService);
  }

  // Obtener un producto/servicio por id.
  async getProductServiceById(id: string): Promise<ProductService | null> {
    const productService = await this.repository.findOneBy({ id });
    if (!productService) {
      throw new Error('Producto/Servicio no encontrado');
    }
    return productService;
  }

  // Obtener productos y servicios paginados y filtrados.
  async getAllProductServices(
    limit: number,
    page: number,
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
  ): Promise<PaginatedResponse<ProductService>> {
    return await this.getAllProductServicesInternal(limit, page, filters);
  }

  // Método interno para consultas flexibles.
  private async getAllProductServicesInternal(
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
  ): Promise<PaginatedResponse<ProductService>> {
    const queryBuilder = this.repository.createQueryBuilder('product_service');

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

    queryBuilder.take(limit).skip(page * limit).orderBy('product_service.createdAt', 'DESC');
    const [data, total] = await queryBuilder.getManyAndCount();

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

  // Actualizar un producto/servicio.
  async updateProductService(id: string, productServiceData: UpdateProductServiceRequest): Promise<ProductService> {
    const productService = await this.getProductServiceById(id);
    if (!productService) {
      throw new Error('Producto/Servicio no encontrado');
    }

    const editableFields: Partial<UpdateProductServiceRequest> = {};
    const allowedFields = [
      'type', 'name', 'description', 'shortDescription', 'price', 'discount',
      'images', 'mainImage', 'tags', 'state', 'inventory', 'presentation',
      'ingredients', 'allergens', 'isHighlighted', 'isBestseller', 'isNew'
    ];

    for (const key of allowedFields) {
      if ((productServiceData as any)[key] !== undefined) {
        (editableFields as any)[key] = (productServiceData as any)[key];
      }
    }

    if (editableFields.price !== undefined || editableFields.discount !== undefined) {
      const currentPrice = editableFields.price !== undefined
        ? parseFloat(editableFields.price)
        : parseFloat(productService.price);

      const currentDiscount = editableFields.discount !== undefined
        ? parseFloat(editableFields.discount)
        : parseFloat(productService.discount);

      (editableFields as any).finalPrice = this.calculateFinalPrice(currentPrice, currentDiscount).toString();
    }

    if (editableFields.type) {
      editableFields.type = this.validateProductType(editableFields.type) as "product" | "service";
    }

    if (
      (productService.type === 'service' || editableFields.type === 'service') &&
      !productService.serviceScheduling && !productServiceData.serviceScheduling
    ) {
      throw new Error('Un servicio debe tener configuración de horarios');
    }

    const updatedProductService = await this.repository.save({
      ...productService,
      ...editableFields,
    } as DeepPartial<ProductService>);

    return updatedProductService;
  }

  // Eliminar (soft delete) un producto/servicio.
  async deleteProductService(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // Actualizar inventario.
  async updateInventory(id: string, action: ProductServiceInventoryUpdateType, quantity: number): Promise<ProductService> {
    const productService = await this.getProductServiceById(id);

    if (!productService) {
      throw new Error('Producto/Servicio no encontrado');
    }

    if (action === 'subtraction' && productService.inventory < quantity) {
      throw new Error('No se puede restar más inventario del que existe');
    }

    if (action === 'addition' && quantity < 0) {
      throw new Error('No se puede agregar un inventario negativo');
    }

    const previousInventory = productService.inventory;
    let newInventory = previousInventory;

    if (action === 'addition') {
      newInventory += quantity;
    }
    if (action === 'subtraction' && previousInventory >= quantity) {
      newInventory -= quantity;
    }
    if (newInventory < 0) {
      throw new Error('El inventario no puede ser negativo');
    }

    let newState = productService.state;

    if (newInventory === 0) {
      newState = ProductServiceState.OUT_OF_STOCK;
    } else if (newInventory > 0 && productService.state === ProductServiceState.OUT_OF_STOCK) {
      newState = ProductServiceState.AVAILABLE;
    }

    const updatedProductService = await this.repository.save({
      ...productService,
      inventory: newInventory,
      state: newState,
    });

    return updatedProductService;
  }

  // Alternar cualquier feature booleana (isHighlighted, isBestseller, isNew).
  async toggleFeature(id: string, feature: 'isHighlighted' | 'isBestseller' | 'isNew'): Promise<ProductService> {
    const productService = await this.getProductServiceById(id);
    if (!productService) {
      throw new Error('Producto/Servicio no encontrado');
    }

    if (!(feature in productService)) {
      throw new Error('Feature no válida');
    }

    const newValue = !(productService as any)[feature];
    const updatedProductService = await this.repository.save({
      ...productService,
      [feature]: newValue
    });

    return updatedProductService;
  }

  // Actualizar el estado del producto/servicio.
  async updateProductState(id: string, newState: ProductServiceState): Promise<ProductService> {
    const productService = await this.getProductServiceById(id);
    if (!productService) {
      throw new Error('Producto/Servicio no encontrado');
    }

    if (!Object.values(ProductServiceState).includes(newState)) {
      throw new Error('El estado proporcionado no es válido');
    }

    if (newState === ProductServiceState.OUT_OF_STOCK && productService.inventory > 0) {
      throw new Error('No se puede marcar como agotado un producto con inventario disponible');
    }

    if (newState === ProductServiceState.AVAILABLE && productService.inventory === 0 && productService.type === 'product') {
      throw new Error('No se puede marcar como disponible un producto sin inventario');
    }

    const updatedProductService = await this.repository.save({
      ...productService,
      state: newState
    });

    return updatedProductService;
  }

  // Buscar productos/servicios por término y filtros.
  async searchProducts(
    req: SearchProductsRequest
  ): Promise<{
    products: ProductService[],
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
    }
  }> {

    const { search, limit, page, vendorId, branchId, categoryId, type, state } = req.query;

    if (!search) {
      throw new Error('Término de búsqueda es requerido');
    }

    const filters = {
      vendorId,
      branchId,
      categoryId,
      type,
      state,
      search
    };

    const parsedLimit = limit ? parseInt(limit) : 10;
    const parsedPage = page ? parseInt(page) : 0;

    const { data, meta } = await this.getAllProductServicesInternal(parsedLimit, parsedPage, filters);

    return {
      products: data,
      meta
    };
  }

  // Métodos auxiliares privados
  private validateProductServiceData(data: Partial<CreateProductServiceRequest>): void {
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre del producto/servicio es requerido');
    }
    if ('description' in data && (!data.description || data.description.trim() === '')) {
      throw new Error('La descripción del producto/servicio es requerida');
    }
    if ('shortDescription' in data && (!data.shortDescription || data.shortDescription.trim() === '')) {
      throw new Error('La descripción corta del producto/servicio es requerida');
    }
    if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a cero');
    }
    if (data.discount && (isNaN(parseFloat(data.discount)) || parseFloat(data.discount) < 0 || parseFloat(data.discount) > 100)) {
      throw new Error('El descuento debe ser un número entre 0 y 100');
    }
    if ('mainImage' in data && (!data.mainImage || data.mainImage.trim() === '')) {
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
    if (data.type === 'product' && (data.inventory === undefined || data.inventory < 0)) {
      throw new Error('El inventario debe ser un número mayor o igual a cero para productos');
    }
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