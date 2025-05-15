import express from 'express'
import { OrderUseCases } from "../useCases/order.useCases"
import verifyToken from '../middlewares/validateToken'

const router = express.Router()
const orderUseCases = new OrderUseCases()


// Crear una nueva orden
router.post('/create', verifyToken, orderUseCases.createOrder);

// Obtener todas las órdenes (administrador)
router.get('/all', verifyToken, orderUseCases.getAllOrders);

// Obtener estadísticas de órdenes
router.get('/stats', verifyToken, orderUseCases.getStats);

// Obtener una orden específica por ID
router.get('/get-detail/:id', verifyToken, orderUseCases.getOrderById);

// Obtener órdenes de un cliente específico
router.get('/customer/:customerId', verifyToken, orderUseCases.getCustomerOrders);

// Obtener órdenes de un vendedor específico
router.get('/vendor/:vendorId', verifyToken, orderUseCases.getVendorOrders);

// Obtener órdenes de una tienda específica
router.get('/branch/:branchId', verifyToken, orderUseCases.getBranchOrders);

// Actualizar el estado de una orden
router.put('/:id/status', verifyToken, orderUseCases.updateOrderStatus);

// Actualizar el estado de pago de una orden
router.put('/:id/payment', verifyToken, orderUseCases.updatePaymentStatus);

// Calificar una orden completada
router.put('/:id/rate', verifyToken, orderUseCases.rateOrder);

export default router