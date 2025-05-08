import express from 'express';
import {ParameterUseCases} from "../useCases/parameter.useCases";
import verifyToken from '../middlewares/validateToken';

const router = express.Router();
const parameterUseCases = new ParameterUseCases();

router.post('/', verifyToken, parameterUseCases.createParameter);
router.get('/list', verifyToken, parameterUseCases.getAllParameters);
router.get('/:id', verifyToken, parameterUseCases.getParameterById);
router.get('/get-by-name/:name', verifyToken, parameterUseCases.getParameterByName);
router.patch('/toggle-status/:id', verifyToken, parameterUseCases.toggleParameterStatus);
router.put('/:id', verifyToken, parameterUseCases.updateParameter);
router.delete('/:id', verifyToken, parameterUseCases.deleteParameter);

export default router;