#!/bin/bash

# Configuration
FUNCTION_URL="http://localhost:54321/functions/v1/create-payment"
AUTH_TOKEN="your_anon_key_here" # Replace with valid anon key for local testing

echo "Testing Create Payment (VNPay)..."
curl -X POST $FUNCTION_URL \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "d0e1925b-2d7c-473d-9273-537449339e0f",
    "amount": 50000,
    "provider": "vnpay",
    "ipAddr": "127.0.0.1",
    "language": "vn"
  }'

echo -e "\n\nTesting Create Payment (MoMo)..."
curl -X POST $FUNCTION_URL \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "d0e1925b-2d7c-473d-9273-537449339e0f",
    "amount": 50000,
    "provider": "momo"
  }'

echo -e "\n\nTest script complete."
