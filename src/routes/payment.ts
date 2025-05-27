import express from 'express';
import { PaymentUseCases } from '../useCases/payment.useCase';
import verifyToken from '../middlewares/validateToken';

export const router = express.Router();
const paymentUseCases = new PaymentUseCases();

// Crear token de tarjeta
router.post('/token', verifyToken, paymentUseCases.createCardToken);

// Procesar pago con tarjeta
router.post('/card', verifyToken, paymentUseCases.processCardPayment);

// Obtener pago por ID
router.get('/:paymentId', verifyToken, paymentUseCases.getPayment);

// Obtener pagos por customer
router.get('/customer/:customerId', verifyToken, paymentUseCases.getPaymentsByCustomer);

// Obtener pagos por orden
router.get('/order/:orderId', verifyToken, paymentUseCases.getPaymentsByOrder);

// Sincronizar estado del pago
router.put('/sync/:paymentId', verifyToken, paymentUseCases.syncPaymentStatus);

// Webhook de Wompi (sin autenticación)
router.post('/webhook', paymentUseCases.handleWebhook);

export default router;