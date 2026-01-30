import { TextField, type TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export type AppInputProps = TextFieldProps;

export const AppInput = forwardRef<HTMLDivElement, AppInputProps>((props, ref) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      ref={ref}
      size="small"
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
        },
        ...props.sx,
      }}
    />
  );
});

AppInput.displayName = 'AppInput';
