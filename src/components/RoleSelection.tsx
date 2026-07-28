import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, ShieldCheck, TreePine, Sunrise } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { GlobalFooter } from "./GlobalFooter";

export function RoleSelection() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <div className="flex-1 flex flex-col pt-8 pb-12 px-4 sm:px-6 sm:pt-16 sm:pb-24">
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
            {/* Floating Antigravity Circular Badge Header */}
            <div className="relative flex flex-col items-center justify-center pt-4">
              {/* Floating Container with Antigravity Motion */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex flex-col items-center"
              >
                {/* Subtle Glowing Particles */}
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -left-4 w-3 h-3 rounded-full bg-[#A3B18A]/60 blur-[1px]"
                />
                <motion.div
                  animate={{ scale: [1.2, 0.7, 1.2], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-2 -right-3 w-3.5 h-3.5 rounded-full bg-[#A3B18A]/70 blur-[1px]"
                />
                <motion.div
                  animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/2 -right-6 w-2.5 h-2.5 rounded-full bg-[#A3B18A]/50 blur-[1px]"
                />
                <motion.div
                  animate={{ scale: [1.1, 0.8, 1.1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute top-1/3 -left-6 w-2.5 h-2.5 rounded-full bg-[#A3B18A]/50 blur-[1px]"
                />

                {/* Dark Olive-Green Circular Badge */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#3A4D39] rounded-full flex items-center justify-center shadow-2xl border-2 border-[#5A6D59]/50 relative z-10 overflow-hidden ring-4 ring-[#3A4D39]/10">
                  {/* Glowing inner aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#2C3A2B] via-transparent to-[#5A6D59]/40 opacity-70" />

                  {/* Waving Indian Flag */}
                  <motion.div
                    animate={{ rotate: [-3, 3, -3], skewY: [-1.5, 1.5, -1.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20 flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g transform="translate(4, 8)">
                        {/* Saffron Band */}
                        <path d="M4 6C12 4 20 8 28 6C36 4 44 8 52 6V16C44 18 36 14 28 16C20 18 12 14 4 16V6Z" fill="#FF9933" />
                        {/* White Band */}
                        <path d="M4 16C12 14 20 18 28 16C36 14 44 18 52 16V26C44 28 36 24 28 26C20 28 12 24 4 26V16Z" fill="#FFFFFF" />
                        {/* Green Band */}
                        <path d="M4 26C12 24 20 28 28 26C36 24 44 28 52 26V36C44 38 36 34 28 36C20 38 12 34 4 36V26Z" fill="#138808" />
                        {/* Ashoka Chakra */}
                        <circle cx="28" cy="21" r="4" stroke="#000080" strokeWidth="0.8" fill="none" />
                        <line x1="28" y1="17" x2="28" y2="25" stroke="#000080" strokeWidth="0.6" />
                        <line x1="24" y1="21" x2="32" y2="21" stroke="#000080" strokeWidth="0.6" />
                        <line x1="25.2" y1="18.2" x2="30.8" y2="23.8" stroke="#000080" strokeWidth="0.5" />
                        <line x1="25.2" y1="23.8" x2="30.8" y2="18.2" stroke="#000080" strokeWidth="0.5" />
                      </g>
                    </svg>
                  </motion.div>
                </div>

                {/* Soft Floating Shadow Underneath */}
                <motion.div
                  animate={{ scale: [1, 0.75, 1], opacity: [0.35, 0.15, 0.35] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-3 bg-[#2C3A2B]/25 rounded-full blur-md mt-4"
                />
              </motion.div>

              {/* Title and Subtitle */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#3A4D39] tracking-tight mb-4">
                  {lang === "en"
                    ? "Vocal-Local Village OS"
                    : "વોકલ-લોકલ વિલેજ ઓએસ"}
                </h1>
                <p className="text-[#3A4D39]/80 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
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
      <div className="mt-16 mb-8 text-center opacity-50 flex flex-col items-center justify-center gap-2">
        <Sunrise className="w-6 h-6 text-[#A3B18A]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">
          Digital Gram Panchayat
        </span>
      </div>
      </div>
      <GlobalFooter />
    </div>
  );
}
