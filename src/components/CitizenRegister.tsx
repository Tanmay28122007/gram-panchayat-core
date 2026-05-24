import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import axios from 'axios';

export function CitizenRegister({ onRegister }: { onRegister: (user: any) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    identifier: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await axios.post('/api/auth/login', {
          identifier: formData.identifier,
          password: formData.password
        });
        localStorage.setItem('authToken', data.token);
        onRegister(data.user);
      } else {
        const { data } = await axios.post('/api/auth/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        });
        localStorage.setItem('authToken', data.token);
        onRegister(data.user);
      }
      navigate('/citizen-dashboard/track', { replace: true });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        if (err.response.data.error.includes('already exists')) {
            setIsLogin(true);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative justify-center px-4">
      <div className="absolute top-8 left-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 p-2 hover:bg-[#F4F1EA] rounded-full text-[#5A5A40] text-sm font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto py-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#52796F]/10 text-[#52796F] mb-6 shadow-sm border border-[#52796F]/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] tracking-tight mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-[#8B8B7A]">
            {isLogin ? 'Welcome back to the Citizen Portal' : 'Register to manage your complaints'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-[#E6E1D3] shadow-sm">
          <div className="flex bg-[#F4F1EA] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors ${
                isLogin ? 'bg-white text-[#52796F] shadow-sm' : 'text-[#8B8B7A] hover:text-[#5A5A40]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors ${
                !isLogin ? 'bg-white text-[#52796F] shadow-sm' : 'text-[#8B8B7A] hover:text-[#5A5A40]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">First Name</label>
                      <input
                        type="text"
                        required={!isLogin}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Last Name</label>
                      <input
                        type="text"
                        required={!isLogin}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      required={!isLogin}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="flex gap-2">
                       <span className="inline-flex items-center px-4 py-3 border border-[#E6E1D3] bg-[#F4F1EA] text-[#8B8B7A] rounded-xl text-sm font-bold">
                         +91
                       </span>
                      <input
                        type="tel"
                        required={!isLogin}
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Email or Phone Number</label>
                    <input
                      type="text"
                      required={isLogin}
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D] pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8B7A] hover:text-[#5A5A40] transition-colors flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

             <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#52796F] text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#3d5a52]'}`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In & Continue' : 'Create Account & Continue')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
