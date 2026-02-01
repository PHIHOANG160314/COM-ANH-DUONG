import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useAuth } from '@/app/providers/use-auth';
import { useAddresses } from '@/features/profile/hooks/use-addresses';
import { useLoyalty } from '@/features/profile/hooks/use-loyalty';
import { supabase } from '@/shared/api/supabase-client';
import { paymentApi, type PaymentProvider } from '@/features/payment/api/payment-api';
import { Debug } from '@/shared/utils/debug';
import type { Database } from '@/shared/types/database.types';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ giao hàng'),
  note: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const useCheckout = () => {
  const { items, totalAmount, clearCart, updateItemPrice } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('cash');

  // Loyalty & Addresses
  const { addresses } = useAddresses();
  const { stats } = useLoyalty();
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      address: '',
    },
  });

  const { watch, setValue } = form;

  // Watch address field to uncheck saved address if user types manually
  const addressValue = watch('address');
  useEffect(() => {
    if (useSavedAddress && selectedAddressId) {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected && addressValue !== selected.address) {
        // User modified the address manually
        // We can keep useSavedAddress true or false, but logically it's now a custom address
        // setUseSavedAddress(false); // Optional: reset selection
      }
    }
  }, [addressValue, useSavedAddress, selectedAddressId, addresses]);

  // Handle Address Selection
  const handleAddressSelect = (addressId: string) => {
    const selected = addresses.find((a) => a.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setUseSavedAddress(true);
      setValue('address', selected.address, { shouldValidate: true });
      if (selected.phone) {
        setValue('phone', selected.phone, { shouldValidate: true });
      }
    }
  };

  // Calculations
  const subtotal = totalAmount();
  const discountAmount = pointsToRedeem * 100; // 1 Point = 100 VND
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0 || loading) return;
    setLoading(true);

    try {
      // Validate current prices match cart prices
      const menuItemIds = items.map((item) => Number(item.id));
      const { data: currentPrices } = await supabase
        .from('menu_items')
        .select('id, price')
        .in('id', menuItemIds);

      if (currentPrices) {
        const pricesMismatch = items.some((item) => {
          const current = currentPrices.find((p) => p.id === Number(item.id));
          return current && current.price !== item.price;
        });

        if (pricesMismatch) {
          // Update cart with new prices
          currentPrices.forEach((p) => {
            const item = items.find((i) => Number(i.id) === p.id);
            if (item && item.price !== p.price) {
              updateItemPrice(item.id, p.price);
            }
          });

          alert('Giá món ăn đã thay đổi. Vui lòng kiểm tra lại giỏ hàng.');
          setLoading(false);
          return;
        }
      }

      // 1. Get Customer ID (if logged in)
      let customerId = null;
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (customer) {
          customerId = customer.id;
        }
      }

      // 2. Prepare Payloads
      const orderPayload = {
        customer_id: customerId,
        customer_name: DOMPurify.sanitize(data.fullName.trim()),
        customer_phone: DOMPurify.sanitize(data.phone.replace(/\s/g, '')),
        delivery_address: DOMPurify.sanitize(data.address.trim()),
        notes: DOMPurify.sanitize(data.note?.trim() || ''),
        total: finalTotal,
        subtotal: subtotal,
        discount: discountAmount,
        points_redeemed: pointsToRedeem,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_type: 'delivery',
      };

      const orderItemsPayload = items.map((item) => ({
        menu_item_id: Number(item.id),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        item_name: item.name,
        notes: item.note,
      }));

      // 3. Call Atomic Transaction RPC
      const { data: orderData, error: orderError } = await supabase.rpc('create_order_atomic', {
        p_order_payload: orderPayload,
        p_items_payload: orderItemsPayload,
      });

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Không thể tạo đơn hàng');

      // The RPC returns the created order object directly
      // Type safe casting
      const createdOrder = orderData as Database['public']['Tables']['orders']['Row'];

      // 4. Process Payment
      if (paymentMethod === 'cash') {
        clearCart();
        navigate('/order-success', {
          state: {
            orderId: createdOrder.id,
            totalAmount: finalTotal,
            paymentMethod: 'cash',
          },
        });
      } else {
        // Online Payment
        const paymentResponse = await paymentApi.createPayment(
          createdOrder.id,
          finalTotal, // Use discounted total
          paymentMethod
        );

        if (!paymentResponse || !paymentResponse.paymentUrl) {
          throw new Error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
        }

        // Do NOT clear cart here. Wait for payment success callback.
        window.location.href = paymentResponse.paymentUrl;
      }
    } catch (err) {
      // Handle Supabase PostgrestError and standard Error objects
      let errorMessage = 'Có lỗi không xác định xảy ra';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        // Supabase PostgrestError has a message property
        errorMessage = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'error' in err) {
        // Some Supabase errors might be in this format
        errorMessage = (err as { error: string }).error;
      }

      Debug.error('Checkout error:', err);
      alert(`Có lỗi xảy ra: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    items,
    user,
    loading,
    paymentMethod,
    setPaymentMethod,
    addresses,
    stats,
    selectedAddressId,
    handleAddressSelect,
    pointsToRedeem,
    setPointsToRedeem,
    subtotal,
    discountAmount,
    finalTotal,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
