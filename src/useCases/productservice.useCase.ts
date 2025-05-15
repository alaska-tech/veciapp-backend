import {Response} from 'express';
import {ProductServiceBO} from '../business/productserviceBO';
import {
  CreateProductServiceRequestExtended,
  CreateProductServiceResponse,
  DeleteProductServiceRequest,
  DeleteProductServiceResponse,
  GetAllProductServicesRequest,
  GetProductServiceByIdRequest,
  InventoryUpdateResponse,
  PaginatedProductServiceResponse,
  ProductServiceData,
  ProductServiceDetailResponse,
  SearchProductsRequest,
  StateUpdateResponse,
  ToggleFeatureRequest,
  ToggleFeatureResponse, UpdateInventoryBody,
  UpdateInventoryRequest,
  UpdateProductServiceRequestExtended,
  UpdateProductServiceResponse,
  UpdateProductStateRequest
} from '../types/productservice';
import {ApiResponse} from '../types/serverResponse';
import {responseError, responseOk} from '../utils/standardResponseServer';

export class ProductServiceUseCases {
  private productServiceBO: ProductServiceBO = new ProductServiceBO();

  createProductService = async (
    req: CreateProductServiceRequestExtended,
    res: Response<ApiResponse<CreateProductServiceResponse>>
  ): Promise<void> => {
    try {
      const userInSession = req.user;
      const createdBy = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;
      const body = {
        ...req.body,
        createdBy
      }

      const product = await this.productServiceBO.createProductService(body);

      res.status(201).json(responseOk({
        id: product.id,
        message: 'Producto/Servicio creado con éxito',
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };

  getProductServiceById = async (
    req: GetProductServiceByIdRequest,
    res: Response<ApiResponse<ProductServiceDetailResponse>>
  ): Promise<void> => {
    try {
      const product = await this.productServiceBO.getProductServiceById(req.params.id);
      if (product) {
        // Mapear el producto a ProductServiceData para respetar la interfaz definida
        const mappedProduct: ProductServiceData = {
          id: product.id,
          vendorId: product.vendorId,
          branchId: product.branchId,
          categoryId: product.categoryId,
          type: product.type === 'product' ? 'product' : 'service',
          name: product.name,
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price,
          discount: product.discount || '0',
          finalPrice: product.finalPrice,
          currency: product.currency || 'USD',
          mainImage: product.mainImage || '',
          images: product.images || [],
          tags: product.tags || [],
          state: product.state,
          inventory: product.inventory,
          presentation: product.presentation,
          ingredients: product.ingredients || [],
          allergens: product.allergens || [],
          isHighlighted: product.isHighlighted || false,
          isBestseller: product.isBestseller || false,
          isNew: product.isNew || false,
          serviceScheduling: product.serviceScheduling,
          createdBy: product.createdBy || '',
          updatedBy: product.updatedBy,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          stateHistory: product.stateHistory
        };

        res.status(200).json(responseOk({
          data: mappedProduct
        }));
      } else {
        res.status(404).json(responseError({ code: 'NOT_FOUND', message: 'Producto/Servicio no encontrado' }));
      }
    } catch (error: any) {
      res.status(500).json(responseError({ message: error.message }));
    }
  };

  getAllProductServices = async (
    req: GetAllProductServicesRequest,
    res: Response<ApiResponse<PaginatedProductServiceResponse>>
  ): Promise<void> => {
    try {
      const {
        limit = '10',
        page = '0',
        vendorId,
        branchId,
        categoryId,
        type,
        state,
        isHighlighted,
        isBestseller,
        isNew,
        search
      } = req.query;

      const filters = {
        vendorId,
        branchId,
        categoryId,
        type,
        state,
        isHighlighted: isHighlighted === 'true' ? true : isHighlighted === 'false' ? false : undefined,
        isBestseller: isBestseller === 'true' ? true : isBestseller === 'false' ? false : undefined,
        isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
        search
      };

      const paginated = await this.productServiceBO.getAllProductServices(
        parseInt(limit), parseInt(page), filters
      );

      if (paginated.data.length === 0) {
        res.status(404).json(responseError({ message: 'No se encontraron productos/servicios' }));
        return;
      }

      // Mapear los datos al tipo esperado según la interfaz
      const mappedData: ProductServiceData[] = paginated.data.map(product => ({
        id: product.id,
        vendorId: product.vendorId,
        branchId: product.branchId,
        categoryId: product.categoryId,
        type: product.type === 'product' ? 'product' : 'service',
        name: product.name,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price,
        discount: product.discount || '0',
        finalPrice: product.finalPrice,
        currency: product.currency || 'USD',
        mainImage: product.mainImage || '',
        images: product.images || [],
        tags: product.tags || [],
        state: product.state,
        inventory: product.inventory,
        presentation: product.presentation,
        ingredients: product.ingredients || [],
        allergens: product.allergens || [],
        isHighlighted: product.isHighlighted || false,
        isBestseller: product.isBestseller || false,
        isNew: product.isNew || false,
        serviceScheduling: product.serviceScheduling,
        createdBy: product.createdBy || '',
        updatedBy: product.updatedBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stateHistory: product.stateHistory
      }));

      const response: PaginatedProductServiceResponse = {
        data: mappedData,
        meta: paginated.meta
      };

      res.status(200).json(responseOk(response));
    } catch (error: any) {
      res.status(500).json(responseError({ message: error.message }));
    }
  };

  updateProductService = async (
    req: UpdateProductServiceRequestExtended,
    res: Response<ApiResponse<UpdateProductServiceResponse>>
  ): Promise<void> => {
    try {
      // Obtener el producto antes de actualizarlo para tener referencia del estado inicial
      const originalProduct = await this.productServiceBO.getProductServiceById(req.params.id);

      const userInSession = req.user;
      const updatedBy = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;
      const body = {
        ...req.body,
        updatedBy
      }

      const product = await this.productServiceBO.updateProductService(req.params.id, body);

      // Mapear el producto a ProductServiceData para respetar la interfaz
      const mappedProduct: ProductServiceData = {
        id: product.id,
        vendorId: product.vendorId,
        branchId: product.branchId,
        categoryId: product.categoryId,
        type: product.type === 'product' ? 'product' : 'service',
        name: product.name,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price,
        discount: product.discount || '0',
        finalPrice: product.finalPrice,
        currency: product.currency || 'USD',
        mainImage: product.mainImage || '',
        images: product.images || [],
        tags: product.tags || [],
        state: product.state,
        inventory: product.inventory,
        presentation: product.presentation,
        ingredients: product.ingredients || [],
        allergens: product.allergens || [],
        isHighlighted: product.isHighlighted || false,
        isBestseller: product.isBestseller || false,
        isNew: product.isNew || false,
        serviceScheduling: product.serviceScheduling,
        createdBy: product.createdBy || '',
        updatedBy: product.updatedBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stateHistory: product.stateHistory
      };

      res.status(200).json(responseOk({
        id: product.id,
        message: 'Producto/Servicio actualizado con éxito',
        data: mappedProduct
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };

  deleteProductService = async (
    req: DeleteProductServiceRequest,
    res: Response<ApiResponse<DeleteProductServiceResponse>>
  ): Promise<void> => {
    try {
      const success = await this.productServiceBO.deleteProductService(req.params.id);
      if (success) {
        res.status(200).json(responseOk({
          id: req.params.id,
          message: 'Producto/Servicio eliminado correctamente'
        }));
      } else {
        res.status(404).json(responseError({ message: 'Producto/Servicio no encontrado' }));
      }
    } catch (error: any) {
      res.status(500).json(responseError({ message: error.message }));
    }
  };

  updateInventory = async (
    req: UpdateInventoryRequest,
    res: Response<ApiResponse<InventoryUpdateResponse>>
  ): Promise<void> => {
    try {
      const userInSession = req.user;
      const updatedBy: string = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;
      const body = {
        ...req.body,
        updatedBy
      }

      const originalProduct = await this.productServiceBO.getProductServiceById(req.params.id);

      if (!originalProduct) {
        res.status(404).json(responseError({ message: 'Producto/Servicio no encontrado' }));
        return;
      }
      const previousInventory = originalProduct.inventory;

      const product = await this.productServiceBO.updateInventory(req.params.id, body as UpdateInventoryBody);

      res.status(200).json(responseOk({
        id: product.id,
        previousInventory: previousInventory,
        currentInventory: product.inventory,
        state: product.state,
        message: 'Inventario actualizado correctamente'
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };

  toggleFeature = async (
    req: ToggleFeatureRequest,
    res: Response<ApiResponse<ToggleFeatureResponse>>
  ): Promise<void> => {
    try {
      const { feature } = req.body;
      const product = await this.productServiceBO.toggleFeature(req.params.id, feature);
      res.status(200).json(responseOk({
        id: product.id,
        feature,
        value: (product as any)[feature],
        message: `Propiedad ${feature} actualizada correctamente`
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };

  updateProductState = async (
    req: UpdateProductStateRequest,
    res: Response<ApiResponse<StateUpdateResponse>>
  ): Promise<void> => {
    try {
      const userInSession = req.user;
      const updatedBy: string = `${userInSession?.role}-${userInSession?.foreignPersonId}-${userInSession?.email}`;

      const { state } = req.body;

      const originalProduct = await this.productServiceBO.getProductServiceById(req.params.id);

      if (!originalProduct) {
        res.status(404).json(responseError({ message: 'Producto/Servicio no encontrado' }));
        return;
      }

      const previousState = originalProduct.state;

      const product = await this.productServiceBO.updateProductState(req.params.id, state, updatedBy);

      res.status(200).json(responseOk({
        id: product.id,
        previousState: previousState,
        currentState: product.state,
        message: 'Estado actualizado correctamente'
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };

  searchProducts = async (
    req: SearchProductsRequest,
    res: Response<ApiResponse<PaginatedProductServiceResponse>>
  ): Promise<void> => {
    try {
      const result = await this.productServiceBO.searchProducts(req);

      const mappedData: ProductServiceData[] = result.products.map(product => ({
        id: product.id,
        vendorId: product.vendorId,
        branchId: product.branchId,
        categoryId: product.categoryId,
        type: product.type === 'product' ? 'product' : 'service',
        name: product.name,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price,
        discount: product.discount || '0',
        finalPrice: product.finalPrice,
        currency: product.currency || 'USD',
        mainImage: product.mainImage || '',
        images: product.images || [],
        tags: product.tags || [],
        state: product.state,
        inventory: product.inventory,
        presentation: product.presentation,
        ingredients: product.ingredients || [],
        allergens: product.allergens || [],
        isHighlighted: product.isHighlighted || false,
        isBestseller: product.isBestseller || false,
        isNew: product.isNew || false,
        serviceScheduling: product.serviceScheduling,
        createdBy: product.createdBy || '',
        updatedBy: product.updatedBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stateHistory: product.stateHistory
      }));

      const response: PaginatedProductServiceResponse = {
        data: mappedData,
        meta: result.meta
      };

      res.status(200).json(responseOk(response));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  };
}