import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import { WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_BASE_URL } from '../utils/constants';
import { WompiTokenRequest, WompiTransactionRequest, WompiTransactionResponse } from '../types/payment';

export class WompiService {
  private baseURL: string;
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.baseURL = WOMPI_BASE_URL || '';
    this.publicKey = WOMPI_PUBLIC_KEY || '';
    this.privateKey = WOMPI_PRIVATE_KEY || '';
  }

  // Obtener token de aceptación
  async getAcceptanceToken(): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL}/merchants/${this.publicKey}`);
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error: any) {
      console.error('Error getting acceptance token:', error.response?.data || error.message);
      throw new Error('Error obteniendo token de aceptación de Wompi');
    }
  }

  // Tokenizar tarjeta de crédito
  async tokenizeCard(cardData: WompiTokenRequest): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/tokens/cards`,
        cardData,
        {
          headers: {
            'Authorization': `Bearer ${this.publicKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data.id;
    } catch (error: any) {
      console.error('Error tokenizing card:', error.response?.data || error.message);
      throw new Error('Error tokenizando la tarjeta');
    }
  }

  // Crear transacción
  async createTransaction(transactionData: WompiTransactionRequest): Promise<WompiTransactionResponse> {
    try {
      const response: AxiosResponse<WompiTransactionResponse> = await axios.post(
        `${this.baseURL}/transactions`,
        transactionData,
        {
          headers: {
            'Authorization': `Bearer ${this.privateKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.reason || 'Error procesando el pago');
    }
  }

  // Consultar transacción
  async getTransaction(transactionId: string): Promise<WompiTransactionResponse> {
    try {
      const response: AxiosResponse<WompiTransactionResponse> = await axios.get(
        `${this.baseURL}/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.privateKey}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting transaction:', error.response?.data || error.message);
      throw new Error('Error consultando la transacción');
    }
  }
	
	// Verificar la firma del webhook
	verifyWebhookSignature(signature: string, event: string, timestamp: number, secret: string): boolean {
		try {
			const signatureComponents = signature.split('.');
			if (signatureComponents.length !== 2) return false;
			
			const [timestampPart, signaturePart] = signatureComponents;
			const expectedSignature = crypto
				.createHmac('sha256', secret)
				.update(`${event}.${timestamp}`)
				.digest('hex');
			
			return crypto.timingSafeEqual(
				Buffer.from(signaturePart, 'hex'),
				Buffer.from(expectedSignature, 'hex')
			) && timestampPart === timestamp.toString();
		} catch (error) {
			console.error('Error verifying webhook signature:', error);
			return false;
		}
	}
	
	// Mapear estados
	mapWompiStatusToState(status: string): 'pending' | 'completed' | 'failed' | 'refunded' {
		const statusMap: Record<string, 'pending' | 'completed' | 'failed' | 'refunded'> = {
			'PENDING': 'pending',
			'APPROVED': 'completed',
			'DECLINED': 'failed',
			'ERROR': 'failed',
			'VOIDED': 'refunded',
			'REFUNDED': 'refunded',
			'PARTIALLY_REFUNDED': 'refunded'
		};
		
		return statusMap[status] || 'pending';
	}

  // Detectar tipo de tarjeta
  detectCardBrand(cardNumber: string): string {
    const cardPatterns = {
      'visa': /^4/,
      'mastercard': /^5[1-5]/,
      'amex': /^3[47]/,
      'diners': /^3[0689]/
    };

    for (const [brand, pattern] of Object.entries(cardPatterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }
    return 'unknown';
  }

  // Generar referencia única
  generateReference(orderId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER_${orderId}_${timestamp}_${random}`;
  }
}