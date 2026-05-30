import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Languages, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';

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

export function FloatingChat() {
  const { lang: globalLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  // Independent language toggle for the chat widget as requested
  const [localLang, setLocalLang] = useState<'en' | 'gu'>('en');
  
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: localLang === 'en' ? "Thank you for reaching out. An agent will be with you shortly." : "તમારો સંપર્ક કરવા બદલ આભાર. એક પ્રતિનિધિ ટૂંક સમયમાં તમારી સાથે જોડાશે."
      }]);
    }, 1000);
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
                      "px-3 py-2 rounded-2xl text-sm shadow-sm",
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
