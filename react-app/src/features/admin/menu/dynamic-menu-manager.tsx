import { useState, useMemo } from 'react';
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
  Chip,
  TablePagination,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDailyMenu, useAllMenuItems } from '@/features/menu/api/use-menu';
import { useUpdateDailyMenu } from './api/use-daily-menu-mutation';
import { formatCurrency } from '@/shared/lib/formatters';





export const DynamicMenuManager = () => {
  // 1. Fetch ALL products (base list)
  const { data: allProducts, isLoading: loadingProducts } = useAllMenuItems();

  // 2. Fetch TODAY's selected products (active list)
  const { data: dailyProducts, isLoading: loadingDaily } = useDailyMenu();

  // 3. Mutation hook
  const { mutate: updateDailyMenu, isPending: isUpdating } = useUpdateDailyMenu();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Helper to check if a product is in today's menu
  const isProductInDailyMenu = (productId: string) => {
    return dailyProducts?.some((p) => p.id === productId) ?? false;
  };

  const handleToggleDailyMenu = (productId: string, currentStatus: boolean) => {
    updateDailyMenu({
      productId: parseInt(productId),
      isActive: !currentStatus
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination
  const paginatedProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [allProducts, page, rowsPerPage]);

  if (loadingProducts || loadingDaily) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Hướng dẫn:</strong> Bật công tắc "Hôm nay" để đưa món lên trang chủ.
          Dữ liệu được lưu trực tiếp vào Database và hiển thị ngay lập tức cho khách hàng.
        </Typography>
        {isUpdating && (
          <Alert severity="info" sx={{ mt: 1, py: 0 }}>Đang lưu thay đổi...</Alert>
        )}
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
                Hôm nay ?
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => {
              const isActiveToday = isProductInDailyMenu(product.id);

              return (
                <TableRow
                  key={product.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: isActiveToday ? 'rgba(74, 222, 128, 0.08)' : 'inherit', // Light green highlight if active
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
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(product.price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={isActiveToday ? 'Đang hiện trang chủ' : 'Đang ẩn'}>
                      <Switch
                        checked={isActiveToday}
                        onChange={() => handleToggleDailyMenu(product.id, isActiveToday)}
                        color="success"
                        disabled={isUpdating}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[12, 24, 50, 100]}
          component="div"
          count={allProducts?.length || 0}
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
