import express from '@awaitjs/express'
import {AuthUseCases} from "../useCases/auth.useCases";
import verifyToken from "../middlewares/validateToken";

const router = express.Router()
const authUseCases = new AuthUseCases()

router.postAsync('/login', authUseCases.login)
router.postAsync('/logout', verifyToken, authUseCases.logout)
router.postAsync('/register', authUseCases.register)
router.postAsync('/reset-password', authUseCases.reset)
router.postAsync('/session', verifyToken, authUseCases.session)

export default router