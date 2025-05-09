import express from 'express'
import {CustomerUseCases} from "../useCases/customer.useCases";
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const customerUseCases = new CustomerUseCases()

router.post('/', customerUseCases.createCustomer);
router.get('/list', verifyToken, customerUseCases.getAllCustomers);
router.get('/get-details/:id', verifyToken, customerUseCases.getCustomerById);
router.get('/stats', verifyToken, customerUseCases.getStats);
router.put('/edit/:id', verifyToken, customerUseCases.updateCustomer);
router.put('/manage-status/:id', verifyToken, customerUseCases.manageStatus);
router.post('/validate-email', customerUseCases.validateEmail);

export default router