import { Button, Snackbar, Alert, Slide, IconButton, Stack } from '@mui/material';
import type { SlideProps } from '@mui/material';
import { Download as InstallIcon, Close as CloseIcon } from '@mui/icons-material';
import { usePwaInstallPrompt } from './hooks/use-pwa-install-prompt';
import { IosInstallModal } from './ios-install-modal';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const InstallPrompt = () => {
  const { showPrompt, showIosPrompt, promptInstall, dismissPrompt, closeIosPrompt } =
    usePwaInstallPrompt();

  if (!showPrompt) return null;

  return (
    <>
      <Snackbar
        open={showPrompt}
        // Removed autoHideDuration to ensure user sees it until dismissed
        // or we can keep it if we want it to be transient.
        // Requirement said "Show prompt only after...", didn't specify it should auto-hide.
        // Usually prompts stick around until interacting.
        onClose={dismissPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        <Alert
          severity="info"
          icon={<InstallIcon />}
          elevation={6}
          variant="filled"
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Button color="inherit" size="small" onClick={promptInstall}>
                Cài đặt
              </Button>
              <IconButton size="small" aria-label="close" color="inherit" onClick={dismissPrompt}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
          sx={{
            width: '100%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '& .MuiAlert-icon': {
              color: 'inherit',
            },
          }}
        >
          Cài đặt ứng dụng Cơm Ánh Dương để đặt món nhanh hơn!
        </Alert>
      </Snackbar>

      <IosInstallModal open={showIosPrompt} onClose={closeIosPrompt} />
    </>
  );
};
