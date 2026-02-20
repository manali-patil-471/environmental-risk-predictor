import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { firebaseMissingKeys, firebaseReady } from '@/lib/firebase';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    city: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const title = useMemo(
    () => (mode === 'login' ? 'Welcome Back' : 'Create Your Account'),
    [mode]
  );

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parseFirebaseError = (message: string) => {
    if (message.includes('auth/invalid-credential')) return 'Invalid email or password.';
    if (message.includes('auth/email-already-in-use')) return 'This email is already registered.';
    if (message.includes('auth/weak-password')) return 'Password should be at least 6 characters.';
    if (message.includes('auth/invalid-email')) return 'Please enter a valid email address.';
    return 'Authentication failed. Please try again.';
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!form.fullName.trim()) throw new Error('Full name is required.');
        if (!form.city.trim()) throw new Error('City is required.');
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signup({
          fullName: form.fullName.trim(),
          city: form.city.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await login(form.email.trim(), form.password);
      }
    } catch (err: any) {
      const code = String(err?.code || '');
      const msg = String(err?.message || '');
      setError(code ? parseFirebaseError(code) : msg || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.2),transparent_35%),radial-gradient(circle_at_85%_15%,hsl(var(--aqi-moderate)/0.22),transparent_40%),linear-gradient(160deg,hsl(220_27%_9%),hsl(220_22%_12%))] p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">EcoNova Sentinel</p>
          <h1 className="mt-3 text-3xl font-black text-white md:text-5xl">Predict. Protect. Act.</h1>
          <p className="mt-4 max-w-md text-sm text-slate-300">
            Sign in to unlock personalized AQI dashboards, profile-based health advice, and reward tracking.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Live AQI by city and station',
              'Personalized health recommendations',
              'Municipal-grade alert visibility',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="mb-6 flex gap-2 rounded-xl bg-black/25 p-1">
            <button
              onClick={() => setMode('login')}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-slate-300 hover:text-white'
              )}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-slate-300 hover:text-white'
              )}
            >
              Signup
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' ? 'Use your registered account to continue.' : 'Create an account and personalize your experience.'}
          </p>
          {!firebaseReady && (
            <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Firebase config missing in `frontend/src/.env`: {firebaseMissingKeys.join(', ')}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <>
                <input
                  value={form.fullName}
                  onChange={(e) => onChange('fullName', e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
                <input
                  value={form.city}
                  onChange={(e) => onChange('city', e.target.value)}
                  placeholder="Preferred city (e.g. Pune)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
              </>
            )}

            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
            />
            {mode === 'signup' && (
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              />
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !firebaseReady}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : !firebaseReady ? 'Setup Firebase First' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
