import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, CheckCircle } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

/**
 * Lead Capture Popup - P1 Optimization
 * Captures phone numbers with 10% discount offer
 */
export const LeadCapturePopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  // Check if user has already seen/dismissed popup
  const STORAGE_KEY = 'lead_capture_dismissed';
  const hasSeenPopup = sessionStorage.getItem(STORAGE_KEY) === 'true';

  // Show popup after 5 seconds on homepage
  useEffect(() => {
    if (hasSeenPopup || location.pathname !== '/') return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [hasSeenPopup, location.pathname]);

  // Exit-intent detection (desktop only)
  useEffect(() => {
    if (hasSeenPopup || location.pathname !== '/') return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving viewport from top (exit intent)
      if (e.clientY <= 0 && !open) {
        setOpen(true);
      }
    };

    // Only on desktop (screen width > 768px)
    if (window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [hasSeenPopup, location.pathname, open]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  const validatePhone = (phoneNumber: string): boolean => {
    // Vietnamese phone format: 10 digits starting with 0
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '');

    if (!validatePhone(cleanPhone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số (ví dụ: 0987654321)');
      return;
    }

    // Store lead to localStorage
    const lead = {
      name: name.trim() || 'Khách hàng',
      phone: cleanPhone,
      timestamp: new Date().toISOString(),
      source: 'popup_10_percent_offer',
    };

    // Save to localStorage
    const existingLeads = JSON.parse(localStorage.getItem('captured_leads') || '[]');
    existingLeads.push(lead);
    localStorage.setItem('captured_leads', JSON.stringify(existingLeads));

    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'warning.light',
          overflow: 'visible',
          position: 'relative',
          m: 2,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'warning.dark',
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {!submitted ? (
          <Box component="form" onSubmit={handleSubmit}>
            {/* Headline */}
            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              sx={{
                color: 'warning.dark',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              🎁 GIẢM 10% CHO ĐƠN ĐẦU TIÊN!
            </Typography>

            {/* Subtext */}
            <Typography
              variant="body1"
              align="center"
              sx={{ color: 'text.secondary', mb: 3, fontSize: '1rem' }}
            >
              Để lại số điện thoại để nhận mã giảm giá
            </Typography>

            {/* Form Fields */}
            <Stack spacing={2}>
              {/* Name (optional) */}
              <TextField
                label="Họ và tên (không bắt buộc)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'warning.main' },
                    '&.Mui-focused fieldset': { borderColor: 'warning.main' },
                  },
                }}
              />

              {/* Phone (required) */}
              <TextField
                label="Số điện thoại *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                variant="outlined"
                placeholder="0987 654 321"
                error={!!error}
                helperText={error}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'warning.main' },
                    '&.Mui-focused fieldset': { borderColor: 'warning.main' },
                  },
                }}
              />

              {/* CTA Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'success.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                🎉 NHẬN NGAY ƯU ĐÃI 10%
              </Button>
            </Stack>

            {/* Trust Badge */}
            <Typography
              variant="caption"
              align="center"
              sx={{
                display: 'block',
                mt: 2,
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              🔒 Thông tin của bạn được bảo mật tuyệt đối
            </Typography>
          </Box>
        ) : (
          // Success State
          <Box textAlign="center" py={3}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'warning.dark', mb: 1 }}>
              Cảm ơn bạn! 🎉
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Mã giảm giá 10% đã được gửi đến số điện thoại của bạn
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
