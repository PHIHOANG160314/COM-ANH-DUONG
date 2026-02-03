import { Box, Typography, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import { LocationOn, AccessTime } from '@mui/icons-material';
import { AppInput, TrustBadges } from '@/shared/ui';
import { OperatingHours } from '@/shared/ui/operating-hours';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { User } from '@supabase/supabase-js';

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

interface DeliveryFormProps {
  user: User | null;
  addresses: Address[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isStoreClosed: boolean;
}

/**
 * Delivery form with Vietnamese address format and phone validation
 * - Vietnamese phone number format: +84/0 followed by 9-10 digits
 * - Saved address book for authenticated users
 * - Operating hours status display
 * - Trust badges for credibility
 */
export const DeliveryForm = ({
  user,
  addresses,
  selectedAddressId,
  onAddressSelect,
  register,
  errors,
  isStoreClosed,
}: DeliveryFormProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Saved Addresses Section */}
      {user && addresses.length > 0 && (
        <Box sx={{ mb: 1 }}>
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
                control={<Radio size="small" sx={{ minWidth: 44, minHeight: 44 }} />}
                label={
                  <Typography variant="body2">
                    <strong>{addr.label}:</strong> {addr.address}{' '}
                    {addr.phone ? `(${addr.phone})` : ''}
                  </Typography>
                }
                sx={{
                  mb: 1,
                  py: 0.5,
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      )}

      {/* Delivery Information Fields */}
      <AppInput
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        fullWidth
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
        {...register('fullName')}
      />

      <AppInput
        label="Số điện thoại"
        placeholder="0xxx xxx xxx hoặc +84 xxx xxx xxx"
        fullWidth
        type="tel"
        error={!!errors.phone}
        helperText={
          errors.phone?.message ||
          'Định dạng: 0xxx xxx xxx hoặc +84 xxx xxx xxx'
        }
        {...register('phone')}
        inputProps={{
          pattern: '^(\\+84|0)[0-9]{9,10}$',
          inputMode: 'tel',
        }}
      />

      <AppInput
        label="Địa chỉ nhận hàng"
        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
        fullWidth
        multiline
        rows={3}
        error={!!errors.address}
        helperText={
          errors.address?.message ||
          'VD: 123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM'
        }
        {...register('address')}
      />

      <AppInput
        label="Ghi chú cho quán/tài xế (không bắt buộc)"
        placeholder="VD: Gọi điện trước 10 phút, để ở cổng..."
        fullWidth
        multiline
        rows={2}
        {...register('note')}
      />

      {/* Trust Badges - SEA F&B Standard */}
      <Box sx={{ mb: 1 }}>
        <TrustBadges variant="minimal" />
      </Box>

      {/* Operating Hours Status */}
      {isStoreClosed ? (
        <Alert severity="error" icon={<AccessTime />} sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Quán đang đóng cửa
          </Typography>
          <Typography variant="body2">
            Giờ mở cửa: 08:00 - 22:00. Vui lòng quay lại sau!
          </Typography>
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OperatingHours showDetails showCountdown={false} />
        </Box>
      )}
    </Box>
  );
};
