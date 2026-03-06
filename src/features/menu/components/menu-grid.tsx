import { Grid, Typography, Box, Pagination, Stack } from '@mui/material';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ProductCard } from './product-card';
import { useAllMenuItems, useCategories, useDailyMenu } from '../api/use-menu';
import { useFavorites, useToggleFavorite } from '../api/use-favorites';
import { useCartStore } from '@/features/cart/model/cart-store';
import { MenuSkeleton } from './menu-skeleton';
import { CategoryChips } from './category-chips';

const ITEMS_PER_PAGE = 16; // Optimized for mobile (4x4 grid on desktop, 2x8 on mobile)
const ALLOWED_DISPLAY_CATEGORIES = ['Cơm', 'Đồ Uống', 'Tráng Miệng'];

export interface MenuGridProps {
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  mode?: 'all' | 'daily';
}

export const MenuGrid = ({ selectedCategoryId, onCategoryChange, mode = 'all' }: MenuGridProps) => {
  const { data: allProducts, isLoading: loadingAll } = useAllMenuItems();
  const { data: dailyProducts, isLoading: loadingDaily } = useDailyMenu();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const products = mode === 'daily' ? dailyProducts : allProducts;
  const loadingProducts = mode === 'daily' ? loadingDaily : loadingAll;

  const { data: favorites } = useFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const addItem = useCartStore((state) => state.addItem);

  // Internal state if no props provided
  const [internalCategory, setInternalCategory] = useState<string>('all');
  const activeCategory = selectedCategoryId ?? internalCategory;

  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);


  const displayCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => ALLOWED_DISPLAY_CATEGORIES.includes(c.name));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // No longer filtering out hidden categories — show all products
    const visibleProducts = products;

    if (activeCategory === 'all') return visibleProducts;

    return visibleProducts.filter((p) => {
      // 1. Direct category match
      if (p.category_id === activeCategory) return true;

      // 2. Parent category match (e.g. active is "Thức Ăn", product is "Món Nhà")
      if (p.categories?.parent_id === activeCategory) return true;

      return false;
    });
  }, [products, activeCategory]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Scroll to top when page changes
  useEffect(() => {
    if (gridTopRef.current && currentPage > 1) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handleCategorySelect = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalCategory(category);
    }
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
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Hôm nay chưa có thực đơn. Vui lòng quay lại sau!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Scroll anchor for pagination */}
      <div ref={gridTopRef} style={{ scrollMarginTop: '80px' }} />

      {/* Category chips - horizontal scroll */}
      <CategoryChips
        categories={displayCategories.map((cat) => cat.name) || []}
        selectedCategory={activeCategory}
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
        {paginatedProducts.map((product) => {
          const isFavorite =
            favorites?.some((fav) => fav.menu_item_id === product.id) ?? false;

          return (
            <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <ProductCard
                product={product}
                onAdd={(p) => addItem(p)}
                isFavorite={isFavorite}
                onToggleFavorite={(productId) => toggleFavorite(productId)}
              />
            </Grid>
          );
        })}
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
