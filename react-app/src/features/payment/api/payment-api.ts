import { supabase } from '@/shared/api/supabase-client';

export type PaymentProvider = 'cash' | 'vnpay' | 'momo';

export interface CreatePaymentResponse {
  paymentUrl: string;
  transactionId: string;
}

export const paymentApi = {
  createPayment: async (orderId: string, amount: number, provider: PaymentProvider, language: 'vn' | 'en' = 'vn') => {
    const { data, error } = await supabase.functions.invoke<CreatePaymentResponse>('create-payment', {
      body: {
        orderId,
        amount,
        provider,
        language,
        ipAddr: '127.0.0.1', // In a real app, the Edge Function should extract this from headers if possible, or we rely on the function to handle it.
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },
};
