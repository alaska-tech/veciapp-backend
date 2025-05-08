import express from 'express'
import { BranchUseCases } from "../useCases/branch.useCases"
import verifyToken from '../middlewares/validateToken'

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

export default router