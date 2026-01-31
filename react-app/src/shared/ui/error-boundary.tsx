import { Component, type ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { hasSupabaseConfig } from '../api/supabase-client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    // Check for missing Supabase config
    if (!hasSupabaseConfig) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" component="h1" color="error" gutterBottom>
              ⚠️ Lỗi Cấu Hình
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ứng dụng chưa được cấu hình đầy đủ
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng liên hệ quản trị viên để cấu hình biến môi trường Supabase.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" fontFamily="monospace" color="error">
                Missing environment variables:
                <br />
                - VITE_SUPABASE_URL
                <br />- VITE_SUPABASE_ANON_KEY
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Thử lại
            </Button>
          </Box>
        </Container>
      );
    }

    // Regular error boundary
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" component="h1" color="error" gutterBottom>
              😕 Đã có lỗi xảy ra
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ứng dụng gặp sự cố không mong muốn
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
            </Typography>
            {this.state.error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '100%' }}>
                <Typography variant="body2" fontFamily="monospace" color="error">
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Tải lại trang
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
