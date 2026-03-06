import { useState, useMemo, useRef } from 'react';
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
import { useImportMenuMutation } from './api/use-import-menu-mutation';
import { formatCurrency } from '@/shared/lib/formatters';
import { exportToExcel } from '@/shared/lib/excel-export';
import { importFromExcel } from '@/shared/lib/excel-import';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button } from '@mui/material';





export const DynamicMenuManager = () => {
  console.log('DynamicMenuManager loaded - Check for Import/Export Excel buttons');
  // 1. Fetch ALL products (base list)
  const { data: allProducts, isLoading: loadingProducts, refetch: refetchAll } = useAllMenuItems();
  const { data: categories } = useCategories(); // Fetch categories for filter

  // 2. Fetch TODAY's selected products (active list)
  const { data: dailyProducts, isLoading: loadingDaily } = useDailyMenu();

  // 3. Mutation hooks
  const { mutate: updateDailyMenu, isPending: isUpdating } = useUpdateDailyMenu();
  const importMutation = useImportMenuMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleFilterCategory = (categoryId: string) => {
    setFilterCategory(categoryId);
    setPage(0);
  };

  // File import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Helper to check if a product is in today's menu
  const isProductInDailyMenu = (productId: number) => {
    return dailyProducts?.some((p) => p.id === productId) ?? false;
  };

  const handleToggleDailyMenu = (productId: number, currentStatus: boolean) => {
    updateDailyMenu({
      productId: productId,
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

  const handleExportExcel = () => {
    if (!filteredProducts) return;

    const exportData = filteredProducts.map((p) => ({
      'Tên món': p.name,
      'Danh mục': p.categories?.name || 'N/A',
      'Giá': p.price,
      'Mô tả': p.description || '',
      'Trạng thái': p.is_active ? 'Đang bán' : 'Ngừng bán',
      'Còn hàng': p.is_sold_out ? 'Hết hàng' : 'Còn hàng',
    }));

    exportToExcel(exportData, 'Danh_Sach_Thuc_Don');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'info', message: 'Đang đọc file Excel...' });

    try {
      // 1. Read and parse file
      const parsedData = await importFromExcel(file);

      if (parsedData.length === 0) {
        setImportStatus({ type: 'error', message: 'File trống hoặc không đúng format (cần cột: Tên món ăn, Giá bán (VNĐ), Loại món)' });
        return;
      }

      setImportStatus({ type: 'info', message: `Đang xử lý ${parsedData.length} món. Vui lòng đợi...` });

      // 2. Perform DB upsert
      importMutation.mutate(parsedData, {
        onSuccess: (results: any) => {
          setImportStatus({
            type: 'success',
            message: `Nhập thành công! Đã thêm: ${results.added}, Cập nhật: ${results.updated}, Lỗi: ${results.failed}.`
          });

          // Force refetch to update table immediately
          refetchAll();

          // Clear file input so same file can be selected again
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err: any) => {
          setImportStatus({ type: 'error', message: `Lỗi khi lưu dữ liệu: ${err.message}` });
        }
      });

    } catch (err: any) {
      setImportStatus({ type: 'error', message: `Lỗi đọc file: ${err.message || 'Unknown error'}` });
    }
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
          💡 <strong>Hướng dẫn:</strong> Bật công tắc "Hôm nay" để đưa món lên trang chủ. File Excel mẫu gồm các cột: <b>Tên món ăn, Giá bán (VNĐ), Loại món</b>. Bạn có thể xuất Excel trước để xem mẫu.
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

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon sx={{ transform: 'rotate(180deg)' }} />}
            onClick={handleImportClick}
            disabled={importMutation.isPending}
            sx={{ height: 40 }}
          >
            {importMutation.isPending ? 'Đang tải...' : 'Nhập Excel'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ height: 40 }}
          >
            Xuất Excel
          </Button>

          <TextField
            select
            label="Danh mục"
            size="small"
            value={filterCategory}
            onChange={(e) => handleFilterCategory(e.target.value)}
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

        {isUpdating && <Alert severity="info" sx={{ mt: 1, py: 0 }}>Đang lưu thay đổi công tắc món hôm nay...</Alert>}

        {importStatus && (
          <Alert severity={importStatus.type} sx={{ mt: 2, py: 0 }} onClose={() => setImportStatus(null)}>
            {importStatus.message}
          </Alert>
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
                      color={filterCategory === product.category_id ? 'primary' : 'default'}
                      variant={filterCategory === product.category_id ? 'filled' : 'outlined'}
                      onClick={() => {
                        if (product.category_id) {
                          handleFilterCategory(
                            filterCategory === product.category_id ? 'all' : product.category_id
                          );
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
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
