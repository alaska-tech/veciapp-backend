import express from 'express';
import {ParameterUseCases} from "../useCases/parameter.useCases";
import verifyToken from '../middlewares/validateToken';

const router = express.Router();
const parameterUseCases = new ParameterUseCases();

router.post('/', parameterUseCases.createParameter);
router.get('/list', parameterUseCases.getAllParameters);
router.get('/:id', parameterUseCases.getParameterById);
router.get('/get-by-name/:name', parameterUseCases.getParameterByName);
router.patch('/toggle-status/:id', parameterUseCases.toggleParameterStatus);
router.put('/:id', parameterUseCases.updateParameter);
router.delete('/:id', parameterUseCases.deleteParameter);

export default router;