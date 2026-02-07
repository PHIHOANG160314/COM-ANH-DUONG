import { Button, type ButtonProps, CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const AppButton = ({
  children,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  ...props
}: AppButtonProps) => {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={24}
          color="inherit"
          sx={{ position: 'absolute', color: 'currentcolor' }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </Button>
  );
};
