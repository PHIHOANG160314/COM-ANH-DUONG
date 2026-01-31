import { Snackbar, Button, Alert } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Debug } from '@/shared/utils/debug';

export const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      Debug.log('SW Registered:', r);
    },
    onRegisterError(error) {
      Debug.error('SW Registration error:', error);
    },
  });

  const handleClose = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // If using autoUpdate, needRefresh might be true briefly before auto-reloading,
  // or if the browser waits for the user to confirm.
  // With autoUpdate, usually the new SW takes over immediately, but sometimes it waits for skipWaiting.

  return (
    <>
      <Snackbar
        open={offlineReady || needRefresh}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity="info"
          sx={{ width: '100%' }}
          action={
            needRefresh && (
              <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                Cập nhật
              </Button>
            )
          }
        >
          {offlineReady
            ? 'Ứng dụng đã sẵn sàng để sử dụng offline.'
            : 'Có phiên bản mới. Cập nhật ngay?'}
        </Alert>
      </Snackbar>
    </>
  );
};
