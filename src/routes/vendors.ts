import express from 'express'
import {VendorUseCases} from "../useCases/vendor.useCases"
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const vendorUseCases = new VendorUseCases()

router.post('/', verifyToken, vendorUseCases.createVendor);
router.get('/list', verifyToken, vendorUseCases.getAllVendors);
router.get('/get-details/:id', verifyToken, vendorUseCases.getVendorById);
router.get('/stats', verifyToken, vendorUseCases.getStats);
router.put('/edit/:id', verifyToken, vendorUseCases.updateVendor);
router.put('/manage-status/:id', verifyToken, vendorUseCases.manageStatus);
router.post('/validate-email', verifyToken, vendorUseCases.validateEmail);
router.delete('/delete/:id', verifyToken, vendorUseCases.deleteVendor);

export default router