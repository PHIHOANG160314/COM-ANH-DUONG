import { Grid, Typography, Box, CircularProgress, Pagination, Stack } from '@mui/material';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ProductCard } from './product-card';
import { useDailyMenu, useCategories } from '../api/use-menu';
import { useCartStore } from '@/features/cart/model/cart-store';
import { MenuSkeleton } from './menu-skeleton';
import { CategoryChips } from './category-chips';
import { usePullToRefresh } from '../hooks/use-pull-to-refresh';

const ITEMS_PER_PAGE = 16; // Optimized for mobile (4x4 grid on desktop, 2x8 on mobile)

export const MenuGrid = () => {
  const { data: products, isLoading: loadingProducts, refetch } = useDailyMenu();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

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

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Scroll to top when page changes
  useEffect(() => {
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when category changes
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
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

      {/* Scroll anchor for pagination */}
      <div ref={gridTopRef} style={{ scrollMarginTop: '80px' }} />

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

      {/* Items count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredProducts.length > 0
            ? `Hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredProducts.length
              )} / ${filteredProducts.length} món`
            : 'Không có món nào'}
        </Typography>
        {totalPages > 1 && (
          <Typography variant="body2" color="text.secondary">
            Trang {currentPage}/{totalPages}
          </Typography>
        )}
      </Box>

      <Grid container spacing={2}>
        {paginatedProducts.map((product) => (
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={product.id}>
            <ProductCard product={product} onAdd={(p) => addItem(p)} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              display: 'flex',
              justifyContent: 'center',
              '& .MuiPaginationItem-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
};
