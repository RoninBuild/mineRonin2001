'use client';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClass = 'w-full text-base';
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
