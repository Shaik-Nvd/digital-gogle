import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = {
  width: 64,
  height: 64,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 36,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c4f042',
          fontWeight: 900,
          borderRadius: '12px',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-2px',
          paddingRight: '2px' // offset for tracking
        }}
      >
        DG
      </div>
    ),
    { ...size }
  )
}
