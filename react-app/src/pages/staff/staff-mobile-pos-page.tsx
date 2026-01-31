import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { TableSelection } from '@/features/pos/components/table-selection';
import { MenuGrid } from '@/features/menu/components/menu-grid';
import { PosCart } from '@/features/pos/components/pos-cart';
import { useCartStore } from '@/features/cart/model/cart-store';
import { supabase } from '@/shared/api/supabase-client';
import { useAuth } from '@/app/providers/auth-provider';
import { Debug } from '@/shared/utils/debug';

export const StaffMobilePosPage = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuth();

  const handleSelectTable = (tableId: string) => {
    setSelectedTable(tableId);
    clearCart(); // Start fresh for new table selection (simple mode)
    // In real app, we would fetch existing draft order for this table here
  };

  const handleClearTable = () => {
    if (window.confirm('Bạn có chắc muốn đổi bàn? Đơn hàng hiện tại sẽ bị xóa khỏi bộ nhớ tạm.')) {
      setSelectedTable(null);
      clearCart();
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || items.length === 0) return;
    setLoading(true);

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount: totalAmount(),
          status: 'confirmed', // Staff orders are auto-confirmed
          delivery_address: selectedTable === 'takeaway' ? 'Mang về' : `Bàn ${selectedTable}`,
          note: `Staff Order - ${user?.email}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        note: item.note,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      alert(`Đã lên đơn thành công! (ID: ${orderData.id.slice(0, 6)})`);
      clearCart();
      setSelectedTable(null); // Go back to table selection
    } catch (err) {
      Debug.error('POS Order error:', err);
      alert('Lỗi khi lên đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTable) {
    return <TableSelection onSelectTable={handleSelectTable} />;
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
          <MenuGrid />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', borderLeft: '1px solid #ddd' }}>
          <PosCart
            tableId={selectedTable}
            onClearTable={handleClearTable}
            onSubmitOrder={handleSubmitOrder}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
