import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, UserPlus } from 'lucide-react';
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

  // Sync language toggle with backend
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const targetLang = globalLang === 'en' ? 'English' : 'Gujarati';
      
      const sendLanguageSwitch = async () => {
        setIsLoading(true);
        const sysMessage = `[SYSTEM: Switch language to ${targetLang}]`;
        try {
          const payload = {
            message: sysMessage,
            history: history.map(item => ({
              role: item.role,
              parts: item.parts
            }))
          };

          const res = await axios.post('/api/chat', payload);
          let botResponse = res.data.response || "Language updated.";

          // Check for the escalation flag
          const flagMatch = botResponse.match(/\[FLAG:\s*ESCALATE_TO_SARPANCH_PORTAL\s*\|\s*CATEGORY:\s*([^|]+)\s*\|\s*LOCATION:\s*([^|]+)\s*\|\s*DESCRIPTION:\s*([^\]]+)\]/) || botResponse.match(/\[FLAG:\s*ESCALATE_TO_SARPANCH_PORTAL\s*\|\s*CATEGORY:\s*([^|]+)\s*\|\s*LOCATION:\s*([^\]]+)\]/);
          if (flagMatch || botResponse.includes('[FLAG: ESCALATE_TO_SARPANCH_PORTAL]')) {
            let extractedCategory = "other";
            let extractedDescription = sysMessage;
            if (flagMatch) {
              extractedCategory = flagMatch[1].trim();
              if (flagMatch[3]) extractedDescription = flagMatch[3].trim();
              botResponse = botResponse.replace(flagMatch[0], '').trim();
            } else {
              botResponse = botResponse.replace('[FLAG: ESCALATE_TO_SARPANCH_PORTAL]', '').trim();
            }
            import('../lib/firebase').then(async ({ submitComplaintToDatabase }) => {
              try {
                const reporterName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Citizen User";
                await submitComplaintToDatabase(
                  user?.id || "unknown", 
                  extractedCategory,
                  extractedDescription,
                  "Vadnagar Taluka",
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
            text: botResponse
          }]);

          setHistory(prev => [
            ...prev,
            { role: 'user', parts: [{ text: sysMessage }] },
            { role: 'model', parts: [{ text: botResponse }] }
          ]);
        } catch (error) {
          console.error("Failed to sync language switch");
        } finally {
          setIsLoading(false);
        }
      };

      sendLanguageSwitch();
    }
  }, [globalLang]);

  // Initialize chat when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: "I am Sarthi, your assistant. How can I help you? / હું સારથી છું, તમારો સહાયક. હું તમને કેવી રીતે મદદ કરી શકું?"
        }
      ]);
      setHistory([
        {
          role: 'model',
          parts: [{ text: "I am Sarthi, your assistant. How can I help you? / હું સારથી છું, તમારો સહાયક. હું તમને કેવી રીતે મદદ કરી શકું?" }]
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
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(VADNAGAR_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
      // API call to our Express relay
      const payload = {
        message: userText,
        history: history.map(item => ({
          role: item.role,
          parts: item.parts
        }))
      };

      // Add implicit location context to guide the bot
      if (history.length === 1) {
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

      // Check for auth redirect token
      if (botResponse.includes('[TRIGGER_AUTH_REDIRECT]')) {
        authRedirect = true;
        botResponse = botResponse.replace('[TRIGGER_AUTH_REDIRECT]', '').trim();
      }

      // Check for the escalation flag with location
      const flagMatch = botResponse.match(/\[FLAG:\s*ESCALATE_TO_SARPANCH_PORTAL\s*\|\s*CATEGORY:\s*([^|]+)\s*\|\s*LOCATION:\s*([^|]+)\s*\|\s*DESCRIPTION:\s*([^\]]+)\]/);
      if (flagMatch || botResponse.includes('[FLAG: ESCALATE_TO_SARPANCH_PORTAL]')) {
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
        
        // Triger actual database write!
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
        authRedirect
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
        text: "I am having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 focus:outline-none"
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
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-[#F5F5EC] rounded-2xl shadow-2xl flex flex-col z-50 border border-[#E6E1D3] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 border-b border-[#E6E1D3]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FF9933]/10">
                  <MessageSquare className="w-5 h-5 text-[#FF9933]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3D3D3D]">Sarthi Assistant</h3>
                  <p className="text-xs text-[#8A8A88]">Always here to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#F5F5EC] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#8A8A88]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-4" style={{ backgroundColor: '#F5F5EC' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm shadow-sm whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? "bg-[#52796F] text-white rounded-t-2xl rounded-bl-2xl"
                        : "bg-white border border-[#E6E1D3] text-[#3D3D3D] rounded-t-2xl rounded-br-2xl"
                    }`}
                  >
                    {msg.text}
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
                          Create Account / Log In
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
                placeholder="Type your message..."
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
