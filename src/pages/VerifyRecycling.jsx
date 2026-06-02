// src/pages/Register.jsx - Updated for Light Theme
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    faculty: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (!agreeTerms) {
      toast.error('Please agree to the Terms and Conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.fullname);
      toast.success('Account created successfully! Please verify your email.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup error:', error);
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-[5%] animate-float opacity-10">
        <Leaf className="w-20 h-20 text-primary-600" />
      </div>
      <div className="absolute bottom-20 right-[5%] animate-float delay-1000 opacity-10">
        <Leaf className="w-16 h-16 text-sage-600" />
      </div>
      
      {/* Register Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join GreenLoop Campus</h1>
            <p className="text-gray-500 text-sm mt-1">Start your sustainability journey today</p>
          </div>
          
          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="input-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="input-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-12"
                  placeholder="•••••••• (min. 6 characters)"
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
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="input-label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Department */}
            <div>
              <label className="input-label">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Environmental Science">Environmental Science</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Sciences">Sciences</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Faculty */}
            <div>
              <label className="input-label">Faculty</label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Faculty</option>
                <option value="Engineering">Faculty of Engineering</option>
                <option value="Science">Faculty of Science</option>
                <option value="Social Sciences">Faculty of Social Sciences</option>
                <option value="Arts">Faculty of Arts</option>
                <option value="Management">Faculty of Management</option>
                <option value="Agriculture">Faculty of Agriculture</option>
              </select>
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="spinner-sm"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="divider my-6">
            <div className="divider-line"></div>
            <span>Or sign up with</span>
            <div className="divider-line"></div>
          </div>
          
          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-sm"
          >
            <GoogleIcon />
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>
          
          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Join thousands of students making a difference 🌍
        </p>
      </div>
    </div>
  );
};

export default Register;