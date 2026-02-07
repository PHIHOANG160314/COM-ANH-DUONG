import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Skeleton } from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';
import { useBestsellers, getBestsellerBadge } from '../api/use-bestseller';
import { useCartStore } from '@/features/cart/model/cart-store';

interface BestsellerCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    rank?: number;
  };
  onAdd?: () => void;
}

const BestsellerCard = ({ item, onAdd }: BestsellerCardProps) => {
  const badge = item.rank ? getBestsellerBadge(item.rank) : '🔥 Hot';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
      onClick={onAdd}
    >
      {/* Rank Badge */}
      <Chip
        label={badge}
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1,
          fontWeight: 'bold',
          bgcolor: item.rank && item.rank <= 3 ? 'warning.main' : 'error.main',
          color: 'white',
          boxShadow: 2,
        }}
      />

      {/* Image */}
      {item.image_url ? (
        <CardMedia
          component="img"
          image={item.image_url}
          alt={item.name}
          sx={{
            height: 140,
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 140,
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7c59f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocalFireDepartment sx={{ fontSize: 60, color: 'white', opacity: 0.8 }} />
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '2.6em',
          }}
        >
          {item.name}
        </Typography>
        <Typography variant="body1" color="success.main" fontWeight={600} sx={{ mt: 0.5 }}>
          {item.price.toLocaleString('vi-VN')}đ
        </Typography>
      </CardContent>
    </Card>
  );
};

const BestsellerSkeleton = () => (
  <Grid container spacing={2}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Grid>
    ))}
  </Grid>
);

export const BestsellerSection = () => {
  const { data: items, isLoading, error } = useBestsellers(6);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (item: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  }) => {
    // Create a minimal product object that satisfies the cart store
    const product = {
      id: item.id,
      category_id: null,
      name: item.name,
      description: null,
      price: item.price,
      image_url: item.image_url,
      is_active: true,
      is_sold_out: false,
      stock_quantity: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addItem(product, 1);
  };

  if (error) {
    return null; // Silently fail - don't break the page
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LocalFireDepartment sx={{ color: 'error.main' }} />
          Món Bán Chạy Nhất
        </Typography>
        <BestsellerSkeleton />
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LocalFireDepartment sx={{ color: 'error.main' }} />
          Món Bán Chạy Nhất
        </Typography>
        <Chip label="7 ngày qua" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
      </Box>

      {/* Bestseller Grid */}
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 6, sm: 4, md: 2 }}>
            <BestsellerCard item={item} onAdd={() => handleAddToCart(item)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
