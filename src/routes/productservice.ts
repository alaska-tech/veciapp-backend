import express from 'express';
import { ProductServiceUseCases } from "../useCases/productservice.useCase";
import verifyToken from '../middlewares/validateToken';

const router = express.Router();
const productServiceUseCases = new ProductServiceUseCases();

router.post('/', verifyToken, productServiceUseCases.createProductService);
router.get('/list', verifyToken, productServiceUseCases.getAllProductServices);
router.get('/get-details/:id', verifyToken, productServiceUseCases.getProductServiceById);
router.put('/update/:id', verifyToken, productServiceUseCases.updateProductService);
router.delete('/delete/:id', verifyToken, productServiceUseCases.deleteProductService);

router.put('/inventory/update/:id', verifyToken, productServiceUseCases.updateInventory);

router.put('/state/update/:id', verifyToken, productServiceUseCases.updateProductState);

router.put('/feature/toggle/:id', verifyToken, productServiceUseCases.toggleFeature);

router.get('/search', verifyToken, productServiceUseCases.searchProducts);

export default router;