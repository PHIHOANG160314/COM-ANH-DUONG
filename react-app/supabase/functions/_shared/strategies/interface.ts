import { PaymentRequest, PaymentResponse } from "../types.ts";

export interface TransactionStatusUpdate {
  status: 'success' | 'failed';
  transactionId?: string; // Gateway transaction ID
  metadata?: any; // Any extra data to store
}

export interface IPaymentStrategy {
  /**
   * Generates the payment URL (redirect URL) for the provider.
   */
  createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Verifies the signature of the incoming webhook (IPN).
   * Returns true if valid, false otherwise.
   */
  verifyWebhook(params: any): Promise<boolean>;

  /**
   * Parses the webhook data to determine the transaction status.
   */
  parseWebhookData(params: any): TransactionStatusUpdate;

  /**
   * Checks the transaction status with the provider API.
   * Useful for reconciliation if webhook is missed.
   */
  checkTransactionStatus(params: any): Promise<TransactionStatusUpdate>;
}
