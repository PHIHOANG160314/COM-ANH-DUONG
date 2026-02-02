import {
  Box,
  Typography,
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { LocationOn, AccessTime } from '@mui/icons-material';
import { AppInput, TrustBadges } from '@/shared/ui';
import { OperatingHours } from '@/shared/ui/operating-hours';
import { PaymentMethodSelector } from '@/features/payment/components/payment-method-selector';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { PaymentProvider } from '@/features/payment/api/payment-api';
import type { User } from '@supabase/supabase-js';

// We need to define the form data type here or import it
// Ideally this should be shared, but for now defining strict interface
interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  phone: string | null;
}

interface AddressSectionProps {
  user: User | null;
  addresses: Address[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isStoreClosed: boolean;
  paymentMethod: PaymentProvider;
  onPaymentMethodChange: (method: PaymentProvider) => void;
}

export const AddressSection = ({
  user,
  addresses,
  selectedAddressId,
  onAddressSelect,
  register,
  errors,
  isStoreClosed,
  paymentMethod,
  onPaymentMethodChange,
}: AddressSectionProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      {/* Saved Addresses Section */}
      {user && addresses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <LocationOn color="primary" fontSize="small" /> Chọn từ sổ địa chỉ
          </Typography>
          <RadioGroup value={selectedAddressId} onChange={(e) => onAddressSelect(e.target.value)}>
            {addresses.map((addr) => (
              <FormControlLabel
                key={addr.id}
                value={addr.id}
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    <strong>{addr.label}:</strong> {addr.address}{' '}
                    {addr.phone ? `(${addr.phone})` : ''}
                  </Typography>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AppInput
          label="Họ và tên"
          fullWidth
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          {...register('fullName')}
        />
        <AppInput
          label="Số điện thoại"
          fullWidth
          error={!!errors.phone}
          helperText={errors.phone?.message}
          {...register('phone')}
        />
        <AppInput
          label="Địa chỉ nhận hàng"
          fullWidth
          multiline
          rows={2}
          error={!!errors.address}
          helperText={errors.address?.message}
          {...register('address')}
        />
        <AppInput
          label="Ghi chú cho quán/tài xế"
          fullWidth
          multiline
          rows={2}
          {...register('note')}
        />

        {/* SEA F&B SOPs - Trust Elements */}
        <Box sx={{ mb: 2 }}>
          <TrustBadges variant="minimal" />
        </Box>

        {isStoreClosed ? (
          <Alert severity="error" icon={<AccessTime />} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Quán đang đóng cửa
            </Typography>
            <Typography variant="body2">
              Giờ mở cửa: 08:00 - 22:00. Vui lòng quay lại sau!
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <OperatingHours showDetails showCountdown={false} />
          </Box>
        )}

        <PaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} />
      </Box>
    </Paper>
  );
};
