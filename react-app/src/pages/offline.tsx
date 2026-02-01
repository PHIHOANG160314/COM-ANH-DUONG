import { Container, Typography, Button, Box } from '@mui/material';
import { CloudOff } from '@mui/icons-material';
import { PageTransition } from '@/shared/ui/page-transition';

export const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <PageTransition>
      <Container
        maxWidth="sm"
        sx={{
          py: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CloudOff
          sx={{
            fontSize: { xs: 100, md: 120 },
            color: 'text.secondary',
            mb: 3,
            opacity: 0.6,
          }}
        />
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Không có kết nối mạng
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          Vui lòng kiểm tra kết nối internet và thử lại
        </Typography>
        <Button variant="contained" size="large" onClick={handleRetry}>
          Thử lại
        </Button>

        <Box sx={{ mt: 6, color: 'text.secondary' }}>
          <Typography variant="caption">
            Một số nội dung đã lưu có thể vẫn khả dụng khi offline
          </Typography>
        </Box>
      </Container>
    </PageTransition>
  );
};
