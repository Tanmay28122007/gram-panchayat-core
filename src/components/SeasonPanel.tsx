import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { 
  CloudRain, ThermometerSun, Droplets, Wind, 
  AlertTriangle, Radar, Sprout, Wheat 
} from 'lucide-react';

interface WeatherData {
  city: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall24h: number;
}

export function SeasonPanel() {
  const { t, lang } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/v1/weather');
        const data = await res.json();
        if (data.weather) {
          setWeatherData(data.weather);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getAdvisories = (weather: WeatherData) => {
    const advisories = [];
    
    // Rule 1: Cotton Pest Warning
    if (weather.humidity > 80 && weather.tempMax >= 25 && weather.tempMax <= 30) {
      advisories.push({
        crop: lang === 'en' ? 'Cotton' : 'કપાસ',
        icon: Sprout,
        text: lang === 'en' ? 'High risk of pest infestation (Aphids/Jassids). Apply neem-based pesticides or standard insecticides.' : 'જીવાતોના ઉપદ્રવનું ઉચ્ચ જોખમ. લીમડા આધારિત જંતુનાશકોનો ઉપયોગ કરો.',
        color: 'text-red-700 bg-red-50 border-red-200'
      });
    }

    // Rule 2: Groundnut Sowing
    if (weather.rainfall24h > 20 && weather.tempMax >= 25 && weather.tempMax <= 35) {
      advisories.push({
        crop: lang === 'en' ? 'Groundnut' : 'મગફળી',
        icon: Wheat,
        text: lang === 'en' ? 'Favorable conditions for sowing. Ensure fields have proper drainage.' : 'વાવણી માટે સાનુકૂળ સ્થિતિ. ખાતરી કરો કે ખેતરોમાં યોગ્ય ડ્રેનેજ છે.',
        color: 'text-green-700 bg-green-50 border-green-200'
      });
    }

    // Rule 3: Cumin (Jeera) Fungal Infection
    if (weather.tempMin < 25 && weather.humidity > 70) {
      advisories.push({
        crop: lang === 'en' ? 'Cumin (Jeera)' : 'જીરું',
        icon: Sprout,
        text: lang === 'en' ? 'Risk of blight fungal infection. Avoid over-watering and monitor leaves.' : 'ફંગલ ચેપનું જોખમ. વધુ પડતું પાણી આપવાનું ટાળો.',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
      });
    }

    // Rule 4: General Heat Stress
    if (weather.tempMax >= 40) {
      advisories.push({
        crop: lang === 'en' ? 'Livestock & General' : 'પશુધન અને સામાન્ય',
        icon: ThermometerSun,
        text: lang === 'en' ? 'Severe heat stress risk. Provide shade to livestock. Do not apply urea/fertilizers.' : 'ગરમીના તણાવનું જોખમ. પશુધનને છાંયો આપો. ખાતર નાખશો નહીં.',
        color: 'text-orange-700 bg-orange-50 border-orange-200'
      });
    }

    // Rule 5: Avoid Spraying
    if (weather.rainfall24h > 0) {
       advisories.push({
        crop: lang === 'en' ? 'General' : 'સામાન્ય',
        icon: CloudRain,
        text: lang === 'en' ? 'Rainfall detected. Avoid spraying pesticides or fertilizers today.' : 'વરસાદ પડ્યો છે. આજે જંતુનાશકો અથવા ખાતર છાંટવાનું ટાળો.',
        color: 'text-[#5A5A40] bg-[#F4F1EA] border-[#E6E1D3]'
      });
    }

    // Default if no specific rules hit
    if (advisories.length === 0) {
      advisories.push({
        crop: lang === 'en' ? 'General' : 'સામાન્ય',
        icon: Sprout,
        text: lang === 'en' ? 'Weather is neutral. Continue standard farming practices.' : 'હવામાન અનુકૂળ છે. પ્રમાણભૂત ખેતી પદ્ધતિઓ ચાલુ રાખો.',
        color: 'text-[#5A5A40] bg-[#F4F1EA] border-[#E6E1D3]'
      });
    }

    return advisories;
  };

  const primaryWeather = weatherData[0]; // Assume first is local district
  const isEmergency = primaryWeather && primaryWeather.rainfall24h > 50;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-[#5A5A40]/10 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-[#2C2C1E]">{t.weatherTitle}</h2>
          <p className="text-[#8B8B7A] text-sm">{t.weatherSub}</p>
        </div>
      </div>

      {isEmergency && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white p-4 rounded-[16px] shadow-lg flex items-start gap-4 border-2 border-red-700"
        >
          <div className="bg-white text-red-600 p-2 rounded-full mt-1 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg uppercase tracking-wide">{t.emergencyAlert}</h3>
            <p className="text-red-100 font-medium">{t.heavyRainfall}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Weather Section */}
        <div className="lg:col-span-1 space-y-6">
          {loading ? (
             <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E6E1D3] h-[300px] animate-pulse">
               <div className="h-8 bg-[#E6E1D3] rounded w-1/2 mb-8"></div>
               <div className="space-y-4">
                 <div className="h-12 bg-[#E6E1D3] rounded"></div>
                 <div className="h-12 bg-[#E6E1D3] rounded"></div>
               </div>
             </div>
          ) : primaryWeather && (
             <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E6E1D3] flex flex-col items-center">
                 <h3 className="text-lg font-serif font-bold text-[#2C2C1E] mb-6 w-full text-center pb-4 border-b border-[#E6E1D3]">
                    {primaryWeather.city}
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-[#F4F1EA] rounded-[16px] p-4 flex flex-col items-center justify-center">
                      <ThermometerSun className="w-6 h-6 text-[#D46A43] mb-2" />
                      <span className="text-2xl font-light text-[#2C2C1E]">{primaryWeather.tempMax}&deg;</span>
                      <span className="text-[10px] font-bold text-[#8B8B7A] uppercase">{t.tempMax}</span>
                    </div>
                    <div className="bg-[#F4F1EA] rounded-[16px] p-4 flex flex-col items-center justify-center">
                      <ThermometerSun className="w-6 h-6 text-blue-500 mb-2" />
                      <span className="text-2xl font-light text-[#2C2C1E]">{primaryWeather.tempMin}&deg;</span>
                      <span className="text-[10px] font-bold text-[#8B8B7A] uppercase">{t.tempMin}</span>
                    </div>
                    <div className="bg-[#F4F1EA] rounded-[16px] p-4 flex flex-col items-center justify-center">
                      <Droplets className="w-6 h-6 text-[#52796F] mb-2" />
                      <span className="text-2xl font-light text-[#2C2C1E]">{primaryWeather.humidity}%</span>
                      <span className="text-[10px] font-bold text-[#8B8B7A] uppercase">{t.humidity}</span>
                    </div>
                    <div className="bg-[#FFE5E5] rounded-[16px] p-4 flex flex-col items-center justify-center">
                      <CloudRain className="w-6 h-6 text-red-600 mb-2" />
                      <span className="text-2xl font-bold text-red-900">{primaryWeather.rainfall24h}mm</span>
                      <span className="text-[10px] font-bold text-red-700 uppercase">{t.rainfall}</span>
                    </div>
                 </div>
             </div>
          )}

          {/* Radar Embed Placeholder / Link */}
          <div className="bg-[#5A5A40] text-white rounded-[24px] p-6 shadow-sm border border-[#E6E1D3]">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/20 rounded-xl"><Radar className="w-5 h-5 text-green-300" /></div>
               <div>
                  <h3 className="font-bold">{t.liveRadar}</h3>
                  <p className="text-[10px] text-white/70 uppercase">{t.radarDesc}</p>
               </div>
            </div>
            <a 
              href="https://mausam.imd.gov.in/ahmedabad/" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
            >
               Open External Radar
            </a>
          </div>
        </div>

        {/* Smart Advisories Section */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E6E1D3] h-full">
               <div className="flex items-center gap-2 mb-6">
                 <Wind className="w-5 h-5 text-[#A3B18A]" />
                 <h3 className="text-lg font-serif font-bold text-[#2C2C1E]">{t.agriAdvisories}</h3>
               </div>

               <div className="space-y-4">
                 {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-[#F4F1EA] rounded-[16px] animate-pulse"></div>
                    ))
                 ) : (
                    primaryWeather && getAdvisories(primaryWeather).map((adv, idx) => {
                      const Icon = adv.icon;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className={`p-4 rounded-[16px] border flex gap-4 ${adv.color}`}
                        >
                          <div className="mt-1">
                            <Icon className="w-5 h-5 opacity-80" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">{adv.crop}</h4>
                            <p className="text-sm font-medium opacity-90 leading-relaxed">{adv.text}</p>
                          </div>
                        </motion.div>
                      );
                    })
                 )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
