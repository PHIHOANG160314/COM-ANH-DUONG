import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  TextField,
  Chip,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { useDailyMenu } from '@/features/menu/api/use-menu';
import { formatCurrency } from '@/shared/lib/formatters';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductWithCategory = Product & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

interface ProductOverride {
  price?: number;
  is_active?: boolean;
  is_sold_out?: boolean;
}

const STORAGE_KEY = 'admin-menu-overrides';

export const DynamicMenuManager = () => {
  const { data: productsData, isLoading } = useDailyMenu();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Load overrides from localStorage on mount (lazy initialization)
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored overrides:', e);
        return {};
      }
    }
    return {};
  });

  // Save overrides to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(overrides).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    }
  }, [overrides]);

  // Apply overrides to products
  const products: ProductWithCategory[] = (productsData || []).map((product) => {
    const override = overrides[product.id];
    if (!override) return product;

    return {
      ...product,
      price: override.price ?? product.price,
      is_active: override.is_active ?? product.is_active,
      is_sold_out: override.is_sold_out ?? product.is_sold_out,
    };
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleActive = (productId: string, currentStatus: boolean) => {
    setOverrides((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        is_active: !currentStatus,
      },
    }));
  };

  const handleToggleSoldOut = (productId: string, currentStatus: boolean) => {
    setOverrides((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        is_sold_out: !currentStatus,
      },
    }));
  };

  const handleEditPrice = (productId: string, currentPrice: number) => {
    setEditingPrice(productId);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (productId: string) => {
    const newPrice = parseInt(tempPrice, 10);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Giá không hợp lệ');
      setEditingPrice(null);
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: newPrice,
      },
    }));
    setEditingPrice(null);
  };

  const handlePriceKeyPress = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') {
      handleSavePrice(productId);
    } else if (e.key === 'Escape') {
      setEditingPrice(null);
    }
  };

  // Pagination
  const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Hướng dẫn:</strong> Click vào giá để chỉnh sửa. Bật/tắt trạng thái bằng switch.
          Tất cả thay đổi được lưu tự động vào LocalStorage.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          📊 Tổng số món: {products.length} | Đang hiển thị: {paginatedProducts.length}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Món ăn</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Danh mục</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                Giá
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Trạng thái
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Hết món
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  opacity: product.is_active ? 1 : 0.5,
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="caption" color="text.secondary">
                        {product.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.categories?.name || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  {editingPrice === product.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        onKeyDown={(e) => handlePriceKeyPress(e, product.id)}
                        onBlur={() => handleSavePrice(product.id)}
                        autoFocus
                        sx={{ width: 120 }}
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSavePrice(product.id)}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(product.price)}
                      </Typography>
                      <Tooltip title="Sửa giá">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPrice(product.id, product.price)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={product.is_active ? 'Đang bán' : 'Đã tắt'}>
                    <Switch
                      checked={product.is_active}
                      onChange={() => handleToggleActive(product.id, product.is_active)}
                      color="success"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={product.is_sold_out ? 'Đã hết' : 'Còn món'}>
                    <Switch
                      checked={product.is_sold_out}
                      onChange={() => handleToggleSoldOut(product.id, product.is_sold_out)}
                      color="error"
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[12, 24, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>
    </Box>
  );
};
