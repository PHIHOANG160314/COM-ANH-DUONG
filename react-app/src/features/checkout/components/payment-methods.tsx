import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Paper,
  Chip,
  useTheme,
} from '@mui/material';
import type { PaymentProvider } from '@/features/payment/api/payment-api';

interface PaymentMethodsProps {
  value: PaymentProvider;
  onChange: (value: PaymentProvider) => void;
  error?: string;
}

/**
 * Enhanced payment method selector with dark mode support
 * - COD prominently displayed with "Phổ biến" badge
 * - Uses MUI theme tokens exclusively
 * - 44px minimum touch targets for radio buttons
 */
export const PaymentMethods = ({ value, onChange, error }: PaymentMethodsProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Phương thức thanh toán
      </Typography>
      <Paper sx={{ p: 2 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <RadioGroup value={value} onChange={(e) => onChange(e.target.value as PaymentProvider)}>
            {/* COD - Primary payment method with prominent badge */}
            <FormControlLabel
              value="cash"
              control={<Radio sx={{ minWidth: 44, minHeight: 44 }} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body1" fontWeight="medium">
                    💵 Tiền mặt khi nhận hàng (COD)
                  </Typography>
                  <Chip
                    label="Phổ biến"
                    size="small"
                    sx={{
                      bgcolor: 'success.main',
                      color: theme.palette.mode === 'dark'
                        ? 'rgba(0,0,0,0.87)'
                        : 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              }
              sx={{
                mb: 1,
                p: 1.5,
                border: value === 'cash'
                  ? `2px solid ${theme.palette.success.main}`
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mx: 0,
                bgcolor: value === 'cash'
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(74, 222, 128, 0.1)' // success.main with opacity
                    : 'rgba(46, 125, 50, 0.05)' // success.dark with opacity
                  : 'transparent',
                transition: 'all 0.2s ease',
                minHeight: 48, // Ensure 48px touch target
                '&:hover': {
                  bgcolor: value === 'cash'
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(74, 222, 128, 0.15)'
                      : 'rgba(46, 125, 50, 0.08)'
                    : theme.palette.action.hover,
                },
              }}
            />
            {/* Bank Transfer - VNPay */}
            <FormControlLabel
              value="vnpay"
              control={<Radio sx={{ minWidth: 44, minHeight: 44 }} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Thanh toán qua VNPay
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (ATM / Visa / Mastercard / QR)
                  </Typography>
                </Box>
              }
              sx={{
                mb: 1,
                p: 1.5,
                border: value === 'vnpay'
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mx: 0,
                bgcolor: value === 'vnpay'
                  ? theme.palette.action.selected
                  : 'transparent',
                transition: 'all 0.2s ease',
                minHeight: 48,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            />
            {/* MoMo Wallet */}
            <FormControlLabel
              value="momo"
              control={<Radio sx={{ minWidth: 44, minHeight: 44 }} />}
              label={
                <Typography variant="body1" fontWeight="medium">
                  Ví MoMo
                </Typography>
              }
              sx={{
                p: 1.5,
                border: value === 'momo'
                  ? `2px solid ${theme.palette.primary.main}`
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mx: 0,
                bgcolor: value === 'momo'
                  ? theme.palette.action.selected
                  : 'transparent',
                transition: 'all 0.2s ease',
                minHeight: 48,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            />
          </RadioGroup>
          {error && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </FormControl>
      </Paper>
    </Box>
  );
};
