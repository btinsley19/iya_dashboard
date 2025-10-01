import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'IYA Networking Tool'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header with USC branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              background: '#990000',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              🎓
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1a202c',
                marginBottom: '8px',
              }}
            >
              IYA Networking Tool
            </div>
          </div>
        </div>

        {/* Login card preview */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1a202c',
                marginBottom: '12px',
              }}
            >
              Welcome Back
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#4a5568',
                lineHeight: '1.5',
              }}
            >
              Find other IYA students working on similar projects or with similar interests. Find cofounders, collaborators, and friends.
            </div>
          </div>

          {/* Form fields preview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                color: '#4a5568',
              }}
            >
              📧 your.email@usc.edu
            </div>
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                color: '#4a5568',
              }}
            >
              🔒 ••••••••
            </div>
            <div
              style={{
                background: '#990000',
                color: 'white',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '16px',
              }}
            >
              Sign In
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div
          style={{
            marginTop: '40px',
            fontSize: '18px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          Connect, collaborate, and grow with fellow USC students
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
