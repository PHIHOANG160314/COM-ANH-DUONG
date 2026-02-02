import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters';
import { CONTACT_INFO } from '@/shared/config/contact';
// Import OrderDetail from use-order to ensure type safety,
// though we might need to export it from a shared types file if used in multiple places.
// For now I'll import it from the hook file I just created.
import type { OrderDetail } from '../api/use-order';

interface PrintReceiptProps {
  order: OrderDetail;
  variant?: 'icon' | 'button';
}

export const PrintReceipt = ({ order, variant = 'button' }: PrintReceiptProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Updated for newer react-to-print versions or use content: () => componentRef.current
  });

  // Styles for thermal printer (80mm)
  const receiptStyle = {
    width: '80mm',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#000',
    backgroundColor: '#fff',
  };

  const centerStyle = {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '4px 0',
  };

  const boldStyle = {
    fontWeight: 'bold',
  };

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={() => handlePrint()}
          sx={{ textTransform: 'none' }}
        >
          In hóa đơn
        </Button>
      ) : (
        <Button
          size="small"
          onClick={() => handlePrint()}
          title="In hóa đơn"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <Print fontSize="small" />
        </Button>
      )}

      {/* Hidden Receipt Content */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} style={receiptStyle}>
          <div style={centerStyle}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
              CƠM ÁNH DƯƠNG
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              {CONTACT_INFO.address.street}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              {CONTACT_INFO.phone}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              ================================
            </Typography>
          </div>

          <div style={{ margin: '10px 0' }}>
            <div style={rowStyle}>
              <span>Đơn hàng:</span>
              <span style={boldStyle}>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div style={rowStyle}>
              <span>Ngày:</span>
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </div>

          <div style={{ margin: '10px 0' }}>
            <div style={rowStyle}>
              <span>Khách:</span>
              <span style={boldStyle}>
                {order.profiles?.full_name || order.profiles?.username || 'Khách vãng lai'}
              </span>
            </div>
            {order.contact_phone && (
              <div style={rowStyle}>
                <span>SĐT:</span>
                <span>{order.contact_phone}</span>
              </div>
            )}
            {order.delivery_address && (
              <div style={{ margin: '4px 0' }}>
                <span>Đ/C: {order.delivery_address}</span>
              </div>
            )}
          </div>

          <Typography
            variant="caption"
            sx={{ fontSize: '10px', display: 'block', textAlign: 'center' }}
          >
            --------------------------------
          </Typography>

          <div style={{ margin: '10px 0' }}>
            {order.order_items.map((item) => (
              <div key={item.id} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ maxWidth: '65%' }}>
                    {item.quantity}x {item.products?.name}
                  </span>
                  <span>{formatCurrency(item.quantity * item.unit_price)}</span>
                </div>
                {item.note && (
                  <div style={{ fontSize: '10px', fontStyle: 'italic', marginLeft: '10px' }}>
                    ({item.note})
                  </div>
                )}
              </div>
            ))}
          </div>

          <Typography
            variant="caption"
            sx={{ fontSize: '10px', display: 'block', textAlign: 'center' }}
          >
            --------------------------------
          </Typography>

          <div style={{ margin: '10px 0' }}>
            <div style={rowStyle}>
              <span>Tạm tính:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            {/* Discount logic if implemented later */}
            {/* <div style={rowStyle}>
                    <span>Giảm giá:</span>
                    <span>0đ</span>
                </div> */}
          </div>

          <Typography
            variant="caption"
            sx={{ fontSize: '10px', display: 'block', textAlign: 'center' }}
          >
            --------------------------------
          </Typography>

          <div style={{ ...rowStyle, fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>
            <span>TỔNG CỘNG:</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>

          <div style={{ ...centerStyle, marginTop: '20px', marginBottom: '20px' }}>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              ================================
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
              Cảm ơn quý khách!
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              Hẹn gặp lại
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>
              ================================
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
};
