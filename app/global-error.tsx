'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-MT">
      <body>
        <main
          style={{
            margin: '0 auto',
            maxWidth: '42rem',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <p style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.2em' }}>
            ERROR
          </p>
          <h1 style={{ marginTop: '1rem', fontSize: '1.875rem' }}>Something went wrong</h1>
          <p style={{ marginTop: '1rem', color: '#475569' }}>
            We could not load this page. Please try again or contact our team if the problem
            continues.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              minHeight: '2.75rem',
              borderRadius: '9999px',
              background: '#0B3D91',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
