import express from 'express';
import { FavoriteUseCases } from '../useCases/favorite.useCase';
import verifyToken from '../middlewares/validateToken';

export const router = express.Router();
const favoriteUseCases = new FavoriteUseCases();

router.post('/', verifyToken, favoriteUseCases.createFavorite);
router.get('/list/:userId', verifyToken, favoriteUseCases.getFavoritesByUserId);
router.get('/check/:userId/:productServiceId', verifyToken, favoriteUseCases.checkFavoriteExists);
router.delete('/delete/:userId/:productServiceId', verifyToken, favoriteUseCases.deleteFavorite);
router.delete('/delete-all/:userId', verifyToken, favoriteUseCases.deleteAllFavoritesByUserId);

export default router;