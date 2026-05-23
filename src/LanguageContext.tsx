import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'gu';

export const translations = {
  en: {
    title: "Vocal-Local",
    subtitle: "Village OS",
    navCitizen: "Citizen App",
    navSarpanch: "Sarpanch Panel",
    navFinance: "Open Ledger",
    welcomeTitle: "Namaste! What is your complaint?",
    welcomeSub: "(Tap an icon below to report an issue or request a service via WhatsApp)",
    whatsappText: 'Or simply send "Namaste" via WhatsApp to +91-XXXXX-XXXXX',
    catWater: "Water",
    catSanitation: "Sanitation",
    catElectricity: "Electricity",
    catRoads: "Roads",
    catCertificates: "Certificates",
    catOther: "Other",
    dashboardTitle: "Traffic-Light Dashboard",
    dashboardSub: "Monitor village grievances and performance SLAs.",
    overdue: "OVERDUE",
    pending: "PENDING",
    new: "NEW",
    resolved: "RESOLVED",
    escalated: "ESCALATED TO MP/MLA",
    upvotes: "Upvotes (P0)",
    markResolved: "Mark Resolved",
    escalate: "Escalate (API)",
    proofOfFix: "Proof of Clean/Fix",
    photoVerified: "Photo verified",
    financeTitle: "Open-Ledger Dashboard",
    financeSub: "Real-time transparent view of Panchayat funds and rural expenditures.",
    fundsAllocated: "Funds Allocated",
    totalExpenditure: "Total Expenditure",
    availableBalance: "Available Balance",
    expenditureByProject: "Expenditure by Project",
    recentTransactions: "Recent Transactions",
    alertReported: "Thank you. Your issue has been registered and tagged to the Sarpanch's dashboard."
  },
  gu: {
    title: "વોકલ-લોકલ",
    subtitle: "વિલેજ OS",
    navCitizen: "નાગરિક એપ",
    navSarpanch: "સરપંચ પેનલ",
    navFinance: "ઓપન લેજર",
    welcomeTitle: "નમસ્તે! તમારી ફરિયાદ શું છે?",
    welcomeSub: "(WhatsApp દ્વારા ફરિયાદ નોંધાવવા અથવા સેવાની વિનંતી કરવા માટે નીચેના આઇકોન પર ટેપ કરો)",
    whatsappText: "અથવા ફક્ત +91-XXXXX-XXXXX પર WhatsApp દ્વારા 'Namaste' મોકલો",
    catWater: "પાણી (Water)",
    catSanitation: "સ્વચ્છતા (Sanitation)",
    catElectricity: "વીજળી (Electricity)",
    catRoads: "રસ્તા (Roads)",
    catCertificates: "પ્રમાણપત્રો (Certificates)",
    catOther: "અન્ય (Other)",
    dashboardTitle: "ટ્રાફિક-લાઇટ ડેશબોર્ડ",
    dashboardSub: "ગામની ફરિયાદો અને કામગીરીના SLAs નું નિરીક્ષણ કરો.",
    overdue: "મુદતવીતી (OVERDUE)",
    pending: "બાકી (PENDING)",
    new: "નવું (NEW)",
    resolved: "ઉકેલાયેલ (RESOLVED)",
    escalated: "MP/MLA ને મોકલેલ",
    upvotes: "મતો (P0)",
    markResolved: "ઉકેલાયેલ ચિહ્નિત કરો",
    escalate: "આગળ મોકલો (API)",
    proofOfFix: "કાર્યનો પુરાવો",
    photoVerified: "ફોટો ચકાસાયેલ છે",
    financeTitle: "ઓપન-લેજર ડેશબોર્ડ",
    financeSub: "પંચાયત ભંડોળ અને ગ્રામીણ ખર્ચનો વાસ્તવિક સમયનો પારદર્શક દૃષ્ટિકોણ.",
    fundsAllocated: "ફાળવેલ ભંડોળ",
    totalExpenditure: "કુલ ખર્ચ",
    availableBalance: "ઉપલબ્ધ બેલેન્સ",
    expenditureByProject: "પ્રોજેક્ટ મુજબ ખર્ચ",
    recentTransactions: "તાજેતરના વ્યવહારો",
    alertReported: "આભાર. તમારી ફરિયાદ નોંધવામાં આવી છે અને સરપંચના ડેશબોર્ડ પર ટેગ કરવામાં આવી છે."
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
