import {Request, Response} from 'express';
import {FavoriteBO} from '../business/favoriteBO';
import {
  CreateFavoriteRequestExtended,
  CreateFavoriteResponse,
  DeleteFavoriteRequestExtended,
  FavoriteResponse,
  GetFavoritesByUserIdRequestExtended,
} from '../types/favorite';
import {ApiResponse} from '../types/serverResponse';
import {responseError, responseOk} from '../utils/standardResponseServer';

export class FavoriteUseCases {
  private favoriteBO: FavoriteBO = new FavoriteBO();

  createFavorite = async (
    req: CreateFavoriteRequestExtended,
    res: Response<ApiResponse<CreateFavoriteResponse>>
  ): Promise<void> => {
    try {
      const {userId, productServiceId} = req.body;
      const favorite = await this.favoriteBO.createFavorite({userId, productServiceId});
      res.status(201).json(responseOk({
        id: favorite.id,
        message: 'Favorito creado satisfactoriamente!'
      }));
    } catch (error: any) {
      res.status(400).json(responseError({message: error.message}));
    }
  }

  getFavoritesByUserId = async (
    req: GetFavoritesByUserIdRequestExtended,
    res: Response<ApiResponse<FavoriteResponse[]>>
  ): Promise<void> => {
    try {
      const {userId} = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 0;

      const favorites = await this.favoriteBO.getFavoritesByUserId(userId, limit, page);
      res.status(200).json(responseOk(favorites.data));
    } catch (error: any) {
      res.status(400).json(responseError<any>({message: error.message}));
    }
  }

  deleteFavorite = async (
    req: DeleteFavoriteRequestExtended,
    res: Response<ApiResponse<{message: string}>>
  ): Promise<void> => {
    try {
      const {userId, productServiceId} = req.params;
      const deleted = await this.favoriteBO.deleteByUserAndProduct(userId, productServiceId);
      if (deleted) {
        res.status(200).json(responseOk({message: 'Favorito eliminado satisfactoriamente!'}));
      } else {
        res.status(404).json(responseError({message: 'Favorito no encontrado!'}));
      }
    } catch (error: any) {
      res.status(400).json(responseError({message: error.message}));
    }
  }

  deleteAllFavoritesByUserId = async (
    req: Request,
    res: Response<ApiResponse<{message: string}>>
  ): Promise<void> => {
    try {
      const {userId} = req.params;
      const deleted = await this.favoriteBO.deleteAllFavoritesByUserId(userId);
      if (deleted) {
        res.status(200).json(responseOk({message: 'Todos los favoritos eliminados satisfactoriamente!'}));
      } else {
        res.status(404).json(responseError({message: 'No se encontraron favoritos para eliminar!'}));
      }
    } catch (error: any) {
      res.status(400).json(responseError({message: error.message}));
    }
  }

  checkFavoriteExists = async (
    req: Request,
    res: Response<ApiResponse<{exists: boolean}>>
  ): Promise<void> => {
    try {
      const {userId, productServiceId} = req.params;
      const exists = await this.favoriteBO.checkFavoriteExists(userId, productServiceId);
      res.status(200).json(responseOk({exists}));
    } catch (error: any) {
      res.status(400).json(responseError<any>({message: error.message}));
    }
  }

}