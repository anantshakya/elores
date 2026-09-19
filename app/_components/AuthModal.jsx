'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle, ArrowRight, ShieldCheck, Sparkles, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { api, useToast } from '@/app/_components/StorefrontCore.jsx';
import { useNavigate } from '@/app/_lib/router-compat';

const AuthModalContext = createContext({
  isOpen: false,
  mode: 'login', // 'login' | 'register' | 'forgot'
  openAuth: (mode = 'login') => {},
  closeAuth: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Registration steps: 1 = Details form, 2 = Email OTP verification
  const [regStep, setRegStep] = useState(1);
  
  // Forgot password steps: 1 = Email request, 2 = OTP + New Password + Confirm Password
  const [forgotStep, setForgotStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const toast = useToast();
  const nav = useNavigate();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [forgotForm, setForgotForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const openAuth = (initialMode = 'login') => {
    setMode(initialMode);
    setRegStep(1);
    setForgotStep(1);
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsOpen(true);
  };

  const closeAuth = () => {
    setIsOpen(false);
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeAuth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ----------------------------------------------------
  // LOGIN HANDLER
  // ----------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      if (res.token) {
        localStorage.setItem('elores_customer_token', res.token);
        toast.show('Welcome back to Elores!');
        closeAuth();
        nav('/account');
      } else {
        throw new Error(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // REGISTRATION HANDLERS (Step 1: Send OTP, Step 2: Verify)
  // ----------------------------------------------------
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Strict validation
    const cleanPhone = regForm.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Mobile Number is mandatory and must be exactly 10 digits.');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          phone: cleanPhone,
          password: regForm.password,
          confirm_password: regForm.confirmPassword,
        }),
      });

      if (res.dev_otp) {
        setSuccess(`Verification code sent to ${regForm.email}. [Sandbox Code: ${res.dev_otp}]`);
        setRegForm((prev) => ({ ...prev, otp: res.dev_otp }));
      } else {
        setSuccess(`Verification code sent to ${regForm.email}. Please enter it below to create your account.`);
      }
      setRegStep(2);
      setResendCooldown(60);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = regForm.otp.trim();
    if (!cleanOtp) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: regForm.email.trim(),
          otp: cleanOtp,
        }),
      });

      if (res.token) {
        localStorage.setItem('elores_customer_token', res.token);
        toast.show('Account verified & created successfully! Welcome to Elores.');
        closeAuth();
        nav('/account');
      } else {
        toast.show(res.message || 'Registration complete. Please sign in.');
        setMode('login');
        setLoginForm({ email: regForm.email, password: '' });
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api('/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          phone: regForm.phone.replace(/[^0-9]/g, ''),
          password: regForm.password,
          confirm_password: regForm.confirmPassword,
        }),
      });
      setSuccess(`New verification code sent to ${regForm.email}!`);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // FORGOT PASSWORD HANDLERS (Step 1: Request OTP, Step 2: Verify & Reset)
  // ----------------------------------------------------
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotForm.email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/forgot-password/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: forgotForm.email.trim() }),
      });
      if (res.dev_otp) {
        setSuccess(`Password reset code sent to ${forgotForm.email}. [Sandbox Code: ${res.dev_otp}]`);
        setForgotForm((prev) => ({ ...prev, otp: res.dev_otp }));
      } else {
        setSuccess(`A 6-digit password reset code has been sent to ${forgotForm.email}.`);
      }
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not find an account with this email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerifyAndReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotForm.otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    if (forgotForm.password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (forgotForm.password !== forgotForm.confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/forgot-password/verify-reset', {
        method: 'POST',
        body: JSON.stringify({
          email: forgotForm.email.trim(),
          otp: forgotForm.otp.trim(),
          password: forgotForm.password,
          confirm_password: forgotForm.confirmPassword,
        }),
      });
      toast.show(res.message || 'Password reset successful! Please sign in.');
      setMode('login');
      setLoginForm({ email: forgotForm.email, password: '' });
      setForgotStep(1);
      setForgotForm({ email: '', otp: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Could not reset password. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api('/forgot-password/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: forgotForm.email.trim() }),
      });
      setSuccess(`New reset code sent to ${forgotForm.email}!`);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not resend reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, openAuth, closeAuth }}>
      {children}
      {isOpen && (
        <div className="authModalOverlay" onClick={closeAuth} role="dialog" aria-modal="true">
          <div
            className="authModalCard"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="authModalClose"
              onClick={closeAuth}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header / Brand Crest */}
            <div className="authModalHeader">
              <div className="authBrandCrest">
                <Sparkles size={20} className="crestIcon" />
              </div>
              <h2 className="authBrandTitle">ELORES</h2>
              <p className="authBrandSubtitle">
                {mode === 'login' && 'Sign in to access your wishlist, orders & member benefits'}
                {mode === 'register' && (regStep === 1 ? 'Create your Elores account for an exclusive jewellery experience' : 'Verify your email address to complete registration')}
                {mode === 'forgot' && (forgotStep === 1 ? 'Reset your password to regain access to your account' : 'Enter the code sent to your email to create a new password')}
              </p>
            </div>

            {/* Mode Switcher Tabs (Only shown when not in middle of multi-step flows) */}
            {mode !== 'forgot' && regStep === 1 && (
              <div className="authTabs">
                <button
                  type="button"
                  className={`authTabBtn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`authTabBtn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="authAlert authAlertError">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="authAlert authAlertSuccess">
                <CheckCircle size={15} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 1: SIGN IN */}
            {/* ---------------------------------------------------- */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="authForm">
                <div className="authField">
                  <label>Email Address</label>
                  <div className="authInputWrap">
                    <Mail size={16} className="authInputIcon" />
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="authField">
                  <div className="authFieldLabelRow">
                    <label>Password</label>
                    <button
                      type="button"
                      className="authForgotLink"
                      onClick={() => {
                        setMode('forgot');
                        setForgotStep(1);
                        setError('');
                        setSuccess('');
                        setForgotForm((prev) => ({ ...prev, email: loginForm.email }));
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="authInputWrap">
                    <Lock size={16} className="authInputIcon" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="authEyeBtn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password view"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="authSubmitBtn"
                >
                  {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  {!loading && <ArrowRight size={15} />}
                </button>

                <div className="authFooterPrompt">
                  <span>Don&apos;t have an account?</span>{' '}
                  <button
                    type="button"
                    className="authTextLink"
                    onClick={() => {
                      setMode('register');
                      setRegStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Create one now
                  </button>
                </div>
              </form>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 2: CREATE ACCOUNT */}
            {/* ---------------------------------------------------- */}
            {mode === 'register' && regStep === 1 && (
              <form onSubmit={handleRegisterSendOtp} className="authForm">
                <div className="authField">
                  <label>Full Name *</label>
                  <div className="authInputWrap">
                    <User size={16} className="authInputIcon" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Radhika Sharma"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="authField">
                  <label>Email Address * (For OTP Verification)</label>
                  <div className="authInputWrap">
                    <Mail size={16} className="authInputIcon" />
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="authField">
                  <div className="authFieldLabelRow">
                    <label>Mobile Number *</label>
                    <span style={{ fontSize: '10px', color: '#9A7B56', fontWeight: 600 }}>MANDATORY</span>
                  </div>
                  <div className="authInputWrap">
                    <Phone size={16} className="authInputIcon" />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                </div>

                <div className="authField">
                  <label>Password *</label>
                  <div className="authInputWrap">
                    <Lock size={16} className="authInputIcon" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      minLength={6}
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="authEyeBtn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password view"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="authField">
                  <label>Confirm Password *</label>
                  <div className="authInputWrap">
                    <Lock size={16} className="authInputIcon" />
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      minLength={6}
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="authEyeBtn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password view"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                    <div className="authFieldHint error">Passwords do not match</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="authSubmitBtn"
                >
                  {loading ? 'SENDING EMAIL OTP...' : 'CONTINUE WITH EMAIL OTP'}
                  {!loading && <ArrowRight size={15} />}
                </button>

                <div className="authFooterPrompt">
                  <span>Already have an account?</span>{' '}
                  <button
                    type="button"
                    className="authTextLink"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* MODE 2 - STEP 2: VERIFY EMAIL OTP */}
            {mode === 'register' && regStep === 2 && (
              <form onSubmit={handleRegisterVerifyOtp} className="authForm">
                <div className="authOtpNotice">
                  <p className="authOtpNoticeText">
                    We sent a 6-digit verification code to<br />
                    <span className="authOtpNoticeEmail">{regForm.email}</span>
                  </p>
                  <button
                    type="button"
                    className="authOtpEditBtn"
                    onClick={() => {
                      setRegStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Edit details / change email
                  </button>
                </div>

                <div className="authField">
                  <label>Enter 6-Digit Verification Code *</label>
                  <div className="authInputWrap authOtpInputWrap">
                    <ShieldCheck size={18} className="authInputIcon" />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="------"
                      autoFocus
                      value={regForm.otp}
                      onChange={(e) => setRegForm({ ...regForm, otp: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || regForm.otp.length < 6}
                  className="authSubmitBtn"
                >
                  {loading ? 'VERIFYING CODE...' : 'VERIFY & CREATE ACCOUNT'}
                  {!loading && <CheckCircle size={15} />}
                </button>

                <div className="authResendRow">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendRegisterOtp}
                    className="authResendBtn"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="authFooterPrompt" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="authTextLink"
                    onClick={() => {
                      setRegStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    ← Back to Details
                  </button>
                </div>
              </form>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 3: FORGOT PASSWORD */}
            {/* ---------------------------------------------------- */}
            {mode === 'forgot' && forgotStep === 1 && (
              <form onSubmit={handleForgotSendOtp} className="authForm">
                <div className="authField">
                  <label>Registered Email Address *</label>
                  <div className="authInputWrap">
                    <Mail size={16} className="authInputIcon" />
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={forgotForm.email}
                      onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="authSubmitBtn"
                >
                  {loading ? 'SENDING RESET CODE...' : 'SEND VERIFICATION CODE'}
                  {!loading && <ArrowRight size={15} />}
                </button>

                <div className="authFooterPrompt">
                  <button
                    type="button"
                    className="authTextLink"
                    onClick={() => {
                      setMode('login');
                      setForgotStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* MODE 3 - STEP 2: ENTER OTP & NEW PASSWORD */}
            {mode === 'forgot' && forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyAndReset} className="authForm">
                <div className="authOtpNotice">
                  <p className="authOtpNoticeText">
                    Password reset code sent to<br />
                    <span className="authOtpNoticeEmail">{forgotForm.email}</span>
                  </p>
                  <button
                    type="button"
                    className="authOtpEditBtn"
                    onClick={() => {
                      setForgotStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Change email
                  </button>
                </div>

                <div className="authField">
                  <label>6-Digit Verification Code *</label>
                  <div className="authInputWrap authOtpInputWrap">
                    <ShieldCheck size={18} className="authInputIcon" />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="------"
                      autoFocus
                      value={forgotForm.otp}
                      onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                </div>

                <div className="authField">
                  <label>New Password *</label>
                  <div className="authInputWrap">
                    <Lock size={16} className="authInputIcon" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      minLength={6}
                      value={forgotForm.password}
                      onChange={(e) => setForgotForm({ ...forgotForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="authEyeBtn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password view"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="authField">
                  <label>Confirm New Password *</label>
                  <div className="authInputWrap">
                    <Lock size={16} className="authInputIcon" />
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      minLength={6}
                      value={forgotForm.confirmPassword}
                      onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="authEyeBtn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password view"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {forgotForm.confirmPassword && forgotForm.password !== forgotForm.confirmPassword && (
                    <div className="authFieldHint error">Passwords do not match</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || forgotForm.otp.length < 6}
                  className="authSubmitBtn"
                >
                  {loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
                  {!loading && <CheckCircle size={15} />}
                </button>

                <div className="authResendRow">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendForgotOtp}
                    className="authResendBtn"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="authFooterPrompt" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="authTextLink"
                    onClick={() => {
                      setMode('login');
                      setForgotStep(1);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Trust Footer */}
            <div className="authTrustBadge">
              <ShieldCheck size={13} />
              <span>100% Secure &amp; Encrypted Customer Portal</span>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
