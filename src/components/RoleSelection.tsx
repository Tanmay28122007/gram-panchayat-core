import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, ShieldCheck, TreePine, Sunrise } from "lucide-react";
import { useLanguage } from "../LanguageContext";

export function RoleSelection() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col pt-8 pb-12 px-4 sm:px-6 sm:pt-16 sm:pb-24">
      {/* Header & Language Toggle */}
      <div className="max-w-5xl mx-auto w-full flex justify-end mb-8">
        <button
          onClick={() => setLang(lang === "en" ? "gu" : "en")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E6E1D3] text-sm font-bold text-[#5A5A40] hover:bg-[#F4F1EA] transition-colors bg-white shadow-sm"
          title="Change Language"
        >
          {lang === "en" ? "ગુજરાતી" : "English"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-5xl w-full mx-auto space-y-16">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-[#5A5A40] rounded-full flex items-center justify-center shadow-lg"
            >
              <TreePine className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2C2C1E] tracking-tight mb-4">
                {lang === "en"
                  ? "Vocal-Local Village OS"
                  : "વોકલ-લોકલ વિલેજ ઓએસ"}
              </h1>
              <p className="text-[#5A5A40] text-lg sm:text-xl max-w-2xl mx-auto font-medium">
                {lang === "en"
                  ? "Welcome to the Digital Gram Panchayat. Please select your role to continue."
                  : "ડિજિટલ ગ્રામ પંચાયતમાં આપનું સ્વાગત છે. કૃપા કરીને આગળ વધવા માટે તમારી ભૂમિકા પસંદ કરો."}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* Citizen Card */}
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              onClick={() => navigate("/citizen-dashboard")}
              className="group bg-white rounded-[32px] p-8 sm:p-10 border-2 border-[#E6E1D3] hover:border-[#52796F] hover:shadow-xl transition-all text-left flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-[#52796F]/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3B18A]/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

              <div className="w-16 h-16 bg-[#F4F1EA] rounded-2xl flex items-center justify-center mb-8 border border-[#E6E1D3] group-hover:bg-[#52796F] transition-colors relative z-10">
                <Users className="w-8 h-8 text-[#5A5A40] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] mb-4 relative z-10">
                {lang === "en" ? "Citizen" : "નાગરિક"}
              </h2>
              <p className="text-[#5A5A40] text-lg leading-relaxed relative z-10 flex-1">
                {lang === "en"
                  ? "Access live weather, crop prices, and public services."
                  : "લાઇવ હવામાન, પાકના ભાવ અને જાહેર સેવાઓ ઍક્સેસ કરો."}
              </p>
              <div className="mt-8 flex items-center text-[#52796F] font-bold tracking-widest uppercase text-sm relative z-10">
                {lang === "en" ? "Enter Portal" : "પોર્ટલમાં દાખલ થાવ"} &rarr;
              </div>
            </motion.button>

            {/* Sarpanch Card */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={() => navigate("/sarpanch-login")}
              className="group bg-white rounded-[32px] p-8 sm:p-10 border-2 border-[#E6E1D3] hover:border-[#8B5A2B] hover:shadow-xl transition-all text-left flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5A2B]/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

              <div className="w-16 h-16 bg-[#F4F1EA] rounded-2xl flex items-center justify-center mb-8 border border-[#E6E1D3] group-hover:bg-[#8B5A2B] transition-colors relative z-10">
                <ShieldCheck className="w-8 h-8 text-[#5A5A40] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#2C2C1E] mb-4 relative z-10">
                {lang === "en" ? "Sarpanch" : "સરપંચ"}
              </h2>
              <p className="text-[#5A5A40] text-lg leading-relaxed relative z-10 flex-1">
                {lang === "en"
                  ? "Admin login to manage village records and budgets."
                  : "ગામના રેકોર્ડ્સ અને બજેટનું સંચાલન કરવા એડમિન લૉગિન."}
              </p>
              <div className="mt-8 flex items-center text-[#8B5A2B] font-bold tracking-widest uppercase text-sm relative z-10">
                {lang === "en" ? "Secure Login" : "સુરક્ષિત લૉગિન"} &rarr;
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer decoration */}
      <div className="mt-16 text-center opacity-50 flex flex-col items-center justify-center gap-2">
        <Sunrise className="w-6 h-6 text-[#A3B18A]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">
          Digital Gram Panchayat
        </span>
      </div>
    </div>
  );
}
