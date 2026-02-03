import { Card, CardMedia, CardContent, Typography, CardActions, Box, Chip, IconButton } from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { AppButton } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/formatters';
import { useToast } from '@/shared/ui/use-toast';
import { useHaptic } from '@/shared/hooks/use-haptic';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductCard = ({ product, onAdd, isFavorite = false, onToggleFavorite }: ProductCardProps) => {
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
        isFavorite ? `Đã xóa "${product.name}" khỏi yêu thích` : `Đã thêm "${product.name}" vào yêu thích`,
        'success',
        2000
      );
    }
  };

  const stockQuantity = product.stock_quantity ?? 0;
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
      }}
    >
      <Box
        ref={imageRef}
        sx={{
          position: 'relative',
          height: 160,
          bgcolor: 'rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {imageSrc && !imageError ? (
          <CardMedia
            component="img"
            height="160"
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
          // Gradient placeholder when no image or image fails to load
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
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
              bgcolor: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Blur placeholder effect */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
        {/* Favorite button - top right */}
        {onToggleFavorite && (
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s',
            }}
          >
            {isFavorite ? (
              <Favorite sx={{ color: '#ef4444' }} />
            ) : (
              <FavoriteBorder sx={{ color: '#666' }} />
            )}
          </IconButton>
        )}
        {/* Stock quantity badge - top left */}
        {isLowStock && (
          <Chip
            label={`Còn ${stockQuantity} phần`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: '#fbbf24',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>
      {isOutOfStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
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
          sx={{ fontSize: '1rem', fontWeight: 600 }}
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
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
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
        >
          {isOutOfStock ? 'Hết món' : 'Thêm vào giỏ'}
        </AppButton>
      </CardActions>
    </Card>
  );
};
