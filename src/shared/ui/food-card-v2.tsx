import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Box,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { AppButton } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/formatters';
import { useToast } from '@/shared/ui/use-toast';
import { useHaptic } from '@/shared/hooks/use-haptic';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface FoodCardV2Props {
  product: Product;
  onAdd: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

/**
 * Enhanced food card component with dark mode support
 * - Uses MUI v6 theme tokens exclusively
 * - 44px minimum touch targets
 * - Vietnamese đồng formatting
 * - Optimized for mobile-first responsive design
 */
export const FoodCardV2 = ({
  product,
  onAdd,
  isFavorite = false,
  onToggleFavorite,
}: FoodCardV2Props) => {
  const theme = useTheme();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { showToast } = useToast();
  const { trigger } = useHaptic();

  useEffect(() => {
    // Lazy load image using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageSrc && product.image_url) {
            setImageSrc(product.image_url);
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before visible
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    const currentImageRef = imageRef.current;

    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [product.image_url, imageSrc]);

  const handleAddToCart = () => {
    onAdd(product);
    trigger('light'); // Haptic feedback
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success', 2000);
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
      trigger('light');
      showToast(
        isFavorite
          ? `Đã xóa "${product.name}" khỏi yêu thích`
          : `Đã thêm "${product.name}" vào yêu thích`,
        'success',
        2000
      );
    }
  };

  const stockQuantity = product.stock_quantity ?? 100; // NULL = unlimited/available
  const isLowStock = stockQuantity > 0 && stockQuantity < 10;
  const isOutOfStock = stockQuantity === 0 || product.is_sold_out;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.paper', // Theme-aware background
        transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box
        ref={imageRef}
        sx={{
          position: 'relative',
          height: 180, // Slightly taller for better visual impact
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {imageSrc && !imageError ? (
          <CardMedia
            component="img"
            height="180"
            image={imageSrc}
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setIsImageLoaded(false);
            }}
            sx={{
              objectFit: 'contain',
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        ) : (
          // Gradient placeholder with theme awareness
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)'
                : 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              opacity: 0.8,
            }}
          >
            🍽️
          </Box>
        )}
        {imageSrc && !imageError && !isImageLoaded && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Dark mode aware shimmer loading effect */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)'
                  : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' },
                },
              }}
            />
          </Box>
        )}
        {/* Favorite button - 44px minimum touch target */}
        {onToggleFavorite && (
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 44,
              minHeight: 44,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s',
            }}
          >
            {isFavorite ? (
              <Favorite sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorder sx={{ color: 'text.secondary' }} />
            )}
          </IconButton>
        )}
        {/* Low stock badge - theme aware */}
        {isLowStock && (
          <Chip
            label={`Còn ${stockQuantity} phần`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'warning.main',
              color: theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.87)'
                : 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>
      {/* Out of stock overlay - theme aware */}
      {isOutOfStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Chip label="Hết món" color="error" size="medium" />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'text.primary', // Explicit theme token
          }}
        >
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
            }}
          >
            {product.description}
          </Typography>
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main', // Theme token for price
          }}
        >
          {formatCurrency(product.price)}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <AppButton
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          sx={{
            minHeight: 48, // 48px touch target (exceeds 44px minimum)
            transition: 'transform 0.15s ease-in-out',
            '&:active:not(:disabled)': {
              transform: 'scale(0.95)', // Press animation
            },
          }}
        >
          {isOutOfStock ? 'Hết món' : 'Thêm vào giỏ'}
        </AppButton>
      </CardActions>
    </Card>
  );
};
