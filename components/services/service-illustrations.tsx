type IllustrationProps = {
  className?: string;
};

const brand = {
  blue: '#0B3D91',
  gold: '#D8A106',
  navy: '#071B35',
  light: '#E8EFF9',
};

export function QuotationsIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Fast quotations illustration"
    >
      <rect width="400" height="220" fill={brand.light} rx="16" />
      <rect x="88" y="36" width="224" height="148" rx="14" fill="#fff" stroke={brand.blue} strokeWidth="2" />
      <rect x="108" y="58" width="120" height="10" rx="5" fill={brand.blue} opacity="0.2" />
      <rect x="108" y="78" width="184" height="8" rx="4" fill="#CBD5E1" />
      <rect x="108" y="94" width="160" height="8" rx="4" fill="#CBD5E1" />
      <rect x="108" y="110" width="140" height="8" rx="4" fill="#CBD5E1" />
      <rect x="108" y="140" width="72" height="28" rx="8" fill={brand.gold} />
      <rect x="248" y="52" width="52" height="64" rx="10" fill="#fff" stroke={brand.blue} strokeWidth="2" />
      <text x="274" y="82" textAnchor="middle" fill={brand.blue} fontSize="22" fontWeight="700">€</text>
      <text x="274" y="102" textAnchor="middle" fill={brand.navy} fontSize="11" fontWeight="600">QUOTE</text>
      <circle cx="72" cy="168" r="28" fill={brand.blue} opacity="0.12" />
      <path d="M60 168h24M72 156v24" stroke={brand.blue} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SourcingIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Product sourcing illustration"
    >
      <rect width="400" height="220" fill={brand.light} rx="16" />
      <rect x="52" y="92" width="180" height="88" rx="8" fill={brand.blue} opacity="0.85" />
      <rect x="68" y="108" width="148" height="56" rx="4" fill="#fff" opacity="0.15" />
      <rect x="250" y="118" width="98" height="62" rx="6" fill="#fff" stroke={brand.blue} strokeWidth="2" />
      <rect x="262" y="130" width="74" height="38" rx="4" fill={brand.light} />
      <rect x="118" y="72" width="64" height="28" rx="6" fill={brand.gold} />
      <circle cx="300" cy="78" r="18" fill={brand.blue} opacity="0.15" />
      <path d="M292 78h16M300 70v16" stroke={brand.blue} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="86" y="148" width="22" height="14" rx="3" fill={brand.gold} />
      <rect x="112" y="148" width="22" height="14" rx="3" fill={brand.gold} opacity="0.7" />
    </svg>
  );
}

export function TechnicalIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Technical assistance illustration"
    >
      <rect width="400" height="220" fill={brand.light} rx="16" />
      <rect x="72" y="48" width="256" height="136" rx="12" fill="#fff" stroke={brand.blue} strokeWidth="2" />
      <path d="M96 88h208M96 112h160M96 136h120" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
      <circle cx="120" cy="168" r="22" fill={brand.blue} />
      <rect x="108" y="150" width="24" height="10" rx="4" fill={brand.gold} />
      <rect x="280" y="132" width="36" height="36" rx="8" fill={brand.gold} opacity="0.25" />
      <path d="M292 144l8 8 16-16" stroke={brand.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M300 60h48v48H300z" fill="none" stroke={brand.blue} strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

export function DeliveryIllustration({ className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Delivery and collection illustration"
    >
      <rect width="400" height="220" fill={brand.light} rx="16" />
      <rect x="64" y="108" width="200" height="64" rx="12" fill={brand.blue} />
      <rect x="88" y="88" width="88" height="44" rx="10" fill={brand.blue} opacity="0.9" />
      <circle cx="108" cy="176" r="16" fill={brand.navy} />
      <circle cx="220" cy="176" r="16" fill={brand.navy} />
      <rect x="268" y="72" width="72" height="88" rx="10" fill="#fff" stroke={brand.blue} strokeWidth="2" />
      <rect x="280" y="86" width="48" height="36" rx="4" fill={brand.light} />
      <circle cx="332" cy="58" r="20" fill={brand.gold} opacity="0.35" />
      <path
        d="M332 48c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z"
        fill="none"
        stroke={brand.blue}
        strokeWidth="2"
      />
      <circle cx="332" cy="48" r="4" fill={brand.blue} />
    </svg>
  );
}
