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
  const baseClass = 'px-6 py-3 rounded-lg font-medium transition-all active:scale-95';

  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-900 disabled:text-gray-500'
      : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600';

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
