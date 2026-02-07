import { Box, Container, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
            Cơm Ánh Dương
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Hệ thống đặt món trực tuyến
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {children || <Outlet />}
        </Paper>
      </Container>
    </Box>
  );
};
