import { useState } from 'react';
import { Snackbar, Alert, Button, IconButton, Box, Typography } from '@mui/material';
import { Close, IosShare, GetApp } from '@mui/icons-material';
import { useInstallPrompt } from '../hooks/use-install-prompt';

export const InstallPrompt = () => {
  const { promptInstall, canInstall, isIOS, isInstalled } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setDismissed(true);
    }
  };

  const handleIOSClick = () => {
    setShowIOSInstructions(true);
  };

  return (
    <>
      {/* Main install prompt */}
      {!showIOSInstructions && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 80, md: 24 } }}
        >
          <Alert
            severity="info"
            icon={isIOS ? <IosShare /> : <GetApp />}
            action={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {isIOS ? (
                  <>
                    <Button size="small" onClick={handleIOSClick}>
                      Hướng dẫn
                    </Button>
                    <IconButton size="small" onClick={() => setDismissed(true)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button size="small" onClick={handleInstall} disabled={!canInstall}>
                      Cài đặt
                    </Button>
                    <IconButton size="small" onClick={() => setDismissed(true)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            }
            sx={{ width: '100%', minWidth: { xs: 280, sm: 400 } }}
          >
            {isIOS
              ? 'Thêm Cơm Ánh Dương vào màn hình chính'
              : 'Cài đặt ứng dụng để truy cập nhanh hơn'}
          </Alert>
        </Snackbar>
      )}

      {/* iOS installation instructions */}
      {showIOSInstructions && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 80, md: 24 } }}
        >
          <Alert
            severity="info"
            icon={<IosShare />}
            action={
              <IconButton
                size="small"
                onClick={() => {
                  setShowIOSInstructions(false);
                  setDismissed(true);
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            sx={{
              width: '100%',
              minWidth: { xs: 320, sm: 440 },
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Cài đặt trên iOS:
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0, fontSize: '0.875rem' }}>
              <li>Nhấn nút Share/Chia sẻ (biểu tượng mũi tên lên)</li>
              <li>Chọn "Add to Home Screen" / "Thêm vào Màn hình chính"</li>
              <li>Nhấn "Add" / "Thêm" để hoàn tất</li>
            </Box>
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
