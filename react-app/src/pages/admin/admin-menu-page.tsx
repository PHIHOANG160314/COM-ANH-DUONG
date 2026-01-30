import { Typography, Box } from '@mui/material';
import { DailyMenuPlanner } from '@/features/admin/menu/daily-menu-planner';

export const AdminMenuPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Thực đơn hàng ngày
      </Typography>
      <DailyMenuPlanner />
    </Box>
  );
};
