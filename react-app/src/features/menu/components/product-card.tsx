import { Card, CardMedia, CardContent, Typography, CardActions, Box, Chip } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { AppButton } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/formatters';
import { useToast } from '@/shared/ui/toast-notification';
import { useHaptic } from '@/shared/hooks/use-haptic';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);
  const { showToast } = useToast();
  const { trigger } = useHaptic();

  useEffect(() => {
    // Lazy load image using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageSrc) {
            setImageSrc(product.image_url || '/placeholder-food.png');
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

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [product.image_url, imageSrc]);

  const handleAddToCart = () => {
    onAdd(product);
    trigger('light'); // Haptic feedback
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success', 2000);
  };

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
        {imageSrc && (
          <CardMedia
            component="img"
            height="160"
            image={imageSrc}
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            sx={{
              objectFit: 'cover',
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
        {!isImageLoaded && (
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
      </Box>
      {product.is_sold_out && (
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
          disabled={product.is_sold_out}
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </AppButton>
      </CardActions>
    </Card>
  );
};
