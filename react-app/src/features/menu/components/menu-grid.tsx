import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useState, useMemo } from 'react';
import { ProductCard } from './product-card';
import { useDailyMenu, useCategories } from '../api/use-menu';
import { useCartStore } from '@/features/cart/model/cart-store';
import { MenuSkeleton } from './menu-skeleton';
import { CategoryChips } from './category-chips';
import { usePullToRefresh } from '../hooks/use-pull-to-refresh';

export const MenuGrid = () => {
  const { data: products, isLoading: loadingProducts, refetch } = useDailyMenu();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Pull-to-refresh
  const { isPulling, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    threshold: 80,
    enabled: true,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  if (loadingProducts || loadingCategories) {
    return <MenuSkeleton count={6} />;
  }

  if (!products?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: '#666' }}>
          Hôm nay chưa có thực đơn. Vui lòng quay lại sau!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <Box
          sx={{
            position: 'fixed',
            top: Math.min(pullDistance, 60),
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            transition: isRefreshing ? 'top 0.3s ease' : 'none',
          }}
        >
          <CircularProgress
            size={40}
            sx={{
              opacity: isRefreshing ? 1 : pullDistance / 80,
            }}
          />
        </Box>
      )}

      {/* Category chips - horizontal scroll */}
      <CategoryChips
        categories={categories?.map((cat) => cat.name) || []}
        selectedCategory={selectedCategory}
        onCategorySelect={(category) => {
          if (category === 'all') {
            handleCategorySelect('all');
          } else {
            // Find category ID by name
            const cat = categories?.find((c) => c.name === category);
            if (cat) {
              handleCategorySelect(cat.id);
            }
          }
        }}
      />

      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
            <ProductCard product={product} onAdd={(p) => addItem(p)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
