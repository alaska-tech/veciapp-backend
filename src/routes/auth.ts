import express from 'express'
import {AuthUseCases} from "../useCases/auth.useCases";
import verifyToken from "../middlewares/validateToken";

const router = express.Router()
const authUseCases = new AuthUseCases()

router.post('/login', authUseCases.login);
router.post('/refresh-token', verifyToken, authUseCases.refresh);
router.post('/logout', verifyToken, authUseCases.logout);
router.post('/forgot-password', authUseCases.forgotPassword);
router.post('/reset-password', authUseCases.resetPassword);

export default router