import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Checkbox,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListSubheader,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { useAdminDailyMenu } from './use-admin-daily-menu';

export const DailyMenuPlanner = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs().add(1, 'day')); // Default to tomorrow
  const { products, dailyMenu, isLoading, toggleProduct, copyMenu } = useAdminDailyMenu(
    selectedDate ? selectedDate.toISOString() : ''
  );

  const [copySourceDate, setCopySourceDate] = useState<Dayjs | null>(dayjs());

  if (!selectedDate) return null;

  // Group products by category
  const groupedProducts = products?.reduce(
    (acc, product) => {
      // Handle potential array or object for categories relation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categories = product.categories as any;
      const categoryName = Array.isArray(categories)
        ? categories[0]?.name
        : categories?.name || 'Khác';

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    },
    {} as Record<string, typeof products>
  );

  const isSelected = (productId: string) => {
    return dailyMenu?.some((item) => item.product_id === productId && item.is_active);
  };

  const handleToggle = (productId: string) => {
    const currentStatus = isSelected(productId);
    toggleProduct.mutate({ productId, isActive: !currentStatus });
  };

  const handleCopy = () => {
    if (!copySourceDate) return;
    if (
      window.confirm(
        `Bạn muốn sao chép thực đơn từ ${copySourceDate.format('DD/MM/YYYY')} sang ${selectedDate.format('DD/MM/YYYY')}? Thực đơn hiện tại của ngày đích sẽ bị thay thế.`
      )
    ) {
      copyMenu.mutate(copySourceDate.toISOString());
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Chọn ngày lên thực đơn
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày áp dụng"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Sao chép từ ngày khác
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Ngày nguồn"
                  value={copySourceDate}
                  onChange={(newValue) => setCopySourceDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopy}
                disabled={copyMenu.isPending}
              >
                Sao chép
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <Typography variant="h6">
              Danh sách món ăn cho ngày {selectedDate.format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="caption">
              Chọn các món sẽ mở bán trong ngày này. Thay đổi được lưu tự động.
            </Typography>
          </Box>

          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {groupedProducts &&
              Object.entries(groupedProducts).map(([category, items]) => (
                <List
                  key={category}
                  subheader={
                    <ListSubheader sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
                      {category}
                    </ListSubheader>
                  }
                >
                  {items.map((product) => {
                    const checked = isSelected(product.id);
                    return (
                      <ListItem key={product.id} divider>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={checked}
                            onChange={() => handleToggle(product.id)}
                            disabled={toggleProduct.isPending}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={product.name}
                          secondary={
                            checked ? (
                              <Typography variant="caption" color="success.main" fontWeight="bold">
                                Đang mở bán
                              </Typography>
                            ) : null
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ))}

            {(!groupedProducts || Object.keys(groupedProducts).length === 0) && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Chưa có món ăn nào trong hệ thống.</Typography>
                <Button href="/admin/products" sx={{ mt: 1 }}>
                  Quản lý sản phẩm
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};
