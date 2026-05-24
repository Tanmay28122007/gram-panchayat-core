import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { mockUsers } from '../data';

export function CitizenRegister({ onRegister }: { onRegister: (user: any) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = mockUsers.find(
      (u) => u.email === formData.identifier || u.phoneNumber === formData.identifier
    );

    if (!user) {
      setError('User Not Found');
      return;
    }

    if (user.password !== formData.password) {
      setError('Incorrect Password');
      return;
    }
    
    // Auto login
    onRegister({ ...user });
    
    // Redirect track page since they authenticated
    navigate('/citizen-dashboard/track', { replace: true });
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
        className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#52796F]/10 text-[#52796F] mb-6 shadow-sm border border-[#52796F]/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] tracking-tight mb-2">Sign In</h2>
          <p className="text-[#8B8B7A]">Welcome back to the Citizen Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-[#E6E1D3] shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Email or Phone Number</label>
            <input
              type="text"
              required
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
              placeholder="Enter your email or phone"
            />
          </div>

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
            className="w-full bg-[#52796F] text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#3d5a52] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Sign In & Continue <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-[#8B8B7A]">
              Demo Accounts:<br/>
              Phone: 9876543210 | Pass: password123<br/>
              Email: sita@example.com | Pass: password123
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
