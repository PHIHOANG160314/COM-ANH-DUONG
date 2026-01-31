import { useState } from 'react';
import { Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAdminProducts } from '@/features/admin/products/use-admin-products';
import { ProductTable } from '@/features/admin/products/product-table';
import { ProductForm } from '@/features/admin/products/product-form';
import type { Product } from '@/features/admin/products/use-admin-products';
import { Debug } from '@/shared/utils/debug';

export const AdminProductsPage = () => {
  const { products, categories, isLoading, createProduct, updateProduct, deleteProduct } =
    useAdminProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này không?')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        Debug.error('Failed to delete product', error);
        alert('Không thể xóa món ăn này (có thể đã có đơn hàng liên quan).');
      }
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    price: number;
    is_active: boolean;
    is_sold_out: boolean;
    description?: string;
    category_id?: string;
    image_url?: string;
  }) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      Debug.error('Failed to save product', error);
      alert('Có lỗi xảy ra khi lưu món ăn.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Quản lý sản phẩm</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Thêm món mới
        </Button>
      </Box>

      {!products || products.length === 0 ? (
        <Alert severity="info">Chưa có sản phẩm nào.</Alert>
      ) : (
        <ProductTable products={products} onEdit={handleEditClick} onDelete={handleDeleteClick} />
      )}

      <ProductForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories || []}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />
    </Box>
  );
};
