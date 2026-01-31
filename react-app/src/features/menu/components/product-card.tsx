import { Card, CardMedia, CardContent, Typography, CardActions, Box, Chip } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { AppButton } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/formatters';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
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
      <CardMedia
        component="img"
        height="160"
        image={product.image_url || '/placeholder-food.png'} // Fallback image needed
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
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
            sx={{
              color: '#666',
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
          onClick={() => onAdd(product)}
        >
          Thêm vào giỏ
        </AppButton>
      </CardActions>
    </Card>
  );
};
