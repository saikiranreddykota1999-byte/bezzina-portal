import Image from 'next/image';
import { company } from '@/config/company';

type WatermarkVariant = 'admin-page' | 'admin-login' | 'login-card';

type Props = {
  variant?: WatermarkVariant;
  className?: string;
};

const variantClasses: Record<WatermarkVariant, string> = {
  'admin-page':
    'brand-watermark--admin-page pointer-events-none fixed bottom-0 right-0 z-0 select-none',
  'admin-login':
    'brand-watermark--admin-login pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden',
  'login-card':
    'brand-watermark--login-card pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden',
};

export function LogoWatermark({ variant = 'admin-page', className = '' }: Props) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} aria-hidden="true">
      <Image
        src={company.watermarkUrl}
        alt=""
        width={800}
        height={800}
        className="brand-watermark__image"
        priority={variant === 'admin-login'}
      />
    </div>
  );
}
