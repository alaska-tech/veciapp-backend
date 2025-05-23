import { Favorite } from '../models/favorite.entity';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { CreateFavoriteRequest, FavoriteResponse } from '../types/favorite'
import { PaginatedResponse } from '../types/serverResponse';

export class FavoriteBO {
  private favoriteRepository: Repository<Favorite>;

  constructor() {
    this.favoriteRepository = AppDataSource.getRepository(Favorite);
  }

  async createFavorite(favoriteData: CreateFavoriteRequest): Promise<FavoriteResponse> {
    const newFavorite = this.favoriteRepository.create({
      userId: favoriteData.userId,
      productServiceId: favoriteData.productServiceId
    });

    return await this.favoriteRepository.save(newFavorite);
  }

  async getFavoritesByUserId(userId: string, limit: number = 10, page: number = 0): Promise<PaginatedResponse<FavoriteResponse>> {
    const queryBuilder = this.favoriteRepository.createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.productService', 'productService')
      .where('favorite.userId = :userId', { userId });

    queryBuilder.take(limit).skip(page * limit).orderBy('favorite.createdAt', 'DESC');
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

  async checkFavoriteExists(userId: string, productServiceId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({
      where: {
        userId,
        productServiceId
      }
    });

    return count > 0;
  }

  async deleteByUserAndProduct(userId: string, productServiceId: string): Promise<boolean> {
    const result = await this.favoriteRepository.delete({
      userId,
      productServiceId
    });

    return result.affected ? result.affected > 0 : false;
  }

  async deleteAllFavoritesByUserId(userId: string): Promise<boolean> {
    const result = await this.favoriteRepository.delete({userId});

    return result.affected ? result.affected > 0 : false;
  }
}