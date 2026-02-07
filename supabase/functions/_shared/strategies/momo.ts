/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPaymentStrategy, TransactionStatusUpdate } from './interface.ts';
import { PaymentRequest, PaymentResponse } from '../types.ts';
import { hmacSHA256 } from '../crypto.ts';

export class MoMoStrategy implements IPaymentStrategy {
  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  private returnUrl: string;
  private ipnUrl: string; // The deployed URL of our handle-webhook function

  constructor() {
    this.partnerCode = Deno.env.get('MOMO_PARTNER_CODE') ?? '';
    this.accessKey = Deno.env.get('MOMO_ACCESS_KEY') ?? '';
    this.secretKey = Deno.env.get('MOMO_SECRET_KEY') ?? '';
    this.endpoint =
      Deno.env.get('MOMO_ENDPOINT') ?? 'https://test-payment.momo.vn/v2/gateway/api/create';
    this.returnUrl = Deno.env.get('MOMO_RETURN_URL') ?? '';

    // In production, this must be the real URL. In dev, we might use ngrok or similar.
    // For now, we assume it's set in env or we derive it.
    // Let's assume SUPABASE_URL is available and we can construct the function URL.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const projectRef = supabaseUrl.split('https://')[1]?.split('.')[0];
    // Default to a constructed URL if not explicitly set
    this.ipnUrl =
      Deno.env.get('MOMO_IPN_URL') ??
      `https://${projectRef}.supabase.co/functions/v1/handle-webhook?provider=momo`;

    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      console.warn('MoMo env vars missing (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY)');
    }
  }

  async createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse> {
    const orderInfo = `Thanh toan don hang ${request.orderId}`;
    const requestType = 'captureWallet';
    const extraData = ''; // Pass empty string if none

    // Raw Signature String Construction
    // Format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${this.accessKey}&amount=${request.amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${request.orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.returnUrl}&requestId=${request.orderId}&requestType=${requestType}`;

    const signature = hmacSHA256(this.secretKey, rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: request.orderId, // using orderId as requestId for simplicity, usually requestId is unique per attempt
      amount: request.amount,
      orderId: request.orderId,
      orderInfo: orderInfo,
      redirectUrl: this.returnUrl,
      ipnUrl: this.ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: request.language || 'vi',
    };

    // Call MoMo API
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.resultCode === 0 || data.resultCode === 9000) {
        // 9000 is for pending/auth
        return {
          paymentUrl: data.payUrl,
          transactionId: request.orderId,
        };
      } else {
        console.error('MoMo API Error:', data);
        throw new Error(`MoMo Error: ${data.message || data.resultCode}`);
      }
    } catch (e) {
      // If fetch fails (e.g. sandbox down), fallback or rethrow
      // For development/stubbing without network:
      if (this.partnerCode === 'stub') {
        return {
          paymentUrl: `https://test-payment.momo.vn/pay?requestId=${request.orderId}`,
          transactionId: request.orderId,
        };
      }
      throw e;
    }
  }

  async verifyWebhook(params: any): Promise<boolean> {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = params;

    // Signature verification logic
    // Format: accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const generatedSignature = hmacSHA256(this.secretKey, rawSignature);

    return signature === generatedSignature;
  }

  parseWebhookData(params: any): TransactionStatusUpdate {
    const isSuccess = params.resultCode == 0;
    return {
      status: isSuccess ? 'success' : 'failed',
      transactionId: params.transId,
      metadata: params,
    };
  }

  async checkTransactionStatus(params: any): Promise<TransactionStatusUpdate> {
    const { orderId } = params;
    const requestId = crypto.randomUUID();
    const requestType = 'transactionStatus';

    // Signature format:
    // accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode&requestId=$requestId&requestType=$requestType
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}&requestType=${requestType}`;
    const signature = hmacSHA256(this.secretKey, rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      orderId: orderId,
      requestType: requestType,
      signature: signature,
      lang: 'vi',
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // resultCode: 0 = Success, other = Failed/Pending
      if (data.resultCode === 0) {
        return { status: 'success', transactionId: data.transId, metadata: data };
      } else {
        // MoMo has various error codes.
        // 9000 = Authorized/Pending?
        // For reconciliation, if not 0, it's effectively not successful.
        return { status: 'failed', transactionId: data.transId, metadata: data };
      }
    } catch (e) {
      console.error('MoMo Check Status Error', e);
      throw e;
    }
  }
}
