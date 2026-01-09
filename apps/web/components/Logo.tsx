import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { width: 40, height: 24, text: 'text-sm' },
  md: { width: 60, height: 36, text: 'text-base' },
  lg: { width: 80, height: 48, text: 'text-lg' },
  xl: { width: 120, height: 72, text: 'text-xl' },
};

export function Logo({ size = 'md', showText = false, href, className = '' }: LogoProps) {
  const dimensions = sizeMap[size];
  
  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <Image
          src="/images/LOGO_KiBei.png"
          alt="KiBei MOBILE RDC"
          fill
          sizes={`${dimensions.width}px`}
          className="object-contain rounded-lg"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${dimensions.text} font-semibold tracking-tight text-white`}>KiBei</span>
          <span className="text-xs text-slate-300/80">MOBILE RDC</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

