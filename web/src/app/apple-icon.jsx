import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #262626 0%, #0a0a0a 80%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAFBFC',
          fontWeight: 900,
          fontFamily: 'serif',
          borderRadius: '40px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        O
      </div>
    ),
    { ...size }
  );
}
