export function svgThumb(label: string, accent: string = '#00A3E0') {
  const initials = (label || 'K')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="#0066B3"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="96" height="96" rx="20" fill="rgba(255,255,255,0.06)"/>
  <rect x="10" y="10" width="76" height="76" rx="18" fill="url(#g)" opacity="0.9"/>
  <path d="M-20 52 L52 -20 L60 -12 L-12 60 Z" fill="#FCD116" opacity="0.85"/>
  <path d="M-14 58 L58 -14 L72 0 L0 72 Z" fill="#CE1126" opacity="0.75"/>
  <text x="48" y="56" text-anchor="middle" font-family="system-ui,Segoe UI,Arial" font-size="22" font-weight="700" fill="#0B1220" opacity="0.85">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


