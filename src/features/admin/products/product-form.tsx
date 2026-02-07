import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product, Category } from './use-admin-products';

const productSchema = z.object({
  name: z.string().min(1, 'Tên món không được để trống'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  category_id: z.string().optional(),
  image_url: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  is_sold_out: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
  categories: Category[];
  isLoading?: boolean;
}

export const ProductForm = ({
  open,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading,
}: ProductFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      image_url: '',
      is_active: true,
      is_sold_out: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        category_id: initialData.category_id || '',
        image_url: initialData.image_url || '',
        is_active: initialData.is_active,
        is_sold_out: initialData.is_sold_out,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        image_url: '',
        is_active: true,
        is_sold_out: false,
      });
    }
  }, [initialData, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{initialData ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tên món"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Giá bán"
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select {...field} label="Danh mục">
                      <MenuItem value="">
                        <em>Chưa phân loại</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="image_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL hình ảnh"
                    fullWidth
                    error={!!errors.image_url}
                    helperText={errors.image_url?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mô tả"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Đang bán"
                    />
                  )}
                />

                <Controller
                  name="is_sold_out"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch checked={field.value} onChange={field.onChange} color="error" />
                      }
                      label="Hết hàng"
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {initialData ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
