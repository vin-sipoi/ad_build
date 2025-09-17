// Logo component with Adamur branding
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function Logo({ size = 'md', variant = 'light', showText = true }: LogoProps) {
  const logoSrc = variant === 'light' ? '/Adamur_White_BG.png' : '/Adamur_Dark_Background - PNG.png';
  
  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src={logoSrc}
          alt="Adamur"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 'text-2xl'
        } text-primary`}>
          Adamur
        </span>
      )}
    </div>
  );
}
