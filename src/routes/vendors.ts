import express from '@awaitjs/express'
import {VendorUseCases} from "../useCases/vendor.useCases";
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const vendorUseCases = new VendorUseCases()

router.post('/', vendorUseCases.createVendor);
router.get('/list', verifyToken, vendorUseCases.getAllVendors);
router.get('/get-details/:id', verifyToken, vendorUseCases.getVendorById);
router.put('/:id', verifyToken, vendorUseCases.updateVendor);
router.delete('/:id', vendorUseCases.deleteVendor);
router.get('/validate-email/:hash', vendorUseCases.validateEmail);

export default router