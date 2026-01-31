import React from 'react';
import { Box, Typography } from '@mui/material';
import { VerifiedUser, Policy } from '@mui/icons-material';

/**
 * Footer Compliance Section
 * Displays regulatory badges (VSATTP, BCT) in the footer
 */
export const FooterCompliance: React.FC = () => {
  return (
    <Box
      sx={{
        mt: 4,
        pt: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      {/* VSATTP Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
        <VerifiedUser color="success" sx={{ fontSize: 20 }} />
        <Box>
          <Typography
            variant="caption"
            display="block"
            sx={{ lineHeight: 1.2, fontWeight: 'bold' }}
          >
            VSATTP
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ lineHeight: 1.2, color: 'rgba(255,255,255,0.7)' }}
          >
            Đạt chuẩn
          </Typography>
        </Box>
      </Box>

      {/* BCT Badge (Mocked) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
        <Policy color="info" sx={{ fontSize: 20 }} />
        <Box>
          <Typography
            variant="caption"
            display="block"
            sx={{ lineHeight: 1.2, fontWeight: 'bold' }}
          >
            Đã thông báo
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ lineHeight: 1.2, color: 'rgba(255,255,255,0.7)' }}
          >
            Bộ Công Thương
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
