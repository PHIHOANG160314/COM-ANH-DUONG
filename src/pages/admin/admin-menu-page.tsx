import { Typography, Box } from '@mui/material';
import { DynamicMenuManager } from '@/features/admin/menu/dynamic-menu-manager';

export const AdminMenuPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý thực đơn
      </Typography>
      <DynamicMenuManager />
    </Box>
  );
};
