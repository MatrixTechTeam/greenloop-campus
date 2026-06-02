// src/pages/Login.jsx - Updated for Light Theme
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
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
      setResetMode(false);
      setResetEmail('');
    } catch (error) {
      console.error('Reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google Icon SVG component
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-50/50 via-white to-sage-50/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sage-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      {/* Floating Leaves */}
      <div className="absolute top-20 left-[10%] animate-float opacity-10">
        <Leaf className="w-16 h-16 text-primary-600" />
      </div>
      <div className="absolute bottom-20 right-[10%] animate-float delay-1000 opacity-10">
        <Leaf className="w-12 h-12 text-sage-600" />
      </div>
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenLoop Campus</h1>
            <p className="text-gray-500">AI-Powered Sustainability Platform</p>
          </div>
          
          {/* Reset Password Form */}
          {resetMode ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner-sm"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-12"
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
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="spinner-sm"></div>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </form>
              
              {/* Divider */}
              <div className="divider my-6">
                <div className="divider-line"></div>
                <span>Or continue with</span>
                <div className="divider-line"></div>
              </div>
              
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-sm"
              >
                <GoogleIcon />
                <span className="text-gray-700 font-medium">Sign in with Google</span>
              </button>
              
              {/* Sign Up Link */}
              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </>
          )}
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;