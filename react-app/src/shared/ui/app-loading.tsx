import { Box, CircularProgress, Typography } from '@mui/material';

interface AppLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const AppLoading = ({ message, fullScreen = false }: AppLoadingProps) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={48} color="primary" />
        {message && (
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <CircularProgress size={32} />
      {message && (
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
