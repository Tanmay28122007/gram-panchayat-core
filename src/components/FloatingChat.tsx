import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, UserPlus, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { IssueCategory } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  authRedirect?: boolean;
  complaintRedirect?: boolean;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function FloatingChat({
  user,
  onReportIssue
}: {
  user: any;
  onReportIssue?: (category: IssueCategory, description: string, locationStr: string) => void;
}) {
  const { lang: globalLang } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'gu' | null>(null);

  // Function to switch language via button or header toggle
  const handleLanguageSelect = async (langKey: 'en' | 'hi' | 'gu') => {
    setSelectedLang(langKey);
    const langNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
    const userDisplayTexts = { en: 'English', hi: 'हिंदी (Hindi)', gu: 'ગુજરાતી (Gujarati)' };
    const targetLangName = langNames[langKey];

    // Show user message in chat
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userDisplayTexts[langKey]
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const sysMessage = `[SYSTEM: Selected Language = ${targetLangName}]`;
    try {
      const payload = {
        message: `${sysMessage}\nSelected language: ${targetLangName}. Please confirm in ${targetLangName} and ask how you can help.`,
        history: history.map(item => ({
          role: item.role,
          parts: item.parts
        }))
      };

      const userStatus = user ? 'LOGGED_IN' : 'ANONYMOUS';
      payload.message = `[USER_STATUS: ${userStatus}]\n` + payload.message;

      const res = await axios.post('/api/chat', payload);
      let botResponse = res.data.response || `Language set to ${targetLangName}.`;

      if (botResponse.includes('[TRIGGER_AUTH_REDIRECT]')) {
        botResponse = botResponse.replace('[TRIGGER_AUTH_REDIRECT]', '').trim();
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse
      }]);

      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userDisplayTexts[langKey] }] },
        { role: 'model', parts: [{ text: botResponse }] }
      ]);
    } catch (error) {
      console.error("Failed to set chat language", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: langKey === 'hi' 
          ? "भाषा सफलतापूर्वक हिंदी में सेट कर दी गई है। आज मैं आपकी क्या सहायता कर सकता हूँ?" 
          : langKey === 'gu'
          ? "ભાષા સફળતાપૂર્વક ગુજરાતીમાં સેટ થઈ ગઈ છે. આજે હું તમને કેવી રીતે મદદ કરી શકું?"
          : "Language set to English. How can I assist you today?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync global language toggle with backend if explicit selection hasn't happened
  useEffect(() => {
    if (messages.length > 0 && isOpen && selectedLang) {
      const targetLang = selectedLang === 'en' ? 'English' : selectedLang === 'hi' ? 'Hindi' : 'Gujarati';
      // keep active language synced
    }
  }, [globalLang]);

  // Initialize chat with language selection prompt when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: "Welcome to Sarthi AI Assistant! Please select your preferred language to respond:\n\nसारथी AI सहायक में आपका स्वागत है! कृपया उत्तर देने के लिए अपनी भाषा चुनें:\n\nસારથી AI સહાયકમાં તમારું સ્વાગત છે! કૃપા કરીને જવાબ આપવા માટે તમારી ભાષા પસંદ કરો:"
        }
      ]);
      setHistory([
        {
          role: 'model',
          parts: [{ text: "Welcome to Sarthi AI Assistant! Please select your preferred language to respond." }]
        }
      ]);
    }
  }, [isOpen]);

  // Handle auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Simulate a central Vadnagar location
  const VADNAGAR_LAT = 23.7885;
  const VADNAGAR_LNG = 72.6394;
  const SERVICE_RADIUS_KM = 20;

  const VILLAGES = [
    'Anandpura', 'Aspa', 'Babipura', 'Badarpur', 'Bajpura', 'Champa', 'Chandpur', 'Chhabaliya',
    'Dabu', 'Ganeshpura', 'Hajipur', 'Jagapura', 'Jaska', 'Kahipur', 'Kamalpur', 'Karbatiya',
    'Karshanpura', 'Kesimpa', 'Khanpur', 'Khatasana', 'Khatoda', 'Malekpur', 'Mirjhapur',
    'Molipur', 'Navapura', 'Pipaldar', 'Rajpur', 'Sabalpur', 'Sarna', 'Shahpur', 'Shekhpur',
    'Shobhasan', 'Sipor', 'Sulipur', 'Sultanpur', 'Sundhiya', 'Transvad', 'Undani', 'Undhai',
    'Vaghadi', 'Vaghdi', 'Valasana'
  ];

  const [nearestVillage, setNearestVillage] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const R = 6371; // Earth radius in km
          const dLat = (lat - VADNAGAR_LAT) * Math.PI / 180;
          const dLon = (lng - VADNAGAR_LNG) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(VADNAGAR_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          if (distance <= SERVICE_RADIUS_KM) {
            const hash = Math.floor((lat + lng) * 10000);
            const nearest = VILLAGES[hash % VILLAGES.length];
            setNearestVillage(`${nearest}, Vadnagar`);
          } else {
            setNearestVillage("OUT_OF_BOUNDS");
          }
        },
        (error) => {
          setNearestVillage("UNAVAILABLE");
        }
      );
    } else {
      setNearestVillage("UNAVAILABLE");
    }
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const activeLangName = selectedLang === 'hi' ? 'Hindi' : selectedLang === 'gu' ? 'Gujarati' : 'English';

      // API call to our Express relay
      const payload = {
        message: `[SYSTEM: Selected Language = ${activeLangName}]\nStrictly respond ONLY in ${activeLangName}.\n` + userText,
        history: history.map(item => ({
          role: item.role,
          parts: item.parts
        }))
      };

      // Add implicit location context to guide the bot
      if (history.length <= 2) {
        let locContext = "GPS Tagged Location (Top Bar Context)";
        if (nearestVillage === "OUT_OF_BOUNDS") {
          locContext = "User is outside the supported Panchayat jurisdiction. Must ask the user to specify their village.";
        } else if (nearestVillage === "UNAVAILABLE") {
          locContext = "Unknown location. Must ask the user to specify their village.";
        } else if (nearestVillage) {
          locContext = nearestVillage;
        }

        payload.message = `[SYSTEM: Active Location = "${locContext}"]\n` + payload.message;
      }

      const userStatus = user ? 'LOGGED_IN' : 'ANONYMOUS';
      payload.message = `[USER_STATUS: ${userStatus}]\n` + payload.message;

      const res = await axios.post('/api/chat', payload);
      let botResponse = res.data.response || "I didn't quite get that.";
      let authRedirect = false;
      let complaintRedirect = false;

      // Check for auth redirect token
      if (botResponse.includes('[TRIGGER_AUTH_REDIRECT]')) {
        authRedirect = true;
        botResponse = botResponse.replace('[TRIGGER_AUTH_REDIRECT]', '').trim();
      }

      // Check for complaint redirect token
      if (botResponse.includes('[TRIGGER_COMPLAINT_REDIRECT]')) {
        if (user) {
          complaintRedirect = true;
        } else {
          authRedirect = true;
        }
        botResponse = botResponse.replace('[TRIGGER_COMPLAINT_REDIRECT]', '').trim();
      }

      // Check for the escalation flag with location
      const flagMatch = botResponse.match(/\[FLAG:\s*ESCALATE_TO_SARPANCH_PORTAL\s*\|\s*CATEGORY:\s*([^|]+)\s*\|\s*LOCATION:\s*([^|]+)\s*\|\s*DESCRIPTION:\s*([^\]]+)\]/);
      if (flagMatch || botResponse.includes('[FLAG: ESCALATE_TO_SARPANCH_PORTAL]')) {
        if (user) {
          complaintRedirect = true;
        } else {
          authRedirect = true;
        }
        let extractedLocation = "Vadnagar Taluka";
        let extractedCategory = "other";
        let extractedDescription = userText;
        if (flagMatch) {
          extractedCategory = flagMatch[1].trim();
          extractedLocation = flagMatch[2].trim();
          extractedDescription = flagMatch[3].trim();
          botResponse = botResponse.replace(flagMatch[0], '').trim();
        } else {
          botResponse = botResponse.replace('[FLAG: ESCALATE_TO_SARPANCH_PORTAL]', '').trim();
        }

        // Trigger actual database write!
        import('../lib/firebase').then(async ({ submitComplaintToDatabase }) => {
          try {
            const reporterName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Citizen User";
            await submitComplaintToDatabase(
              user?.id || "unknown",
              extractedCategory,
              `${extractedDescription} (Location: ${extractedLocation})`,
              extractedLocation,
              [],
              reporterName
            );
          } catch (error) {
            console.error("Failed to submit complaint:", error);
          }
        });
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: botResponse,
        authRedirect,
        complaintRedirect
      }]);

      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: botResponse }] }
      ]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: selectedLang === 'hi' 
          ? "मुझे अभी कनेक्ट करने में समस्या आ रही है। कृपया थोड़ी देर बाद प्रयास करें।" 
          : selectedLang === 'gu'
          ? "મને અત્યારે કનેક્ટ કરવામાં મુશ્કેલી પડી રહી છે. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો."
          : "I am having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 focus:outline-none flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #FF9933 0%, #E67A00 100%)', color: 'white' }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-[#F5F5EC] rounded-2xl shadow-2xl flex flex-col z-50 border border-[#E6E1D3] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 border-b border-[#E6E1D3]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FF9933]/10">
                  <MessageSquare className="w-4 h-4 text-[#FF9933]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#3D3D3D]">Sarthi Assistant</h3>
                  <p className="text-[10px] text-[#8A8A88]">Village AI Helpdesk</p>
                </div>
              </div>

              {/* Language Switch Pills in Header */}
              <div className="flex items-center gap-1 bg-[#F5F5EC] p-1 rounded-full border border-[#E6E1D3]">
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('en')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                    selectedLang === 'en' ? 'bg-[#52796F] text-white shadow-sm' : 'text-[#5A5A50] hover:bg-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('hi')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                    selectedLang === 'hi' ? 'bg-[#52796F] text-white shadow-sm' : 'text-[#5A5A50] hover:bg-white'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('gu')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                    selectedLang === 'gu' ? 'bg-[#52796F] text-white shadow-sm' : 'text-[#5A5A50] hover:bg-white'
                  }`}
                >
                  ગુજ
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-[#F5F5EC] rounded-full transition-colors ml-1"
              >
                <X className="w-4 h-4 text-[#8A8A88]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-4" style={{ backgroundColor: '#F5F5EC' }}>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm shadow-sm whitespace-pre-wrap ${msg.sender === 'user'
                        ? "bg-[#52796F] text-white rounded-t-2xl rounded-bl-2xl"
                        : "bg-white border border-[#E6E1D3] text-[#3D3D3D] rounded-t-2xl rounded-br-2xl"
                      }`}
                  >
                    {msg.text}

                    {/* Interactive Language Selector Buttons on First Greeting */}
                    {index === 0 && msg.sender === 'bot' && (
                      <div className="mt-4 pt-3 border-t border-[#E6E1D3]/60 flex flex-col gap-2">
                        <span className="text-xs font-semibold text-[#5A5A40]">Select your language:</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLanguageSelect('en')}
                            className="w-full py-2 px-3 bg-[#F5F5EC] hover:bg-[#52796F] hover:text-white border border-[#E6E1D3] rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between text-[#3D3D3D]"
                          >
                            <span>🇬🇧 English</span>
                            <span className="text-[10px] opacity-70">Respond in English</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLanguageSelect('hi')}
                            className="w-full py-2 px-3 bg-[#F5F5EC] hover:bg-[#52796F] hover:text-white border border-[#E6E1D3] rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between text-[#3D3D3D]"
                          >
                            <span>🇮🇳 हिंदी (Hindi)</span>
                            <span className="text-[10px] opacity-70">हिंदी में उत्तर दें</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLanguageSelect('gu')}
                            className="w-full py-2 px-3 bg-[#F5F5EC] hover:bg-[#52796F] hover:text-white border border-[#E6E1D3] rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between text-[#3D3D3D]"
                          >
                            <span>🇮🇳 ગુજરાતી (Gujarati)</span>
                            <span className="text-[10px] opacity-70">ગુજરાતીમાં ઉત્તર આપો</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.authRedirect && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/citizen-register');
                          }}
                          className="px-4 py-2 bg-[#FF9933] text-white rounded-full text-xs font-semibold shadow-sm hover:bg-[#E67A00] transition-colors flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {selectedLang === 'hi' 
                            ? 'खाता बनाएं / लॉग इन करें' 
                            : selectedLang === 'gu'
                            ? 'એકાઉન્ટ બનાવો / લોગ ઇન કરો'
                            : 'Create Account / Log In'}
                        </button>
                      </div>
                    )}

                    {msg.complaintRedirect && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/citizen-dashboard/track');
                          }}
                          className="px-4 py-2 bg-[#52796F] text-white rounded-full text-xs font-semibold shadow-sm hover:bg-[#43645A] transition-colors flex items-center gap-1.5"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          {selectedLang === 'hi'
                            ? 'शिकायत पोर्टल पर जाएं (Track Complaints)'
                            : selectedLang === 'gu'
                            ? 'ફરિયાદ પોર્ટલ પર જાઓ (Track Complaints)'
                            : 'Go to Complaint Portal'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E6E1D3] p-3 rounded-t-2xl rounded-br-2xl shadow-sm">
                    <Loader2 className="w-4 h-4 text-[#8A8A88] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="bg-white p-3 border-t border-[#E6E1D3] flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  selectedLang === 'hi'
                    ? "अपना संदेश लिखें..."
                    : selectedLang === 'gu'
                    ? "તમારો સંદેશ લખો..."
                    : "Type your message..."
                }
                disabled={isLoading}
                className="flex-1 bg-[#F5F5EC] border-none rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#FF9933] outline-none placeholder-[#8A8A88] text-[#3D3D3D]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-[#52796F] text-white rounded-full hover:bg-[#43645A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
