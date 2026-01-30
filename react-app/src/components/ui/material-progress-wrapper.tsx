import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';

interface MaterialProgressProps {
  variant?: 'circular' | 'linear';
  indeterminate?: boolean;
  value?: number;
  max?: number;
  className?: string;
}

export const MaterialProgress: React.FC<MaterialProgressProps> = ({
  variant = 'circular',
  indeterminate = true,
  value = 0,
  max = 1,
  className = '',
}) => {
  const Tag = `md-${variant}-progress` as any;

  return (
    <Tag
      indeterminate={indeterminate}
      value={value}
      max={max}
      className={className}
    />
  );
};
