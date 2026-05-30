import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Languages, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

const chatTranslations = {
  en: {
    header: "Support Chat",
    welcome: "Hello! How can we help you today?",
    placeholder: "Type your message...",
    send: "Send",
  },
  gu: {
    header: "સહાય ચેટ",
    welcome: "નમસ્તે! આજે અમે તમને કેવી રીતે મદદ કરી શકીએ?",
    placeholder: "તમારો સંદેશ લખો...",
    send: "મોકલો",
  }
};

export function FloatingChat({ 
  user, 
  onAddIssue 
}: { 
  user: any;
  onAddIssue: (issue: any) => void;
}) {
  const { lang: globalLang } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [localLang, setLocalLang] = useState<'en' | 'gu'>('en');
  
  type ChatState = 'IDLE' | 'AWAITING_LOGIN' | 'GATHER_CATEGORY' | 'GATHER_DESCRIPTION';
  const [chatState, setChatState] = useState<ChatState>('IDLE');
  const [pendingCategory, setPendingCategory] = useState<string>('');

  // Sync initial language with global context if needed, but we keep it independent
  useEffect(() => {
    if (globalLang === 'en' || globalLang === 'gu') {
      setLocalLang(globalLang as 'en' | 'gu');
    }
  }, [globalLang]);

  const t = chatTranslations[localLang];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Post-registration handshake
  useEffect(() => {
    if (user && chatState === 'AWAITING_LOGIN') {
      setChatState('GATHER_CATEGORY');
      setTimeout(() => {
        addBotMessage(
          localLang === 'en' 
            ? "Welcome! Your account is ready. Let's get your issue resolved right away. Which category/department does your complaint belong to? (e.g., Water Supply, Roads, Electricity, Sanitation)"
            : "સ્વાગત છે! તમારું એકાઉન્ટ તૈયાર છે. ચાલો શરૂ કરીએ. તમારી ફરિયાદ કયા વિભાગની છે? (દા.ત., પાણી પુરવઠો, રસ્તા, વીજળી, સ્વચ્છતા)"
        );
      }, 500);
    }
  }, [user, chatState, localLang]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      sender: 'bot',
      text
    }]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    const lower = userText.toLowerCase();

    // Intent Detection & State Machine
    setTimeout(() => {
      if (chatState === 'IDLE') {
        const isComplaint = lower.includes('complaint') || lower.includes('grievance') || lower.includes('issue') || lower.includes('ફરિયાદ') || lower.includes('સમસ્યા');
        
        if (isComplaint) {
          if (!user) {
            setChatState('AWAITING_LOGIN');
            addBotMessage(
              "REDIRECT_TO_REGISTER\n\n" + (localLang === 'en'
                ? "I see you want to file a complaint. To securely track it, you need an account. I have opened the registration page for you. Please fill it out, and I will be waiting right here to take your complaint the moment you are done!"
                : "હું જોઉં છું કે તમે ફરિયાદ નોંધાવવા માંગો છો. તેને સુરક્ષિત રીતે ટ્રૅક કરવા માટે, તમારે એકાઉન્ટની જરૂર છે. મેં તમારા માટે નોંધણી પૃષ્ઠ ખોલ્યું છે. કૃપા કરીને તેને ભરો, અને હું તમારી ફરિયાદ લેવા માટે અહીં જ રાહ જોઈશ!")
            );
            navigate('/citizen-register');
          } else {
            setChatState('GATHER_CATEGORY');
            addBotMessage(
              localLang === 'en'
                ? "Which category/department does your complaint belong to? (e.g., Water Supply, Roads, Electricity, Sanitation)"
                : "તમારી ફરિયાદ કયા વિભાગની છે? (દા.ત., પાણી પુરવઠો, રસ્તા, વીજળી, સ્વચ્છતા)"
            );
          }
        } else {
          addBotMessage(
            localLang === 'en' 
              ? "Thank you for reaching out. How can I assist you with the portal?" 
              : "તમારો સંપર્ક કરવા બદલ આભાર. હું તમને કેવી રીતે મદદ કરી શકું?"
          );
        }
      } else if (chatState === 'GATHER_CATEGORY') {
        setPendingCategory(userText);
        setChatState('GATHER_DESCRIPTION');
        addBotMessage(
          localLang === 'en'
            ? "Got it. Now, please describe your complaint in detail. You can write in your own words."
            : "સમજાયું. હવે, કૃપા કરીને તમારી ફરિયાદનું વિગતવાર વર્ણન કરો. તમે તમારા પોતાના શબ્દોમાં લખી શકો છો."
        );
      } else if (chatState === 'GATHER_DESCRIPTION') {
        // Submit the complaint
        const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
        
        const issue = {
          id: ticketId,
          title: `${pendingCategory} Issue`,
          category: 'other', // fallback, actual category matching could be complex
          description: userText,
          location: 'Reported via Assistant',
          reporter: user?.name || 'Anonymous',
          reporterId: user?.id,
          upvotes: 0,
          status: 'green',
          reportedAt: new Date().toISOString(),
          escalated: false,
        };

        onAddIssue(issue);
        
        setChatState('IDLE');
        setPendingCategory('');
        
        const payload = {
          event: "LODGE_COMPLAINT",
          citizen_id: user?.id || "unknown",
          category: pendingCategory,
          description: userText,
          status: "Pending"
        };
        
        const confirmationMessage = localLang === 'en'
            ? `Your complaint has been successfully registered! Your Ticket ID is ${ticketId}. The Sarpanch has been notified instantly.`
            : `તમારી ફરિયાદ સફળતાપૂર્વક નોંધણી થઈ ગઈ છે! તમારો ટિકિટ સુરક્ષા નંબર ${ticketId} છે. સરપંચને તુરંત જ જાણ કરવામાં આવી છે.`;
            
        addBotMessage(
          `${confirmationMessage}\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``
        );
      }
    }, 600);
  };

  const toggleLanguage = () => {
    setLocalLang((prev) => prev === 'en' ? 'gu' : 'en');
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      // Dragging is applied via CSS transform to the fixed position element.
      // This allows moving both the bubble and the opened window anywhere.
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, touchAction: 'none' }}
      className="flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white border border-[#E6E1D3] shadow-2xl rounded-2xl w-80 sm:w-80 h-[400px] mb-4 flex flex-col overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // Allow dragging from inside, but inputs will stop propagation later
          >
            {/* Header - Drag Handle */}
            <div className="bg-[#52796F] text-white px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold text-sm">{t.header}</span>
              </div>
              
              <div className="flex items-center gap-2 pointer-events-auto">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-[10px] font-bold tracking-wider"
                  title="Toggle Language"
                >
                  <Languages className="w-3 h-3" />
                  {localLang === 'en' ? 'GUJ' : 'EN'}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#FDFBF7] flex flex-col gap-3 cursor-text" onPointerDown={(e) => e.stopPropagation()}>
              
              {/* Initial Welcome Message */}
              <div className="flex flex-col items-start max-w-[85%]">
                 <div className="bg-[#E6E1D3] text-[#3D3D3D] px-3 py-2 rounded-2xl rounded-tl-sm text-sm border border-[#D5CDB8]">
                   {t.welcome}
                 </div>
              </div>

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === 'user' ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap font-sans",
                      msg.sender === 'user' 
                        ? "bg-[#52796F] text-white rounded-tr-sm" 
                        : "bg-white border border-[#E6E1D3] text-[#3D3D3D] rounded-tl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E6E1D3] bg-white flex items-center gap-2 cursor-text" onPointerDown={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-[#F4F1EA] border border-[#E6E1D3] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F]/50 text-[#2C2C1E] placeholder:text-[#8B8B7A]"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-full bg-[#52796F] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#43645A] transition-colors shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble / Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-[#52796F] text-white flex items-center justify-center shadow-lg shadow-[#52796F]/30 border-2 border-white pointer-events-auto cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
