import { IPaymentStrategy, TransactionStatusUpdate } from "./interface.ts";
import { PaymentRequest, PaymentResponse } from "../types.ts";
import { hmacSHA512, sortObject } from "../crypto.ts";

export class VNPayStrategy implements IPaymentStrategy {
  private tmnCode: string;
  private hashSecret: string;
  private vnpUrl: string;
  private returnUrl: string;

  constructor() {
    this.tmnCode = Deno.env.get("VNP_TMN_CODE") ?? "";
    this.hashSecret = Deno.env.get("VNP_HASH_SECRET") ?? "";
    this.vnpUrl = Deno.env.get("VNP_URL") ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    this.returnUrl = Deno.env.get("VNP_RETURN_URL") ?? "";

    if (!this.tmnCode || !this.hashSecret) {
      console.warn("VNPay env vars missing (VNP_TMN_CODE or VNP_HASH_SECRET)");
    }
  }

  async createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse> {
    const date = new Date();
    // Format: YYYYMMDDHHmmss - UTC+7 for Vietnam
    // Deno deploy might be UTC, so we add 7 hours
    const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const createDate = vnTime.toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    // Expire in 15 mins
    const expireTime = new Date(date.getTime() + 15 * 60 * 1000 + 7 * 60 * 60 * 1000);
    const expireDate = expireTime.toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    const ipAddr = request.ipAddr || "127.0.0.1";
    const amount = request.amount * 100; // VNPay uses VND * 100

    const vnpParams: Record<string, string | number> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: request.language || "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: request.orderId, // Using orderId as TxnRef. Assuming orderId is unique enough or we map it.
      vnp_OrderInfo: `Thanh toan don hang ${request.orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount,
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (request.bankCode) {
      vnpParams["vnp_BankCode"] = request.bankCode;
    }

    // Sort params alphabetically
    const sortedParams = sortObject(vnpParams);

    // Build query string for signing
    const signData = new URLSearchParams();
    Object.keys(sortedParams).forEach(key => {
        signData.append(key, String(sortedParams[key]));
    });

    const signed = hmacSHA512(this.hashSecret, signData.toString());

    signData.append("vnp_SecureHash", signed);

    return {
      paymentUrl: `${this.vnpUrl}?${signData.toString()}`,
      transactionId: request.orderId // We are using orderId as ref for now
    };
  }

  async verifyWebhook(params: any): Promise<boolean> {
    const secureHash = params["vnp_SecureHash"];
    const secureHashType = params["vnp_SecureHashType"]; // Optional, might be present

    const cleanParams = { ...params };
    delete cleanParams["vnp_SecureHash"];
    delete cleanParams["vnp_SecureHashType"];

    const sortedParams = sortObject(cleanParams);
    const signData = new URLSearchParams();
    Object.keys(sortedParams).forEach(key => {
        // vnpay sometimes sends '+' instead of space in values, need to check decoding
        // but typically URLSearchParams handles encoding.
        // Important: VNPay verifies on the raw query string value logic usually.
        // For simplicity with Deno URLSearchParams, let's try standard approach.
        signData.append(key, String(sortedParams[key]));
    });

    const signed = hmacSHA512(this.hashSecret, signData.toString());

    return secureHash === signed;
  }

  parseWebhookData(params: any): TransactionStatusUpdate {
    // vnp_ResponseCode = '00' means success
    const isSuccess = params["vnp_ResponseCode"] === "00";
    return {
      status: isSuccess ? "success" : "failed",
      transactionId: params["vnp_TransactionNo"],
      metadata: params
    };
  }

  async checkTransactionStatus(params: any): Promise<TransactionStatusUpdate> {
    // VNPay QueryDR Implementation
    // Params should contain: orderId, transDate (YYYYMMDDHHmmss of the original txn)
    // For reconciliation, we might store transDate in metadata or derive it if we only have created_at from DB

    const { orderId, transDate, ipAddr } = params;

    const requestId = crypto.randomUUID();
    const command = "querydr";
    const createDate = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14); // Current time for request

    const vnpParams: Record<string, string | number> = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: command,
      vnp_TmnCode: this.tmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Query transaction ${orderId}`,
      vnp_TransDate: transDate, // Original transaction date is required for QueryDR
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr || "127.0.0.1"
    };

    const sortedParams = sortObject(vnpParams);
    const signData = new URLSearchParams();
    Object.keys(sortedParams).forEach(key => {
        signData.append(key, String(sortedParams[key]));
    });

    const signed = hmacSHA512(this.hashSecret, signData.toString());

    // VNPay QueryDR uses the same URL structure often, or a specific one.
    // Sandbox QueryDR URL is usually different from Pay URL.
    // Defaulting to Pay URL base but might be separate in real env.
    // For Sandbox: https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
    const queryUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    const requestBody = {
      ...vnpParams,
      vnp_SecureHash: signed
    };

    try {
      const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // vnp_ResponseCode in QueryDR response indicates if the *Query* was successful (00)
      // vnp_TransactionStatus indicates the actual transaction status:
      // 00: Success
      // 01: Pending
      // 02: Failed

      if (data.vnp_ResponseCode === "00") {
        if (data.vnp_TransactionStatus === "00") {
          return { status: "success", transactionId: data.vnp_TransactionNo, metadata: data };
        } else if (data.vnp_TransactionStatus === "01") {
          // Still pending, maybe throw or return something indicating no change?
          // For simplicity, treating as failed/pending loop, but we need to match TransactionStatusUpdate type
          // If pending, we return 'failed' effectively means "not success yet" for reconciliation?
          // Or we throw error to retry later.
          // Let's assume we only update if Success or definitely Failed.
           throw new Error("Transaction still pending");
        } else {
           return { status: "failed", transactionId: data.vnp_TransactionNo, metadata: data };
        }
      } else {
        throw new Error(`Query failed: ${data.vnp_Message}`);
      }
    } catch (e) {
      console.error("VNPay Check Status Error", e);
      throw e;
    }
  }
}
