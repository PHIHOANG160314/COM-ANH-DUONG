import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import type { ReactNode } from 'react';

interface MaterialButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined' | 'text';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'filled',
  type = 'button',
  className = '',
}) => {
  const Tag = `md-${variant}-button` as any;

  return (
    <Tag
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
    >
      {children}
    </Tag>
  );
};
