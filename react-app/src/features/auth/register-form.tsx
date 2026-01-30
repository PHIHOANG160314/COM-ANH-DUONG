import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Link } from '@mui/material';
import { supabase } from '@/shared/api/supabase-client';
import { AppButton, AppInput } from '@/shared/ui';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            // Default role is customer (handled by DB trigger usually, or we can set metadata)
          },
        },
      });

      if (signUpError) throw signUpError;

      // Check if email confirmation is required (depends on Supabase settings)
      // For now, assume auto-confirm or just redirect to login with message
      navigate('/login', {
        state: {
          message:
            'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu cần) hoặc đăng nhập.',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      console.error('Register error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <AppInput
          label="Họ và tên"
          autoComplete="name"
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          {...register('fullName')}
        />

        <AppInput
          label="Email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <AppInput
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <AppInput
          label="Nhập lại mật khẩu"
          type="password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <AppButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={loading}
          sx={{ mt: 1 }}
        >
          Đăng ký
        </AppButton>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Đã có tài khoản?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Đăng nhập ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
