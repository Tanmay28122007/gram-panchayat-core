import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function CitizenRegister({ onRegister }: { onRegister: (user: any) => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  });

  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setFormData({ ...formData, phoneNumber: val });
    }
    if (val.length > 0 && val.length < 10) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phoneNumber.length < 10) {
      setPhoneError('Phone number must be 10 digits');
      return;
    }
    
    // Auto login
    onRegister({ ...formData, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() });
    
    // Redirect back
    if (category) {
      navigate(`/citizen-dashboard/services?category=${category}`, { replace: true });
    } else {
      navigate('/citizen-dashboard/services', { replace: true });
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
        className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#52796F]/10 text-[#52796F] mb-6 shadow-sm border border-[#52796F]/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] tracking-tight mb-2">Create Account</h2>
          <p className="text-[#8B8B7A]">Please register to proceed with your complaint</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-[#E6E1D3] shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Phone Number</label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-4 py-3 border border-[#E6E1D3] bg-[#F4F1EA] text-[#8B8B7A] rounded-xl text-sm font-bold">
                +91
              </span>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
                placeholder="0000000000"
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8B8B7A] uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E6E1D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#3D3D3D]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#52796F] text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#3d5a52] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Create Account & Continue <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
