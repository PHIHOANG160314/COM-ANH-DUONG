import { useState } from 'react';
import { Typography, TextField, Button, Paper, Stack } from '@mui/material';
import { LocalDining } from '@mui/icons-material';

export const QuickOrderForm = () => {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    // Vietnamese phone format: 10 digits starting with 0
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setAddressError('');

    // Validation
    const cleanPhone = phone.replace(/\s/g, '');
    let hasError = false;

    if (!validatePhone(cleanPhone)) {
      setPhoneError('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số (ví dụ: 0987654321)');
      hasError = true;
    }

    if (!address.trim()) {
      setAddressError('Vui lòng nhập địa chỉ giao hàng');
      hasError = true;
    }

    if (hasError) return;

    // Create order object
    const order = {
      phone: cleanPhone,
      address: address.trim(),
      timestamp: new Date().toISOString(),
      source: 'hero_quick_order_form',
    };

    // Console log for debugging
    console.log('🍚 Quick Order Received:', order);

    // Show thank you message
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setPhone('');
      setAddress('');
    }, 3000);
  };

  if (submitted) {
    return (
      <Paper
        sx={{
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
          ✅ Cảm ơn bạn!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chúng tôi sẽ gọi lại xác nhận đơn hàng trong vài phút
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 3, md: 4 },
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }}
    >
      <Typography variant="h6" fontWeight="bold" align="center" color="text.primary" sx={{ mb: 3 }}>
        ⚡ Đặt hàng nhanh - Giao trong 30 phút
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {/* Phone Number */}
        <TextField
          label="Số điện thoại *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          required
          variant="outlined"
          placeholder="0987 654 321"
          error={!!phoneError}
          helperText={phoneError}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              '&:hover fieldset': { borderColor: '#4ade80' },
              '&.Mui-focused fieldset': { borderColor: '#4ade80' },
            },
          }}
        />

        {/* Delivery Address */}
        <TextField
          label="Địa chỉ giao hàng *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          required
          multiline
          rows={1}
          variant="outlined"
          placeholder="Số nhà, đường, phường/xã"
          error={!!addressError}
          helperText={addressError}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              '&:hover fieldset': { borderColor: '#4ade80' },
              '&.Mui-focused fieldset': { borderColor: '#4ade80' },
            },
          }}
        />
      </Stack>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        startIcon={<LocalDining />}
        sx={{
          bgcolor: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '1rem', md: '1.1rem' },
          py: 1.5,
          minHeight: 56,
          boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          '&:hover': {
            bgcolor: '#059669',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(16,185,129,0.5)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        🔥 ĐẶT NGAY - GIAO TRONG 30 PHÚT
      </Button>

      {/* Trust Badge */}
      <Typography
        variant="caption"
        align="center"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 2,
          fontSize: '0.75rem',
        }}
      >
        🔒 Thông tin của bạn được bảo mật
      </Typography>
    </Paper>
  );
};
