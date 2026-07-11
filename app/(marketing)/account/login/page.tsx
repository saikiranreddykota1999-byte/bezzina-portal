import LoginForm from './login-form';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';

type PageProps = {
  searchParams: Promise<{
    redirect?: string;
    mode?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const authCallbackError =
    params.error === 'auth_callback_failed'
      ? 'Sign-in failed. Please try again.'
      : params.error === 'session_timeout'
        ? 'Session check timed out. Please sign in again.'
        : undefined;

  return (
    <LoginForm
      redirectPath={sanitizeRedirectPath(params.redirect)}
      initialMode={params.mode === 'phone' ? 'phone-otp' : 'email-otp'}
      authCallbackError={authCallbackError}
    />
  );
}
