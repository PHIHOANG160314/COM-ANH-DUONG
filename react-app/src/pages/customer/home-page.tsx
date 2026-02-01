import { useState } from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';
import { AdminPanelSettings, Restaurant, PointOfSale, DeliveryDining } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MenuGrid } from '@/features/menu/components/menu-grid';
import { CartSheet } from '@/features/cart/components/cart-sheet';
import { HeroSection } from '@/features/home/components/hero-section';
import { RegionalSpecialties } from '@/features/home/components/regional-specialties';
import { TrustSignals } from '@/features/home/components/trust-signals';
import { CustomerTestimonials } from '@/features/home/components/customer-testimonials';
import { UrgencyBanner } from '@/features/home/components/urgency-banner';
import { useAuth } from '@/features/auth/api/use-auth';

export const CustomerHomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  return (
    <>
      {/* Hero Banner */}
      <HeroSection />

      {/* Urgency Banner - CRO Element */}
      <UrgencyBanner />

      {/* Regional Specialties */}
      <RegionalSpecialties />

      {/* Trust Signals - CRO Element */}
      <TrustSignals />

      {/* Customer Testimonials - CRO Element */}
      <CustomerTestimonials />

      {/* Quick Access Links for Staff */}
      {isStaff && (
        <Box
          sx={{
            py: 3,
            mx: -3, // Negative margin to break out of Container padding
            px: 3, // Add back padding
          }}
        >
          <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚡ Truy cập nhanh
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold">
                    Quản trị
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/kitchen')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Restaurant sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold">
                    Bếp
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/pos')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PointOfSale sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold">
                    POS
                  </Typography>
                </CardContent>
              </Card>
              {user?.role === 'shipper' && (
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/delivery')}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <DeliveryDining sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="bold">
                      Giao hàng
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Menu Section */}
      <Box
        sx={{
          pb: 4,
          mx: -3, // Negative margin to break out of Container padding
          px: 3, // Add back padding
        }}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            🍽️ Thực đơn hôm nay
          </Typography>
          <MenuGrid />
        </Box>
      </Box>

      <CartSheet
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
      />
    </>
  );
};
