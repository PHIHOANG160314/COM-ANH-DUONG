import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import { Add, Edit, Delete, Home, Business, LocationOn, Star } from '@mui/icons-material';
import { useAddresses, type CustomerAddress, type InsertAddress } from '../hooks/use-addresses';

interface AddressFormData {
  label: string;
  address: string;
  phone: string;
  is_default: boolean;
}

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Nhà: <Home fontSize="small" />,
  Home: <Home fontSize="small" />,
  'Công ty': <Business fontSize="small" />,
  Office: <Business fontSize="small" />,
};

export const AddressList = () => {
  const { addresses, loading, error, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    label: 'Nhà',
    address: '',
    phone: '',
    is_default: false,
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({ label: 'Nhà', address: '', phone: '', is_default: false });
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      address: addr.address,
      phone: addr.phone || '',
      is_default: addr.is_default,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data: Omit<InsertAddress, 'customer_id'> = {
      label: formData.label,
      address: formData.address,
      phone: formData.phone || null,
      is_default: formData.is_default,
    };

    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress(data);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (addressToDelete) {
      await deleteAddress(addressToDelete);
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} />
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LocationOn /> Sổ địa chỉ
        </Typography>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={handleOpenAdd}>
          Thêm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {addresses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">Chưa có địa chỉ nào</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={handleOpenAdd} sx={{ mt: 2 }}>
            Thêm địa chỉ đầu tiên
          </Button>
        </Paper>
      ) : (
        <List sx={{ p: 0 }}>
          {addresses.map((addr) => (
            <Paper key={addr.id} sx={{ mb: 1.5, overflow: 'hidden' }}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenEdit(addr)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setAddressToDelete(addr.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {LABEL_ICONS[addr.label] || <LocationOn fontSize="small" />}
                      <Typography fontWeight="bold">{addr.label}</Typography>
                      {addr.is_default && (
                        <Chip
                          icon={<Star sx={{ fontSize: 14 }} />}
                          label="Mặc định"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {addr.address}
                      </Typography>
                      {addr.phone && (
                        <Typography variant="body2" color="text.secondary" component="span">
                          {' • '}
                          {addr.phone}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nhãn"
            value={formData.label}
            onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
            fullWidth
            margin="normal"
            placeholder="VD: Nhà, Công ty, ..."
          />
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            required
          />
          <TextField
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            fullWidth
            margin="normal"
            placeholder="Tùy chọn"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_default}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_default: e.target.checked }))}
              />
            }
            label="Đặt làm địa chỉ mặc định"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.address.trim()}>
            {editingAddress ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Xóa địa chỉ?</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa địa chỉ này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
