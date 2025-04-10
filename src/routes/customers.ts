import express from '@awaitjs/express'
import {CustomerUseCases} from "../useCases/customer.useCases";
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const customerUseCases = new CustomerUseCases()

router.post('/', customerUseCases.createCustomer);
router.get('/', verifyToken, customerUseCases.getAllCustomers);
router.get('/:id', verifyToken, customerUseCases.getCustomerById);
router.put('/:id', verifyToken, customerUseCases.updateCustomer);
router.delete('/:id', customerUseCases.deleteCustomer);
router.get('/validate-email/:hash', customerUseCases.validateEmail);

export default router