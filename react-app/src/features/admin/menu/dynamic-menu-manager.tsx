import { useState, useMemo } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,

  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useDailyMenu, useAllMenuItems, useCategories } from '@/features/menu/api/use-menu';
import { useUpdateDailyMenu } from './api/use-daily-menu-mutation';
import { formatCurrency } from '@/shared/lib/formatters';





export const DynamicMenuManager = () => {
  // 1. Fetch ALL products (base list)
  const { data: allProducts, isLoading: loadingProducts } = useAllMenuItems();
  const { data: categories } = useCategories(); // Fetch categories for filter

  // 2. Fetch TODAY's selected products (active list)
  const { data: dailyProducts, isLoading: loadingDaily } = useDailyMenu();

  // 3. Mutation hook
  const { mutate: updateDailyMenu, isPending: isUpdating } = useUpdateDailyMenu();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

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

  // Filter logic
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    return allProducts.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'all' || product.category_id?.toString() === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [allProducts, searchTerm, filterCategory]);

  // Pagination on FILTERED results
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

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
        <Typography variant="body2" color="text.secondary" gutterBottom>
          💡 <strong>Hướng dẫn:</strong> Bật công tắc "Hôm nay" để đưa món lên trang chủ.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Tìm kiếm món ăn"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <TextField
            select
            label="Danh mục"
            size="small"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 150 }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </TextField>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          📊 Tổng số món: {allProducts?.length} | Kết quả tìm kiếm: {filteredProducts.length}
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
          count={filteredProducts.length}
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
