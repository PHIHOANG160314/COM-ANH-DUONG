import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
} from '@mui/material';
import { formatCurrency } from '@/shared/lib/formatters';

interface TopItemsTableProps {
  items: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export const TopItemsTable: React.FC<TopItemsTableProps> = ({ items }) => {
  return (
    <Paper
      sx={{ p: 3, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h6" gutterBottom>
        Top Món Ăn Hôm Nay
      </Typography>

      {items.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'text.secondary',
          }}
        >
          <Typography>Chưa có dữ liệu bán hàng hôm nay</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" aria-label="top items table">
            <TableHead>
              <TableRow>
                <TableCell>Tên món</TableCell>
                <TableCell align="right">SL</TableCell>
                <TableCell align="right">Doanh thu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={index < 3 ? 'primary' : 'default'}
                        variant={index < 3 ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: '0.7rem', minWidth: 24 }}
                      />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }} title={item.name}>
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
