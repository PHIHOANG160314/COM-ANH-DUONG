import { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Phone, LocationOn, CheckCircle } from '@mui/icons-material';

interface ExpressOrderFormProps {
  onSuccess?: () => void;
}

/**
 * Express Quick Order Form
 * - Vietnamese phone validation: ^(\+84|0)[0-9]{9,10}$
 * - Address input with Vietnamese helper text
 * - "🔥 ĐẶT NGAY" button (48px height, full width)
 * - Success state with checkmark animation
 * - Store to localStorage on submit
 * - Theme-aware: MUI theme tokens only
 */
export const ExpressOrderForm = ({ onSuccess }: ExpressOrderFormProps) => {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const vietnamesePhoneRegex = /^(\+84|0)[0-9]{9,10}$/;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);

    if (value && !vietnamesePhoneRegex.test(value)) {
      setPhoneError('Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vietnamesePhoneRegex.test(phone)) {
      setPhoneError('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    if (!address.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store to localStorage
    const expressOrder = {
      phone,
      address,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('expressOrder', JSON.stringify(expressOrder));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setPhone('');
      setAddress('');
      setIsSuccess(false);
      onSuccess?.();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <CheckCircle
          sx={{
            fontSize: 64,
            color: 'success.main',
            animation: 'scaleIn 0.3s ease-out',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
          Đặt hàng thành công!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Chúng tôi sẽ liên hệ với bạn trong vài phút
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <TextField
        fullWidth
        required
        label="Số điện thoại"
        placeholder="0901234567"
        value={phone}
        onChange={handlePhoneChange}
        error={!!phoneError}
        helperText={phoneError || 'Nhập số điện thoại để nhận xác nhận đơn hàng'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiInputBase-root': {
            minHeight: 48, // A11y: 48px touch target
          },
        }}
      />

      <TextField
        fullWidth
        required
        multiline
        rows={2}
        label="Địa chỉ giao hàng"
        placeholder="VD: 123 Nguyễn Văn Linh, Phường 1, Quận 7, TP.HCM"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        helperText="Nhập địa chỉ chi tiết để giao hàng nhanh chóng"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
              <LocationOn sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting || !!phoneError || !phone || !address}
        sx={{
          height: 48, // A11y: 48px touch target
          fontSize: '1.1rem',
          fontWeight: 'bold',
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'action.disabled',
          },
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
        ) : (
          '🔥 ĐẶT NGAY'
        )}
      </Button>
    </Paper>
  );
};
