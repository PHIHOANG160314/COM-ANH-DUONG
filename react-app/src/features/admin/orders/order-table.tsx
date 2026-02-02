import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useState } from 'react';
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters';
import type { Order } from './use-admin-orders';
import { PrintReceipt } from '@/features/orders/components/print-receipt';
// We can assert compatibility since types are structurally identical
import type { OrderDetail } from '@/features/orders/api/use-order';

interface OrderRowProps {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
}

const getStatusColor = (
  status: string
): 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default' => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'preparing':
      return 'info';
    case 'ready':
      return 'success';
    case 'delivering':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const OrderRow = ({ order, onStatusChange }: OrderRowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
          #{order.id.slice(0, 6).toUpperCase()}
        </TableCell>
        <TableCell>
          {order.profiles?.full_name || order.profiles?.username || 'Khách vãng lai'}
          {order.contact_phone && (
            <Typography variant="caption" display="block" color="text.secondary">
              {order.contact_phone}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
          {formatCurrency(order.total_amount)}
        </TableCell>
        <TableCell>{formatDateTime(order.created_at)}</TableCell>
        <TableCell>
          <FormControl size="small" variant="standard" fullWidth>
            <Select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
              sx={{
                fontSize: '0.875rem',
                color: (theme) => {
                  const colorKey = getStatusColor(order.status);
                  if (colorKey === 'default') return 'text.primary';
                  return theme.palette[colorKey]?.main || 'text.primary';
                },
              }}
            >
              <MenuItem value="pending">Chờ xác nhận</MenuItem>
              <MenuItem value="confirmed">Đã xác nhận</MenuItem>
              <MenuItem value="preparing">Đang chuẩn bị</MenuItem>
              <MenuItem value="ready">Sẵn sàng</MenuItem>
              <MenuItem value="delivering">Đang giao</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="div">
                  Chi tiết đơn hàng
                </Typography>
                <PrintReceipt order={order as unknown as OrderDetail} variant="button" />
              </Box>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.products?.name}
                        {item.note && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Ghi chú: {item.note}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {order.delivery_address && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Địa chỉ giao hàng:
                        </Typography>
                        <Typography variant="body2">{order.delivery_address}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {order.note && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'bold', color: 'error.main' }}
                        >
                          Ghi chú đơn hàng:
                        </Typography>
                        <Typography variant="body2">{order.note}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const OrderTable = ({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange: (id: string, status: Order['status']) => void;
}) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Mã đơn</TableCell>
            <TableCell>Khách hàng</TableCell>
            <TableCell align="right">Tổng tiền</TableCell>
            <TableCell>Ngày tạo</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
