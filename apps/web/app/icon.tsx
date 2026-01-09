import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  // RDC palette
  const blue = '#00A3E0';
  const blueDeep = '#0066B3';
  const red = '#CE1126';
  const yellow = '#FCD116';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
          background: `linear-gradient(135deg, ${blue} 0%, ${blueDeep} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Diagonal band (yellow / red / yellow) */}
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 18,
            transform: 'rotate(-45deg)',
            background: yellow,
            top: 30,
            left: -28,
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 26,
            transform: 'rotate(-45deg)',
            background: red,
            top: 26,
            left: -20,
            opacity: 0.92,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 18,
            transform: 'rotate(-45deg)',
            background: yellow,
            top: 22,
            left: -12,
            opacity: 0.95,
          }}
        />

        {/* Futuristic diamond */}
        <div
          style={{
            width: 22,
            height: 22,
            transform: 'rotate(45deg)',
            background: yellow,
            boxShadow: '0 0 14px rgba(252,209,22,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 30,
            height: 30,
            transform: 'rotate(45deg)',
            border: '2px solid rgba(255,255,255,0.75)',
            borderRadius: 6,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}


