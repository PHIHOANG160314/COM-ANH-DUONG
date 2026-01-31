import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { useDailyMenu } from '../api/use-menu';

interface CategoryCardProps {
  icon: string;
  name: string;
  onClick?: () => void;
}

const CategoryCard = ({ icon, name, onClick }: CategoryCardProps) => (
  <Card
    sx={{
      height: 200,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    <CardActionArea
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h1" sx={{ fontSize: '64px', lineHeight: 1 }}>
          {icon}
        </Typography>
        <Typography variant="h6" component="div" fontWeight="bold">
          {name}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

interface FeaturedItemProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

const FeaturedItemCard = ({ name, price, imageUrl, description }: FeaturedItemProps) => (
  <Card
    sx={{
      height: 320,
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    {imageUrl ? (
      <CardMedia
        component="img"
        image={imageUrl}
        alt={name}
        sx={{
          height: 200,
          objectFit: 'cover',
        }}
      />
    ) : (
      <CardMedia
        component="div"
        sx={{
          height: 200,
          backgroundColor: 'primary.main',
        }}
      />
    )}
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
      <Typography variant="h6" component="div" fontWeight="bold">
        {name}
      </Typography>
      <Typography variant="body1" color="success.main" fontWeight={600}>
        {price.toLocaleString('vi-VN')}đ
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const MenuShowcase = () => {
  const { data: products = [], isLoading: productsLoading, error } = useDailyMenu();

  const featuredProducts = products.slice(0, 6);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 8, md: 10 },
          px: { xs: 3, md: 15 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4.5rem' }, fontWeight: 700 }}>
            Cơm Ánh Dương
          </Typography>
          <Typography
            variant="h4"
            color="warning.main"
            sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}
          >
            Hương Vị Quê Hương
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Cơm nhà mẹ nấu - Giao nhanh trong 30 phút tại Sa Đéc
          </Typography>
        </Box>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 6 }}>
          Danh Mục Món Ăn
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CategoryCard icon="🍚" name="Cơm" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CategoryCard icon="🍖" name="Món Chính" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CategoryCard icon="🥤" name="Đồ Uống" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CategoryCard icon="🍰" name="Tráng Miệng" />
          </Grid>
        </Grid>
      </Container>

      {/* Featured Items Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 6 }}>
          Món Nổi Bật
        </Typography>
        <Grid container spacing={4}>
          {error ? (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" sx={{ mb: 4 }}>
                Không thể tải danh sách món ăn. Vui lòng thử lại sau.
              </Alert>
            </Grid>
          ) : productsLoading ? (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
                Đang tải món ăn...
              </Typography>
            </Grid>
          ) : (
            featuredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <FeaturedItemCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url || undefined}
                  description={product.description || undefined}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Daily Specials Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
          color: 'white',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 8, md: 10 },
          px: { xs: 3, md: 15 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight={700}
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            🎉 Ưu Đãi Hôm Nay
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Giảm 20% cho đơn đầu tiên - Mã: SADEC20
          </Typography>
        </Box>
      </Paper>

      {/* Order CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 12 }, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              width: { xs: '100%', sm: 400 },
              height: 64,
              fontSize: '1.5rem',
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Đặt Cơm Ngay
          </Button>
          <Typography variant="body1" color="text.secondary">
            Giao nhanh 30 phút • Freeship &gt;50k
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'grey.100',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 8, md: 10 },
          px: { xs: 3, md: 15 },
        }}
      >
        <Typography variant="body1" color="text.secondary">
          📞 [SỐ HOTLINE] • 📍 Sa Đéc, Đồng Tháp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ⏰ T2-T7: 10h-14h, 17h-20h | CN: 10h-20h
        </Typography>
        <Typography variant="body2" color="text.secondary">
          © 2026 Cơm Ánh Dương - Hương vị quê hương
        </Typography>
      </Paper>
    </Box>
  );
};
