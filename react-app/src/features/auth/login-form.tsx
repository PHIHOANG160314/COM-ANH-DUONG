import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Link } from '@mui/material';
import { supabase } from '@/shared/api/supabase-client';
import { AppButton, AppInput } from '@/shared/ui';
import { Debug } from '@/shared/utils/debug';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      navigate('/'); // Redirect to home or dashboard after login
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      Debug.error('Login error:', err);
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
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <AppButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={loading}
          sx={{ mt: 1 }}
        >
          Đăng nhập
        </AppButton>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Chưa có tài khoản?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
