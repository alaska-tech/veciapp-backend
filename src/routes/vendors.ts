import express from '@awaitjs/express'
import {VendorUseCases} from "../useCases/vendor.useCases";
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const vendorUseCases = new VendorUseCases()

router.post('/', vendorUseCases.createVendor);
router.get('/list', verifyToken, vendorUseCases.getAllVendors);
router.get('/get-details/:id', verifyToken, vendorUseCases.getVendorById);
router.get('/stats', vendorUseCases.getStats);
router.put('/edit/:id', verifyToken, vendorUseCases.updateVendor);
//router.put('/manage-status/:id', verifyToken, vendorUseCases.manageStatus);
router.get('/validate-email/:hash', vendorUseCases.validateEmail);
router.delete('/:id', vendorUseCases.deleteVendor);

export default router