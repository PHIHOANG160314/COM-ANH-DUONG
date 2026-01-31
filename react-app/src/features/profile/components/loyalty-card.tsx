import { Box, Card, CardContent, Typography, LinearProgress, Chip, Grid } from '@mui/material';
import { Star, TrendingUp, CardGiftcard } from '@mui/icons-material';
import { formatCurrency } from '@/shared/lib/formatters';
import type { LoyaltyStats } from '../api/loyalty-api';

interface LoyaltyCardProps {
  stats: LoyaltyStats;
}

export const LoyaltyCard = ({ stats }: LoyaltyCardProps) => {
  return (
    <Card
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Star sx={{ color: '#FFD700' }} />
              <Typography variant="h6" fontWeight="bold">
                Thành Viên {stats.tier}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
              Tích lũy chi tiêu: {formatCurrency(stats.totalSpent)}
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Tiến trình thăng hạng
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.nextTierProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mt: 0.5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#FFD700',
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                p: 2,
                borderRadius: 3,
                display: 'inline-block',
                minWidth: 120,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Điểm tích lũy
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#FFD700' }}>
                {stats.points}
              </Typography>
              <Typography variant="caption">điểm</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUp sx={{ color: 'white !important' }} />}
            label="Tích điểm 5-10%"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
            }}
          />
          <Chip
            icon={<CardGiftcard sx={{ color: 'white !important' }} />}
            label="Quà sinh nhật"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
