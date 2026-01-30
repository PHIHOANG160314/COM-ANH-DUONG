import { Grid, Paper, Typography, Box, ButtonBase } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

interface TableSelectionProps {
  onSelectTable: (tableNumber: string) => void;
}

const TABLES = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

export const TableSelection = ({ onSelectTable }: TableSelectionProps) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Chọn bàn
      </Typography>
      <Grid container spacing={2}>
        {TABLES.map((table) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={table}>
            <ButtonBase
              onClick={() => onSelectTable(table)}
              sx={{
                width: '100%',
                display: 'block',
                textAlign: 'center',
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Restaurant color="primary" fontSize="large" />
                <Typography variant="h6">Bàn {table}</Typography>
              </Paper>
            </ButtonBase>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }}>
          <ButtonBase
            onClick={() => onSelectTable('takeaway')}
            sx={{ width: '100%', display: 'block' }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
                '&:hover': { bgcolor: 'secondary.main' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Restaurant color="inherit" fontSize="large" />
              <Typography variant="h6">Mang về</Typography>
            </Paper>
          </ButtonBase>
        </Grid>
      </Grid>
    </Box>
  );
};
