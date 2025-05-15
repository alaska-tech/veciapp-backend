import express from 'express';
import { ShoppingCartUseCases } from '../useCases/shoppingcart.useCases';
import verifyToken from '../middlewares/validateToken';

export const router = express.Router();
const shoppingCartUseCases = new ShoppingCartUseCases();

router.post('/', verifyToken, shoppingCartUseCases.createShoppingCart);
router.get('/list', verifyToken, shoppingCartUseCases.getAllShoppingCarts);

router.get('/customer/:customerId', verifyToken, shoppingCartUseCases.getShoppingCartByCustomerId);
router.put('/update/:id', verifyToken, shoppingCartUseCases.updateShoppingCart);

router.delete('/delete-item/:id', verifyToken, shoppingCartUseCases.deleteShoppingCart);
router.delete('/clear-cart/customer/:customerId', verifyToken, shoppingCartUseCases.clearCustomerCart);

export default router;