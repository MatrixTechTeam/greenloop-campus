// src/pages/Login.jsx - Complete working version
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Fixed: changed from '../context/AuthContext' to '../contexts/AuthContext'
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, CheckCircle } from 'lucide-react';
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  return errors;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          toast.success('Successfully logged in!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        toast.error('Sign-in failed. Please try again.');
      }
    };
    handleRedirectResult();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordTouched) setPasswordErrors(validatePassword(val));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordErrors(validatePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordTouched(true);
      setPasswordErrors(errors);
      toast.error('Please meet password requirements');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. Please try again or create an account.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please create an account.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        await loginWithGoogle();
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error('Redirect fallback error:', redirectError);
          toast.error('Google sign-in failed. Please try again.');
        }
      } else {
        console.error('Google login error:', error);
        toast.error(error.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (error) {
      console.error('Reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else {
        toast.error(error.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  // Reset Success Popup
  const ResetSuccessPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-slide-up">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Link Sent!</h3>
        <p className="text-gray-500 text-sm mb-2">
          We've sent a password reset link to
        </p>
        <p className="text-green-600 font-semibold text-sm mb-6 break-all">{resetEmail}</p>
        <p className="text-gray-400 text-xs mb-6">
          Check your inbox and follow the link to reset your password.
        </p>
        <button
          onClick={() => {
            setResetSent(false);
            setResetMode(false);
            setResetEmail('');
          }}
          className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-50/50 via-white to-green-50/30">
      {resetSent && <ResetSuccessPopup />}

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Floating Leaves */}
      <div className="absolute top-20 left-[10%] animate-float opacity-10">
        <Leaf className="w-16 h-16 text-green-600" />
      </div>
      <div className="absolute bottom-20 right-[10%] animate-float delay-1000 opacity-10">
        <Leaf className="w-12 h-12 text-green-600" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 animate-slide-up">

          <Link to="/" className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mb-4 transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue your green journey</p>
          </div>

          {resetMode ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setResetEmail(''); }}
                  className="w-full text-center text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      className={`w-full px-4 py-2 pl-10 pr-12 border rounded-xl focus:outline-none focus:ring-1 transition-colors
                        ${passwordTouched && passwordErrors.length > 0
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                          : 'border-gray-200 focus:border-green-400 focus:ring-green-400'}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password validation errors */}
                  {passwordTouched && passwordErrors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordErrors.map((err) => (
                        <p key={err} className="text-xs text-red-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block shrink-0" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Password requirements hint (before touching) */}
                  {!passwordTouched && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Min. 8 characters with uppercase and lowercase letters
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-medium py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    : <><LogIn size={18} />Sign In</>}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 my-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-sm disabled:opacity-60"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  : <><GoogleIcon /><span className="text-gray-700 font-medium">Sign in with Google</span></>}
              </button>

              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;