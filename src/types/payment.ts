import { Request } from "express";

export interface PaymentResponse {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  type: 'debit_card' | 'credit_card' | 'cash' | 'transfer';
  state: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: string;
  currency: string;
  references: string;
  transactionId?: string;
  authorizationCode?: string;
  gatewayId?: string;
  gatewayName?: string;
  cardBrand?: string;
  paymentDate: Date;
  expiryDate?: Date;
  failureReason?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  orderId: string;
  customerId: string;
  vendorId: string;
	token: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  description?: string;
  invoiceNumber?: string;
}

export interface WompiTokenRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface WompiTransactionRequest {
  acceptance_token: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token?: string;
    installments?: number;
  };
  reference: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
  };
}

export interface WompiTransactionResponse {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      currency: string;
      payment_method_type: string;
      payment_method: {
        type: string;
        extra: {
          name: string;
          brand: string;
          last_four: string;
          external_identifier: string;
        };
        installments: number;
      };
      redirect_url: string | null;
      status: string;
      status_message: string | null;
      merchant: {
        name: string;
        legal_name: string;
        contact_name: string;
        phone_number: string;
        logo_url: string | null;
        legal_id_type: string;
        legal_id: string;
        merchant_logo_url: string | null;
      };
      taxes: any[];
      customer_data: {
        full_name: string;
        phone_number: string;
        email: string;
      };
      billing_data: any;
      shipping_address: any;
      created_at: string;
      updated_at: string;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
  environment: string;
}

export interface WebhookHeaders {
	'x-wompi-signature': string;
	'x-wompi-timestamp': string;
	'x-wompi-attempt'?: string;
	[key: string]: string | undefined;
}

export interface WebhookResponse {
	success: boolean;
	message: string;
	transactionId?: string;
}

// Request interfaces
export interface CreatePaymentRequestExtended extends Request {
  body: CreatePaymentRequest;
}

export interface CreateTokenRequestExtended extends Request {
  body: WompiTokenRequest;
}

export interface ProcessCardPaymentRequestExtended extends Request {
  body: {
    orderId: string;
    customerId: string;
    vendorId: string;
    token: string;
    amount: number;
    customerEmail: string;
    customerPhone?: string;
    customerName?: string;
    description?: string;
    invoiceNumber?: string;
  };
}

export interface GetPaymentRequestExtended extends Request {
  params: {
    paymentId: string;
  };
}

export interface GetPaymentsByCustomerRequestExtended extends Request {
  params: {
    customerId: string;
  };
  query: {
    limit?: string;
    page?: string;
    state?: string;
  };
}

export interface GetPaymentsByOrderRequestExtended extends Request {
  params: {
    orderId: string;
  };
}

// Response interfaces
export interface CreatePaymentResponse {
  id: string;
  transactionId?: string;
  state: string;
  redirectUrl?: string;
  message: string;
}

export interface TokenResponse {
  token: string;
  message: string;
}