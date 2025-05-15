import express from 'express'
import { BranchUseCases } from "../useCases/branch.useCases"
import verifyToken from '../middlewares/validateToken'
import { uploadLogo, uploadImages, handleFileUpload, validateImageUpload } from '../middlewares/fileUpload'


const router = express.Router()
const branchUseCases = new BranchUseCases()

router.post('/:vendorId/new-branch', verifyToken, branchUseCases.createBranch);
router.get('/:vendorId/all-branches', verifyToken, branchUseCases.getAllBranches);
router.get('/get-details/:id', verifyToken, branchUseCases.getBranchById);
router.get('/stats', verifyToken, branchUseCases.getStats);
router.put('/edit/:id', verifyToken, branchUseCases.updateBranch);
router.put('/manage-status/:id', verifyToken, branchUseCases.manageStatus);
router.delete('/delete/:id', verifyToken, branchUseCases.deleteBranch);
router.get('/get-nearby-branches', verifyToken, branchUseCases.getNearbyBranches);

router.post('/upload-logo/:id', verifyToken, uploadLogo, validateImageUpload, handleFileUpload, branchUseCases.uploadLogo);
router.post('/upload-images/:id', verifyToken, uploadImages, validateImageUpload, handleFileUpload, branchUseCases.uploadImages);
router.delete('/remove-image/:id', verifyToken, branchUseCases.removeImage);

export default router