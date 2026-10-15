import React from 'react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  imgClassName = '',
  showText = true,
  size = 'md',
  onClick,
}) => {
  // Respect Vite base URL in both local development and GitHub Pages (/microjob-bd/)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoSrc = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}assets/microjob-bd-logo.png`;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer select-none group' : ''} ${className}`}
    >
      <img
        src={logoSrc}
        alt="Microjob BD Logo"
        className={`${sizeClasses[size]} object-contain shrink-0 drop-shadow-xs transition-transform duration-200 group-hover:scale-105 ${imgClassName}`}
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            Microjob<span className="text-emerald-600 dark:text-emerald-400">BD</span>
          </span>
          <span className="hidden sm:block text-[9px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            BY MRS ENGINEERS BD
          </span>
        </div>
      )}
    </div>
  );
};
