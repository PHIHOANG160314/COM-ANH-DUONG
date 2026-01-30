export interface PaymentRequest {
  orderId: string;
  amount: number;
  provider: 'vnpay' | 'momo' | 'cash';
  bankCode?: string; // Optional specific bank for VNPay
  language?: 'vn' | 'en';
  ipAddr: string; // Required for VNPay
}

export interface PaymentResponse {
  paymentUrl: string;
  transactionId: string; // Our internal UUID
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'expired';

export interface Database {
  public: {
    Tables: {
      payment_transactions: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          amount: number;
          status: string;
          transaction_id: string | null;
          request_id: string | null;
          payment_url: string | null;
          return_url: string | null;
          ipn_data: any | null;
          metadata: any | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: string;
          amount: number;
          status?: string;
          transaction_id?: string | null;
          request_id?: string | null;
          payment_url?: string | null;
          return_url?: string | null;
          ipn_data?: any | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          amount?: number;
          status?: string;
          transaction_id?: string | null;
          request_id?: string | null;
          payment_url?: string | null;
          return_url?: string | null;
          ipn_data?: any | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}
