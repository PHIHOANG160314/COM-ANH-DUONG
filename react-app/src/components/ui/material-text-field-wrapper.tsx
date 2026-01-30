import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';

interface MaterialTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  className?: string;
}

export const MaterialTextField: React.FC<MaterialTextFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  variant = 'outlined',
  disabled = false,
  required = false,
  error = false,
  errorText,
  className = '',
}) => {
  const Tag = `md-${variant}-text-field` as any;

  return (
    <Tag
      label={label}
      value={value}
      onInput={(e: any) => onChange(e.target.value)}
      type={type}
      disabled={disabled}
      required={required}
      error={error}
      error-text={errorText}
      className={className}
    />
  );
};
