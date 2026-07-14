type LogoSvgVariant = 'mark' | 'wordmark' | 'compact';

type Props = {
  variant?: LogoSvgVariant;
  className?: string;
  title?: string;
};

const NAVY = '#0B3D91';
const GOLD = '#D8A106';

export function BezzinaLogoSvg({ variant = 'wordmark', className = '', title = 'Joseph Bezzina & Co. Ltd' }: Props) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 80 80"
        role="img"
        aria-label={title}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <circle cx="40" cy="40" r="36" fill={GOLD} opacity="0.15" />
        <path
          d="M40 8c17.7 0 32 14.3 32 32s-14.3 32-32 32S8 57.7 8 40 22.3 8 40 8Z"
          fill={GOLD}
        />
        <path
          d="M40 14c14.4 0 26 11.6 26 26S54.4 66 40 66 14 54.4 14 40 25.6 14 40 14Z"
          fill="#fff"
        />
        <text
          x="40"
          y="52"
          textAnchor="middle"
          fill={NAVY}
          fontSize="34"
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          J
        </text>
        <rect x="18" y="37" width="44" height="6" rx="3" fill={GOLD} />
        <circle cx="20" cy="40" r="4" fill={GOLD} />
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <svg
        viewBox="0 0 280 72"
        role="img"
        aria-label={title}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <g transform="translate(4,4) scale(0.8)">
          <circle cx="36" cy="36" r="32" fill={GOLD} />
          <circle cx="36" cy="36" r="24" fill="#fff" />
          <text x="36" y="48" textAnchor="middle" fill={NAVY} fontSize="30" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">
            J
          </text>
          <rect x="16" y="33" width="40" height="6" rx="3" fill={GOLD} />
        </g>
        <text x="88" y="34" fill={NAVY} fontSize="26" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="1">
          BEZZINA
        </text>
        <text x="88" y="54" fill="#1a1a1a" fontSize="12" fontWeight="500" fontFamily="Arial, Helvetica, sans-serif">
          Marine Supplies
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 420 120"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g transform="translate(8,8)">
        <circle cx="52" cy="52" r="48" fill={GOLD} />
        <circle cx="52" cy="52" r="36" fill="#fff" />
        <text
          x="52"
          y="68"
          textAnchor="middle"
          fill={NAVY}
          fontSize="44"
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          J
        </text>
        <rect x="22" y="47" width="60" height="10" rx="5" fill={GOLD} />
        <circle cx="24" cy="52" r="6" fill={GOLD} />
      </g>
      <text
        x="128"
        y="58"
        fill={NAVY}
        fontSize="42"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="2"
      >
        BEZZINA
      </text>
      <text x="128" y="88" fill="#1a1a1a" fontSize="18" fontWeight="500" fontFamily="Arial, Helvetica, sans-serif">
        Marine Supplies
      </text>
      <text x="350" y="58" fill={NAVY} fontSize="16" fontWeight="600" fontFamily="Arial, Helvetica, sans-serif">
        co. ltd.
      </text>
    </svg>
  );
}
