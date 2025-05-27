import {Payment} from '../models/payment.entity';
import {DeepPartial, Repository} from 'typeorm';
import {AppDataSource} from '../config/database';
import {
	CreatePaymentRequest,
	PaymentResponse, WompiTokenRequest,
	WompiTransactionRequest,
	WompiTransactionResponse
} from '../types/payment';
import {PaginatedResponse} from '../types/serverResponse';
import {WompiService} from '../services/wompi';

export class PaymentBO {
	private paymentRepository: Repository<Payment>;
	private wompiService: WompiService;
	private webhookSecret: string
	
	constructor() {
		this.paymentRepository = AppDataSource.getRepository(Payment);
		this.wompiService = new WompiService();
		this.webhookSecret = process.env.WOMPI_WEBHOOK_SECRET || '';
	}
	
	// Crear token de tarjeta
	async createCardToken(cardData: WompiTokenRequest): Promise<string> {
		return await this.wompiService.tokenizeCard(cardData);
	}
	
	// Procesar pago con tarjeta
	async processCardPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
		try {
			// Generar referencia única
			const reference = this.wompiService.generateReference(paymentData.orderId);
			
			// Obtener token de aceptación
			const acceptanceToken = await this.wompiService.getAcceptanceToken();
			
			// Crear transacción en Wompi
			const transactionRequest: WompiTransactionRequest = {
				acceptance_token: acceptanceToken,
				amount_in_cents: paymentData.amount * 100,
				currency: 'COP',
				customer_email: paymentData.customerEmail,
				payment_method: {
					type: 'CARD',
					token: paymentData.token,
					installments: 1
				},
				reference: reference,
				customer_data: {
					phone_number: paymentData.customerPhone,
					full_name: paymentData.customerName
				}
			};
			
			const response: WompiTransactionResponse = await this.wompiService.createTransaction(transactionRequest);
			const wompiResponse = response.data.transaction;
			
			// Extraer información de la tarjeta del token (últimos 4 dígitos)
			const cardInfo = {
				last_four: wompiResponse.payment_method?.extra?.last_four || 'XXXX',
				card_type: wompiResponse.payment_method?.extra?.brand || 'unknown'
			};
			
			// Mapear el estado de Wompi a tu enum
			const mappedState = this.wompiService.mapWompiStatusToState(wompiResponse.status);
			
			// Guardar en base de datos usando tu estructura
			const paymentObject = {
				orderId: paymentData.orderId,
				customerId: paymentData.customerId,
				vendorId: paymentData.vendorId,
				type: 'credit_card',
				state: mappedState,
				amount: paymentData.amount.toString(),
				currency: 'COP',
				references: reference,
				transactionId: wompiResponse.id,
				authorizationCode: null,
				gatewayId: this.wompiService['publicKey'],
				gatewayName: 'Wompi',
				rawResponse: response.data,
				cardInfo: cardInfo,
				cardBrand: wompiResponse.payment_method?.extra?.brand || 'unknown',
				paymentDate: new Date(wompiResponse.created_at),
				expiryDate: null,
				failureReason: wompiResponse.status !== 'APPROVED'
					? wompiResponse.status_message
					: null,
				invoiceNumber: paymentData.invoiceNumber || null,
				receiptUrl: null,
				metadata: {
					customerEmail: paymentData.customerEmail,
					customerPhone: paymentData.customerPhone,
					customerName: paymentData.customerName,
					description: paymentData.description
				}
			} as unknown as Payment;
			
			const newPayment: DeepPartial<Payment> = this.paymentRepository.create({ ...paymentObject });
			
			return await this.paymentRepository.save(newPayment);
			
		} catch (error: any) {
			// Guardar pago fallido en BD para auditoría
			const paymentObject = {
				orderId: paymentData.orderId,
				customerId: paymentData.customerId,
				vendorId: paymentData.vendorId,
				type: 'credit_card',
				state: 'failed',
				amount: paymentData.amount.toString(),
				currency: 'COP',
				references: `FAILED_${Date.now()}`,
				transactionId: null,
				gatewayName: 'Wompi',
				rawResponse: {error: error.message},
				paymentDate: new Date(),
				failureReason: error.message,
				invoiceNumber: paymentData.invoiceNumber || null,
				metadata: {
					customerEmail: paymentData.customerEmail,
					error: error.message
				}
			} as unknown as Payment;
			const failedPayment = this.paymentRepository.create({ ...paymentObject });
			
			await this.paymentRepository.save(failedPayment);
			throw error;
		}
	}
	
	// Obtener pago por ID
	async getPaymentById(paymentId: string): Promise<PaymentResponse | null> {
		return await this.paymentRepository.findOne({
			where: {id: paymentId}
		});
	}
	
	// Obtener pagos por customer
	async getPaymentsByCustomerId(
		customerId: string,
		limit: number = 10,
		page: number = 0,
		state?: string
	): Promise<PaginatedResponse<PaymentResponse>> {
		const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
			.where('payment.customerId = :customerId', {customerId});
		
		if (state) {
			queryBuilder.andWhere('payment.state = :state', {state});
		}
		
		queryBuilder
			.take(limit)
			.skip(page * limit)
			.orderBy('payment.createdAt', 'DESC');
		
		const [data, total] = await queryBuilder.getManyAndCount();
		
		return {
			data,
			meta: {
				total,
				page,
				limit,
				lastPage: Math.ceil(total / limit)
			}
		};
	}
	
	// Obtener pagos por orden
	async getPaymentsByOrderId(orderId: string): Promise<PaymentResponse[]> {
		return await this.paymentRepository.find({
			where: {orderId},
			order: {createdAt: 'DESC'}
		});
	}
	
	// Obtener pagos por vendor
	async getPaymentsByVendorId(
		vendorId: string,
		limit: number = 10,
		page: number = 0
	): Promise<PaginatedResponse<PaymentResponse>> {
		const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
			.where('payment.vendorId = :vendorId', {vendorId});
		
		queryBuilder
			.take(limit)
			.skip(page * limit)
			.orderBy('payment.createdAt', 'DESC');
		
		const [data, total] = await queryBuilder.getManyAndCount();
		
		return {
			data,
			meta: {
				total,
				page,
				limit,
				lastPage: Math.ceil(total / limit)
			}
		};
	}
	
	// Actualizar estado del pago
	async updatePaymentStatus( paymentId: string, status: string, rawData: any, failureReason?: string ): Promise<boolean> {
		const maxRetries = 3;
		let attempts = 0;
		let success = false;
		
		while (attempts < maxRetries && !success) {
			attempts++;
			try {
				const mappedState = this.wompiService.mapWompiStatusToState(status);
				const currentPayment = await this.paymentRepository.findOne({
					where: { id: paymentId }
				});
				
				if (!currentPayment) {
					throw new Error(`Payment ${paymentId} not found`);
				}
				
				// Si ya está en el estado deseado, retornar éxito
				if (currentPayment.state === mappedState) {
					return true;
				}
				
				const result = await this.paymentRepository.update(
					{ id: paymentId },
					{
						state: mappedState,
						rawResponse: rawData,
						failureReason: failureReason || undefined,
						updatedAt: new Date(),
						metadata: {
							...(currentPayment.metadata || {}),
							webhookAttempts: attempts,
							lastWebhookAttempt: new Date().toISOString()
						}
					}
				);
				
				success = result.affected ? result.affected > 0 : false;
				
				if (!success) {
					console.warn(`Failed to update payment ${paymentId}, attempt ${attempts}/${maxRetries}`);
					await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
				}
			} catch (error) {
				console.error(`Error updating payment status (attempt ${attempts}):`, error);
				if (attempts >= maxRetries) throw error;
				await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
			}
		}
		
		if (!success) {
			throw new Error(`Failed to update payment status after ${maxRetries} attempts`);
		}
		
		return true;
	}
	
	// Consultar estado en Wompi y actualizar
	async syncPaymentStatus(paymentId: string): Promise<PaymentResponse | null> {
		const payment = await this.getPaymentById(paymentId);
		if (!payment || !payment.transactionId) return null;
		
		try {
			const wompiResponse = await this.wompiService.getTransaction(payment.transactionId);
			await this.updatePaymentStatus(
				paymentId,
				wompiResponse.data.transaction.status,
				wompiResponse.data.transaction,
				wompiResponse.data.transaction.status_message || undefined
			);
			
			return await this.getPaymentById(paymentId);
		} catch (error) {
			console.error('Error syncing payment status:', error);
			return payment;
		}
	}
	// Procesar webhook
	async processWebhook(webhookData: any, headers: Record<string, string>): Promise<{ success: boolean; message: string }> {
		const signature = headers['x-wompi-signature'] || '';
		const timestamp = parseInt(headers['x-wompi-timestamp'] || '0');
		const event = webhookData.event;
		const attempt = parseInt(headers['x-wompi-attempt'] || '1');
		
		if (!this.wompiService.verifyWebhookSignature(signature, event, timestamp, this.webhookSecret)) {
			throw new Error('Invalid webhook signature');
		}
		
		if (event !== 'transaction.updated') {
			return {
				success: true,
				message: 'Non-transaction event ignored'
			};
		}
		
		const transaction = webhookData.data?.transaction;
		if (!transaction) {
			throw new Error('No transaction data in webhook');
		}
		
		console.log(`Processing webhook for transaction ${transaction.id}, attempt ${attempt}`);
		
		const payment = await this.getPaymentByTransactionId(transaction.id);
		if (!payment) {
			throw new Error(`Payment not found for transaction ${transaction.id}`);
		}
		
		await this.updatePaymentStatus(
			payment.id,
			transaction.status,
			transaction,
			transaction.status_message
		);
		
		console.log(`Successfully processed webhook for transaction ${transaction.id}`);
		return {
			success: true,
			message: 'Webhook processed successfully'
		};
	}
	
	// Buscar pago por transactionId de Wompi
	async getPaymentByTransactionId(transactionId: string): Promise<PaymentResponse | null> {
		return await this.paymentRepository.findOne({
			where: {transactionId}
		});
	}
	
	// Generar referencia única
	generatePaymentReference(orderId: string): string {
		return this.wompiService.generateReference(orderId);
	}
}