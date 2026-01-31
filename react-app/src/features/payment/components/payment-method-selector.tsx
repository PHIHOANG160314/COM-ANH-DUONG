import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Paper,
  Chip,
} from '@mui/material';
import type { PaymentProvider } from '../api/payment-api';

interface PaymentMethodSelectorProps {
  value: PaymentProvider;
  onChange: (value: PaymentProvider) => void;
  error?: string;
}

export const PaymentMethodSelector = ({ value, onChange, error }: PaymentMethodSelectorProps) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Phương thức thanh toán
      </Typography>
      <Paper sx={{ p: 2 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <RadioGroup value={value} onChange={(e) => onChange(e.target.value as PaymentProvider)}>
            <FormControlLabel
              value="cash"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    💵 Tiền mặt khi nhận hàng (COD)
                  </Typography>
                  <Chip label="Phổ biến" size="small" color="success" />
                </Box>
              }
              sx={{
                mb: 1,
                p: 1,
                border: value === 'cash' ? '2px solid #2e7d32' : '1px solid #eee',
                borderRadius: 1,
                mx: 0,
                bgcolor: value === 'cash' ? '#f1f8f4' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            />
            <FormControlLabel
              value="vnpay"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Thanh toán qua VNPay
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    (ATM / Visa / Mastercard / QR)
                  </Typography>
                </Box>
              }
              sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1, mx: 0 }}
            />
            <FormControlLabel
              value="momo"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Ví MoMo
                  </Typography>
                </Box>
              }
              sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, mx: 0 }}
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
