import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import { CONTACT_INFO } from '@/shared/config/contact';
import { MenuGrid } from './menu-grid'; // Import MenuGrid
import { useCategories } from '../api/use-menu';
import { useRef, useState, useMemo } from 'react';

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

export const MenuShowcase = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const menuGridRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategories();

  // Build a name→id lookup map from real categories
  const categoryIdByName = useMemo(() => {
    const map: Record<string, string> = {};
    if (categories) {
      for (const cat of categories) {
        map[cat.name] = cat.id;
      }
    }
    return map;
  }, [categories]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Scroll to menu grid
    if (menuGridRef.current) {
      menuGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: 300, md: 500 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 4, md: 8 },
          px: { xs: 3, md: 15 },
          bgcolor: 'background.default',
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
            Cơm nhà mẹ nấu - Giao nhanh trong 30 phút tại Phường Sa Đéc
          </Typography>
        </Box>
      </Box>

      {/* Categories Section - Now Interactive */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 6 }}>
          Danh Mục Món Ăn
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <CategoryCard
              icon="🍚"
              name="Cơm"
              onClick={() => handleCategoryClick(categoryIdByName['Cơm'] || 'all')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CategoryCard
              icon="🥤"
              name="Đồ Uống"
              onClick={() => handleCategoryClick(categoryIdByName['Đồ Uống'] || 'all')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CategoryCard
              icon="🍰"
              name="Tráng Miệng"
              onClick={() => handleCategoryClick(categoryIdByName['Tráng Miệng'] || 'all')}
            />
          </Grid>
        </Grid>
      </Container>


      {/* Daily Specials Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #006400 0%, #004d00 100%)',
          color: 'white',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          mb: 8,
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
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }}
          >
            🎉 Ưu Đãi Hôm Nay
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Giảm 20% cho đơn đầu tiên - Mã: SADEC20
          </Typography>
        </Box>
      </Paper>

      {/* Full Menu Grid */}
      <Container maxWidth="lg" sx={{ py: 4, mb: 10 }} ref={menuGridRef}>
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 4 }}>
          Thực Đơn Chi Tiết
        </Typography>

        {/* The interactive MenuGrid */}
        <MenuGrid
          selectedCategoryId={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </Container>

      {/* Order CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{
              width: { xs: '100%', sm: 400 },
              height: 64,
              fontSize: '1.5rem',
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: 3,
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
          bgcolor: 'background.paper',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          px: 3,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.primary }}>
          📞 {CONTACT_INFO.phone} • 📍 {CONTACT_INFO.address.short}
        </Typography>
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          ⏰ {CONTACT_INFO.hours}
        </Typography>
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          © 2026 Cơm Ánh Dương - Hương vị quê hương
        </Typography>
      </Paper>
    </Box>
  );
};
