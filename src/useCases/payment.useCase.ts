import { Request, Response } from 'express';
import { PaymentBO } from '../business/paymentBO';
import {
	CreateTokenRequestExtended,
	ProcessCardPaymentRequestExtended,
	GetPaymentRequestExtended,
	GetPaymentsByCustomerRequestExtended,
	GetPaymentsByOrderRequestExtended,
	CreatePaymentResponse,
	TokenResponse,
	PaymentResponse
} from '../types/payment';
import { ApiResponse } from '../types/serverResponse';
import { responseError, responseOk } from '../utils/standardResponseServer';

export class PaymentUseCases {
	private paymentBO: PaymentBO = new PaymentBO();
	
	// Crear token de tarjeta
	createCardToken = async (
		req: CreateTokenRequestExtended,
		res: Response<ApiResponse<TokenResponse>>
	): Promise<void> => {
		try {
			const cardData = req.body;
			const token = await this.paymentBO.createCardToken(cardData);
			
			res.status(200).json(responseOk({
				token,
				message: 'Token de tarjeta creado exitosamente'
			}));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Procesar pago con tarjeta
	processCardPayment = async (
		req: ProcessCardPaymentRequestExtended,
		res: Response<ApiResponse<CreatePaymentResponse>>
	): Promise<void> => {
		try {
			const paymentData = req.body;
			
			const payment = await this.paymentBO.processCardPayment(paymentData);
			
			res.status(201).json(responseOk({
				id: payment.id!,
				transactionId: payment.transactionId || undefined,
				state: payment.state,
				message: payment.state === 'completed' ? 'Pago procesado exitosamente' : 'Pago en proceso'
			}));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Obtener pago por ID
	getPayment = async (
		req: GetPaymentRequestExtended,
		res: Response<ApiResponse<PaymentResponse>>
	): Promise<void> => {
		try {
			const { paymentId } = req.params;
			const payment = await this.paymentBO.getPaymentById(paymentId);
			
			if (!payment) {
				res.status(404).json(responseError<any>({ message: 'Pago no encontrado' }));
				return;
			}
			
			res.status(200).json(responseOk(payment));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Obtener pagos por customer
	getPaymentsByCustomer = async (
		req: GetPaymentsByCustomerRequestExtended,
		res: Response<ApiResponse<PaymentResponse[]>>
	): Promise<void> => {
		try {
			const { customerId } = req.params;
			const limit = parseInt(req.query.limit as string) || 10;
			const page = parseInt(req.query.page as string) || 0;
			const state = req.query.state as string;
			
			const payments = await this.paymentBO.getPaymentsByCustomerId(customerId, limit, page, state);
			res.status(200).json(responseOk(payments.data));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Obtener pagos por orden
	getPaymentsByOrder = async (
		req: GetPaymentsByOrderRequestExtended,
		res: Response<ApiResponse<PaymentResponse[]>>
	): Promise<void> => {
		try {
			const { orderId } = req.params;
			const payments = await this.paymentBO.getPaymentsByOrderId(orderId);
			res.status(200).json(responseOk(payments));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Sincronizar estado del pago
	syncPaymentStatus = async (
		req: GetPaymentRequestExtended,
		res: Response<ApiResponse<PaymentResponse>>
	): Promise<void> => {
		try {
			const { paymentId } = req.params;
			const payment = await this.paymentBO.syncPaymentStatus(paymentId);
			
			if (!payment) {
				res.status(404).json(responseError<any>({ message: 'Pago no encontrado' }));
				return;
			}
			
			res.status(200).json(responseOk(payment));
		} catch (error: any) {
			res.status(400).json(responseError<any>({ message: error.message }));
		}
	}
	
	// Webhook de Wompi
	handleWebhook = async (req: Request, res: Response): Promise<void> => {
		try {
			const result = await this.paymentBO.processWebhook(req.body, req.headers as any);
			res.status(200).json(responseOk({
				received: true,
				processed: true,
				message: result.message
			}));
		} catch (error: any) {
			console.error('Error processing webhook:', error);
			
			// Manejar reintentos
			const attempt = parseInt(req.headers['x-wompi-attempt'] as string) || 1;
			if (attempt < 3) {
				console.log(`Will retry webhook, attempt ${attempt + 1}`);
				res.status(500).json(responseError({
					error: 'Processing error, will retry',
					retry: true
				}));
			}
			
			// Error después de múltiples intentos
			console.error('Max retries reached for webhook');
			res.status(500).json(responseError({
				error: 'Max retries reached',
				retry: false
			}));
		}
	};
}