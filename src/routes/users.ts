import express from '@awaitjs/express'
import {UserUseCases} from "../useCases/user.useCases";
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const userUseCases = new UserUseCases()

router.post('/', userUseCases.createUser);
router.get('/', verifyToken, userUseCases.getAllUsers);
router.get('/:id', verifyToken, userUseCases.getUserById);
router.put('/:id', verifyToken, userUseCases.updateUser);
router.delete('/:id', verifyToken, userUseCases.deleteUser);

export default router