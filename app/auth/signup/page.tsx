'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters',        test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',    test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)',    test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)',              test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): { score: number; label: string; color: string; bar: string } {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: passed, label: 'Very weak',  color: 'text-red-500',    bar: 'bg-red-500' };
  if (passed === 2) return { score: passed, label: 'Weak',       color: 'text-orange-500', bar: 'bg-orange-500' };
  if (passed === 3) return { score: passed, label: 'Fair',       color: 'text-amber-500',  bar: 'bg-amber-500' };
  if (passed === 4) return { score: passed, label: 'Strong',     color: 'text-lime-600',   bar: 'bg-lime-500' };
  return              { score: passed, label: 'Very strong', color: 'text-emerald-600', bar: 'bg-emerald-500' };
}

export default function SignupPage() {
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [touched, setTouched]         = useState(false);

  const strength   = useMemo(() => getStrength(password), [password]);
  const allPassed  = strength.score === PASSWORD_RULES.length;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched(true);

    if (!allPassed) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#E5E5E5]">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Check your email</h2>
            <p className="text-[#666666] text-sm leading-relaxed">
              We sent a confirmation link to <strong className="text-black">{email}</strong>.
              Click it to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-7 bg-black text-white rounded-2xl px-6 py-3 text-sm font-semibold
                hover:opacity-80 transition-all duration-200"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-black text-sm font-bold tracking-widest">AI EXPENSE TRACKER</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E5E5]">
          <h1 className="text-2xl font-bold text-black mb-1">Create account</h1>
          <p className="text-[#666666] text-sm mb-7">Start tracking your expenses for free</p>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Pronoy Joy"
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl px-4 py-3 text-sm text-black
                  placeholder-[#AAAAAA] outline-none focus:border-black focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl px-4 py-3 text-sm text-black
                  placeholder-[#AAAAAA] outline-none focus:border-black focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                  required
                  placeholder="Create a strong password"
                  className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl px-4 py-3 pr-11 text-sm text-black
                    placeholder-[#AAAAAA] outline-none focus:border-black focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar + label */}
              {touched && password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#AAAAAA]">Password strength</span>
                    <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {PASSWORD_RULES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${i < strength.score ? strength.bar : 'bg-[#E5E5E5]'}`}
                      />
                    ))}
                  </div>

                  {/* Checklist */}
                  <ul className="space-y-1 pt-1">
                    {PASSWORD_RULES.map((rule) => {
                      const pass = rule.test(password);
                      return (
                        <li key={rule.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                            ${pass ? 'bg-emerald-500' : 'bg-[#E5E5E5]'}`}>
                            {pass
                              ? <CheckCircle className="w-3 h-3 text-white" />
                              : <X className="w-2.5 h-2.5 text-[#AAAAAA]" />
                            }
                          </div>
                          <span className={`text-xs transition-colors duration-200 ${pass ? 'text-emerald-600' : 'text-[#999]'}`}>
                            {rule.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (touched && !allPassed)}
              className="w-full bg-black text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2
                hover:opacity-80 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-[#666666] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-black font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
