import { Card, CardContent, type CardProps, CardHeader, CardActions } from '@mui/material';
import type { ReactNode } from 'react';

interface AppCardProps extends Omit<CardProps, 'title'> {
  title?: ReactNode;
  subheader?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  contentPadding?: number | string;
}

export const AppCard = ({
  children,
  title,
  subheader,
  action,
  footer,
  contentPadding,
  sx,
  ...props
}: AppCardProps) => {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      {(title || subheader || action) && (
        <CardHeader title={title} subheader={subheader} action={action} />
      )}
      <CardContent sx={{ flexGrow: 1, p: contentPadding }}>{children}</CardContent>
      {footer && <CardActions>{footer}</CardActions>}
    </Card>
  );
};
