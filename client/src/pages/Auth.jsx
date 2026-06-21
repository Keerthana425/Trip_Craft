import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  // React Hook Forms
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to authenticate. Check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');
    try {
      await register(data);
      setSuccessMessage('Registration successful! Please sign in with your credentials.');
      setIsLogin(true);
      resetSignupForm();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTab = (mode) => {
    setIsLogin(mode);
    setServerError('');
    setSuccessMessage('');
    resetLoginForm();
    resetSignupForm();
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row relative overflow-hidden font-body-md">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/50 rounded-full blur-[140px] pointer-events-none opacity-10"></div>

      {/* Left panel - Marketing & Branding */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 relative z-10 md:border-r border-outline-variant/10 bg-surface-container-lowest/30">
        <div className="max-w-md">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer inline-flex items-center gap-3 text-primary mb-12">
            <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            <span className="text-headline-md font-headline-md font-bold">TripCraft AI</span>
          </div>

          <h2 className="text-display-lg-mobile md:text-[38px] font-display-lg font-bold leading-tight tracking-tight mb-6">
            Explore the world with <span className="gradient-text">machine-precision</span> planning.
          </h2>

          <p className="text-on-surface-variant text-[15px] leading-relaxed mb-8 opacity-80">
            Securely access your account to build, edit, and orchestrate optimized itineraries, monitor expenses, and sync weather indexes offline.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-[14px] font-semibold">Secure Authorization</h4>
                <p className="text-[12px] text-on-surface-variant opacity-70">JWT-secured auth pipeline with HTTP-only credentials.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
              </div>
              <div>
                <h4 className="text-[14px] font-semibold">Real-Time Data Sync</h4>
                <p className="text-[12px] text-on-surface-variant opacity-70">Your routes, itineraries, and logs sync automatically across devices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Auth Forms Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="auth-card w-full max-w-[450px] p-8 rounded-2xl border border-outline-variant/20 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">Access Intelligence Hub</h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 opacity-70">
              Configure credentials to synchronize navigation data
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex bg-surface-container border border-outline-variant/10 rounded-xl p-1 mb-8">
            <button
              onClick={() => toggleTab(true)}
              className={`flex-1 py-2.5 rounded-lg text-label-sm font-label-sm font-semibold transition-all duration-200 ${
                isLogin ? 'bg-surface-container-high text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleTab(false)}
              className={`flex-1 py-2.5 rounded-lg text-label-sm font-label-sm font-semibold transition-all duration-200 ${
                !isLogin ? 'bg-surface-container-high text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Box */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/20 flex gap-3 text-error text-[13px] items-center">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <span>{serverError}</span>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-primary/15 border border-primary/20 flex gap-3 text-primary text-[13px] items-center">
              <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Forms */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-medium text-on-surface-variant">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">mail</span>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-on-surface focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                    {...registerLogin('email')}
                  />
                </div>
                {loginErrors.email && (
                  <span className="text-error text-[11px] font-label-sm font-medium">{loginErrors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-medium text-on-surface-variant">SECURITY KEY / PASSWORD</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">lock</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-on-surface focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                    {...registerLogin('password')}
                  />
                </div>
                {loginErrors.password && (
                  <span className="text-error text-[11px] font-label-sm font-medium">{loginErrors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full primary-btn text-on-primary py-3.5 rounded-xl text-label-sm font-label-sm font-semibold flex items-center justify-center gap-2 mt-4 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-on-primary rounded-full animate-spin"></div>
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-medium text-on-surface-variant">USERNAME</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">person</span>
                  <input
                    type="text"
                    placeholder="traveler_one"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-on-surface focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                    {...registerSignup('username')}
                  />
                </div>
                {signupErrors.username && (
                  <span className="text-error text-[11px] font-label-sm font-medium">{signupErrors.username.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-medium text-on-surface-variant">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">mail</span>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-on-surface focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                    {...registerSignup('email')}
                  />
                </div>
                {signupErrors.email && (
                  <span className="text-error text-[11px] font-label-sm font-medium">{signupErrors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-medium text-on-surface-variant">SECURITY KEY / PASSWORD</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">lock</span>
                  <input
                    type="password"
                    placeholder="•••••••• (Min. 6 chars)"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-on-surface focus:ring-1 focus:ring-primary"
                    disabled={isLoading}
                    {...registerSignup('password')}
                  />
                </div>
                {signupErrors.password && (
                  <span className="text-error text-[11px] font-label-sm font-medium">{signupErrors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full primary-btn text-on-primary py-3.5 rounded-xl text-label-sm font-label-sm font-semibold flex items-center justify-center gap-2 mt-4 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-on-primary rounded-full animate-spin"></div>
                    CREATING USER MODULE...
                  </>
                ) : (
                  <>
                    <span>Initialize Account</span>
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
