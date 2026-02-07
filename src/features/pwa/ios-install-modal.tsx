import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { IosShare, AddBox } from '@mui/icons-material';

interface IosInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export const IosInstallModal = ({ open, onClose }: IosInstallModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Cài đặt ứng dụng web
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Cài đặt ứng dụng Cơm Ánh Dương vào màn hình chính để đặt món nhanh chóng và dễ dàng hơn.
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <IosShare color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Bước 1"
              secondary={
                <>
                  Nhấn vào nút <strong>Chia sẻ</strong> ở thanh công cụ phía dưới trình duyệt.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AddBox color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Bước 2"
              secondary={
                <>
                  Chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen) từ menu.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: 'bold', width: 24, textAlign: 'center' }}
              >
                +
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary="Bước 3"
              secondary={
                <>
                  Nhấn <strong>Thêm</strong> (Add) ở góc trên bên phải để hoàn tất.
                </>
              }
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth sx={{ mx: 2 }}>
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};
