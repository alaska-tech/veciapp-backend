import express from '@awaitjs/express'
import {AuthUseCases} from "../useCases/auth.useCases";
import verifyToken from "../middlewares/validateToken";

const router = express.Router()
const authUseCases = new AuthUseCases()

router.postAsync('/login', verifyToken, authUseCases.login)
router.postAsync('/login', verifyToken, authUseCases.logout)
router.postAsync('/register', verifyToken, authUseCases.register)
router.postAsync('/reset-password', verifyToken, authUseCases.reset)
router.postAsync('/session', verifyToken, authUseCases.session)

export default router