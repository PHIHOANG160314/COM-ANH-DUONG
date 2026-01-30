import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { ReloadPrompt } from '@/features/pwa/reload-prompt';
import { InstallPrompt } from '@/features/pwa/install-prompt';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <ReloadPrompt />
      <InstallPrompt />
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Cơm Ánh Dương
          </Typography>
          <Button color="inherit">Đăng nhập</Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        {children || <Outlet />}
      </Container>

      <Box
        component="footer"
        sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5', textAlign: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Cơm Ánh Dương. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
