import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency } from '@/shared/lib/formatters';
import type { Product } from './use-admin-products';

interface ProductTableProps {
  products: (Product & { categories: { name: string } | null })[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="product table">
        <TableHead>
          <TableRow>
            <TableCell>Hình ảnh</TableCell>
            <TableCell>Tên món</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell align="right">Giá</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="right">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                <Avatar
                  src={product.image_url || undefined}
                  alt={product.name}
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                >
                  {!product.image_url && product.name.charAt(0)}
                </Avatar>
              </TableCell>
              <TableCell>
                <Box sx={{ fontWeight: 'bold' }}>{product.name}</Box>
                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {product.description?.slice(0, 50)}
                  {product.description && product.description.length > 50 ? '...' : ''}
                </Box>
              </TableCell>
              <TableCell>{product.categories?.name || 'Chưa phân loại'}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell align="center">
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}
                >
                  <Chip
                    label={product.is_active ? 'Đang bán' : 'Ngừng bán'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                  {product.is_sold_out && <Chip label="Hết hàng" color="error" size="small" />}
                </Box>
              </TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => onEdit(product)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(product.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
