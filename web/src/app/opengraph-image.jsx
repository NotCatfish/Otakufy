import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Otakufy - Master Japanese with SRS & Gamified Learning';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #1e1e1e 0%, #050505 70%)',
          color: '#FAFBFC',
          fontFamily: 'serif',
          position: 'relative',
          padding: 60,
        }}
      >
        {/* Top Logo Header */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.25em', color: '#FAFBFC' }}>
            OTAKUFY
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 20 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: '0.08em',
              background: 'linear-gradient(to bottom right, #ffffff, #888888)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
            }}
          >
            Otakufy
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 300,
              color: '#cccccc',
              letterSpacing: '0.05em',
              textAlign: 'center',
              maxWidth: 960,
              lineHeight: 1.4,
            }}
          >
            Master Japanese Kanji, Vocabulary & Grammar with Gamified Spaced Repetition
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            gap: 48,
            fontSize: 20,
            color: '#888888',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 30,
            width: '80%',
            justifyContent: 'center',
          }}
        >
          <span>✦ Intelligent SRS</span>
          <span>✦ JLPT Dictionary</span>
          <span>✦ Global Leaderboard</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
