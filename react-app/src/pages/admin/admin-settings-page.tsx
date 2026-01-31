import {
  Typography,
  Box,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import { useState } from 'react';

export const AdminSettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    // TODO: Implement save settings logic
    console.log('Settings saved:', {
      notifications,
      emailAlerts,
      autoBackup,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cài đặt
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cài đặt chung
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                }
                label="Thông báo đơn hàng mới"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                }
                label="Gửi email cảnh báo"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                  />
                }
                label="Tự động sao lưu dữ liệu"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Restaurant Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin nhà hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tên nhà hàng"
                defaultValue="Cơm Ánh Dương"
                fullWidth
              />

              <TextField
                label="Địa chỉ"
                defaultValue="123 Đường ABC, Quận XYZ"
                fullWidth
              />

              <TextField
                label="Số điện thoại"
                defaultValue="0123456789"
                fullWidth
              />

              <TextField
                label="Email"
                defaultValue="contact@comanhduong.com"
                fullWidth
                type="email"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Operating Hours */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Giờ hoạt động
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Giờ mở cửa"
                  type="time"
                  defaultValue="09:00"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Giờ đóng cửa"
                  type="time"
                  defaultValue="22:00"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined">Hủy</Button>
            <Button variant="contained" onClick={handleSave}>
              Lưu cài đặt
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
