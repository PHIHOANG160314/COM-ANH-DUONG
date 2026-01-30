import { Grid, Typography, Box, Tabs, Tab } from '@mui/material';
import { useState, useMemo } from 'react';
import { ProductCard } from './product-card';
import { useDailyMenu, useCategories } from '../api/use-menu';
import { useCartStore } from '@/features/cart/model/cart-store';
import { AppLoading } from '@/shared/ui';

export const MenuGrid = () => {
  const { data: products, isLoading: loadingProducts } = useDailyMenu();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  if (loadingProducts || loadingCategories) {
    return <AppLoading message="Đang tải thực đơn..." />;
  }

  if (!products?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Hôm nay chưa có thực đơn. Vui lòng quay lại sau!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="menu categories"
        >
          <Tab label="Tất cả" value="all" />
          {categories?.map((cat) => (
            <Tab key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Tabs>
      </Box>

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
