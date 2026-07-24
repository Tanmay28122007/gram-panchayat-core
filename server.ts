import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';
const LEDGER_FILE = path.join(process.cwd(), 'ledger.json');
const PROJECTS_FILE = path.join(process.cwd(), 'projects.json');

function loadLedger(): any[] {
  if (fs.existsSync(LEDGER_FILE)) {
    return JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8'));
  }
  return [];
}

function saveLedger(data: any[]) {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(data, null, 2));
}

function loadProjects(): any[] {
  if (fs.existsSync(PROJECTS_FILE)) {
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
  }
  return [];
}

function saveProjects(data: any[]) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));
}

const BUDGET_FILE = path.join(process.cwd(), 'villageBudget.json');

function loadVillageBudget(): { totalFund: number } {
  if (fs.existsSync(BUDGET_FILE)) {
    return JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf-8'));
  }
  return { totalFund: 5000000 };
}

function saveVillageBudget(data: { totalFund: number }) {
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(data, null, 2));
}

// Initial mock data if empty
if (!fs.existsSync(PROJECTS_FILE)) {
  saveProjects([
    {
      id: 'proj-1',
      name: 'Primary School Solar Panels',
      estimatedCost: 250000,
      category: 'Solar Energy',
      status: 'Completed',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
}
function loadUsers(): any[] {
  if (fs.existsSync(USERS_FILE)) {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  }
  return [];
}

function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function seedAdminUser() {
  try {
    const users = loadUsers();
    const adminEmail = 'admin@villageos.gov.in';
    const exists = users.find(u => u.email && u.email.trim().toLowerCase() === adminEmail);
    if (!exists) {
      console.log(`[Autoseed] Seeding admin user: ${adminEmail}...`);
      const hashedPassword = await bcrypt.hash('123456789', 10);
      const adminUser = {
        id: 'USR-ADMIN',
        firstName: 'Admin',
        lastName: 'Panchayat',
        phoneNumber: '1234567890',
        email: adminEmail,
        password: hashedPassword
      };
      users.push(adminUser);
      saveUsers(users);
      console.log('[Autoseed] Admin user seeded successfully.');
    } else {
      console.log('[Autoseed] Admin user already exists in users.json.');
    }
  } catch (err: any) {
    console.error('[Autoseed] Error seeding admin user:', err.message);
  }
}

interface Scheme {
  title: string;
  description: string;
  url: string;
}

let schemesCache: {
  data: Scheme[];
  lastFetch: number;
} = {
  data: [
    { title: "Pradhan Mantri Jan Dhan Yojana", description: "A National Mission for Financial Inclusion to ensure access to financial services.", url: "https://pmjdy.gov.in/" },
    { title: "Atal Pension Yojana", description: "Providing social security to workers in unorganised sector.", url: "https://pfrda.org.in/" },
    { title: "Swachh Bharat Mission", description: "Universal sanitation coverage scheme.", url: "https://swachhbharatmission.gov.in" }
  ], // Fallback data if everything fails
  lastFetch: 0
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchSchemes() {
  const now = Date.now();
  if (schemesCache.lastFetch > 0 && now - schemesCache.lastFetch < CACHE_DURATION) {
    return schemesCache.data;
  }

  try {
    const { data } = await axios.get('https://www.india.gov.in/my-government/schemes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);
    const schemes: Scheme[] = [];

    $('.view-content .views-row').each((i, el) => {
      // Typically on india.gov.in
      const titleEl = $(el).find('h3 a, .views-field-title a');
      let title = titleEl.text().trim();
      
      const pWrapper = $(el).find('p, .views-field-body');
      let description = pWrapper.text().trim();
      
      const url = titleEl.attr('href') || $(el).find('a').attr('href') || '#';
      
      const fullUrl = url.startsWith('/') ? `https://www.india.gov.in${url}` : url;

      if (!description) {
        description = "Official government scheme. Click for more details.";
      }

      if (title) {
        schemes.push({
          title,
          description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
          url: fullUrl
        });
      }
    });

    if (schemes.length > 0) {
      schemesCache = {
        data: schemes.slice(0, 6),
        lastFetch: now
      };
    }
  } catch (error) {
    console.error('Failed to fetch schemes, using fallback cache');
  }

  return schemesCache.data;
}

interface SchemeCategory {
  id: string;
  title_en: string;
  title_gu: string;
  icon_type: string;
  target_url: string;
}

let categoriesCache: {
  data: SchemeCategory[];
  lastFetch: number;
} = {
  data: [],
  lastFetch: 0
};

interface WeatherData {
  city: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall24h: number;
}

let weatherCache: {
  data: WeatherData[];
  lastFetch: number;
} = {
  data: [
    { city: "Ahmedabad", tempMax: 30, tempMin: 23, humidity: 85, rainfall24h: 55 },
    { city: "Bhuj", tempMax: 35, tempMin: 24, humidity: 60, rainfall24h: 0 },
    { city: "Rajkot", tempMax: 32, tempMin: 22, humidity: 75, rainfall24h: 10 }
  ],
  lastFetch: 0
};

async function fetchWeather() {
  const now = Date.now();
  // 30 minute cache
  if (weatherCache.lastFetch > 0 && now - weatherCache.lastFetch < 30 * 60 * 1000) {
    return weatherCache.data;
  }

  try {
    const { data } = await axios.get('https://mausam.imd.gov.in/ahmedabad/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);
    const parsedData: WeatherData[] = [];
    
    // In a real scenario, we'd parse the specific table rows for Ahmedabad IMD page.
    // Example: parsing the current observations 
    // This is mocked logic, but illustrates the pattern requested for the scraper proxy.
    const hasData = typeof data === 'string' && data.length > 0;
    
    if (hasData) {
      // Simulating a successful parse from HTML
      parsedData.push({ city: "Ahmedabad", tempMax: 31, tempMin: 24, humidity: 82, rainfall24h: 5 });
      parsedData.push({ city: "Bhuj", tempMax: 36, tempMin: 25, humidity: 55, rainfall24h: 0 });
      parsedData.push({ city: "Rajkot", tempMax: 33, tempMin: 23, humidity: 70, rainfall24h: 12 });
      
      weatherCache = {
        data: parsedData,
        lastFetch: now
      };
    } else {
      throw new Error("Failed to load page content");
    }
  } catch (error: any) {
    console.warn(`Failed to fetch weather data, using fallback cache. Reason: ${error.message}`);
  }

  return weatherCache.data;
}

const schemeCategoriesMatrix = [
  { id: "agriculture", en: "Agriculture, Rural & Environment", gu: "કૃષિ, ગ્રામીણ અને પર્યાવરણ", icon: "HomeModernIcon" },
  { id: "benefits", en: "Benefits & Social development", gu: "લાભો અને સામાજિક વિકાસ", icon: "UserGroupIcon" },
  { id: "business", en: "Business & Self-employed", gu: "વ્યવસાય અને સ્વ-રોજગાર", icon: "BriefcaseIcon" },
  { id: "citizenship", en: "Citizenship, Visa & Passports", gu: "નાગરિકત્વ, વિઝા અને પાસપોર્ટ", icon: "IdentificationIcon" },
  { id: "defence", en: "Defence & Foreign affairs", gu: "સંરક્ષણ અને વિદેશી બાબતો", icon: "ShieldCheckIcon" },
  { id: "transport", en: "Driving & Transport", gu: "ડ્રાઇવિંગ અને ટ્રાન્સપોર્ટ", icon: "TruckIcon" },
  { id: "education", en: "Education & Learning", gu: "શિક્ષણ અને શિક્ષણ", icon: "AcademicCapIcon" },
  { id: "governance", en: "Governance & Planning", gu: "શાસન અને આયોજન", icon: "BuildingLibraryIcon" },
  { id: "health", en: "Health & Wellness", gu: "આરોગ્ય અને સુખાકારી", icon: "HeartIcon" },
  { id: "housing", en: "Housing & Local services", gu: "આવાસ અને સ્થાનિક સેવાઓ", icon: "HomeIcon" },
  { id: "infrastructure", en: "Infrastructure & Industries", gu: "ઇન્ફ્રાસ્ટ્રક્ચર અને ઉદ્યોગો", icon: "WrenchScrewdriverIcon" },
  { id: "jobs", en: "Jobs", gu: "નોકરીઓ", icon: "MagnifyingGlassIcon" },
  { id: "justice", en: "Justice, Law & Grievances", gu: "ન્યાય, કાયદો અને ફરિયાદો", icon: "ScaleIcon" },
  { id: "money", en: "Money & Taxes", gu: "નાણાં અને કરવેરા", icon: "BanknotesIcon" },
  { id: "science", en: "Science, IT & Communication", gu: "વિજ્ઞાન, આઇટી અને સંચાર", icon: "ComputerDesktopIcon" },
  { id: "tourism", en: "Travel & Tourism", gu: "મુસાફરી અને પ્રવાસન", icon: "SunIcon" },
  { id: "welfare", en: "Welfare of Families", gu: "પરિવાારોનું કલ્યાણ", icon: "UserMinusIcon" },
  { id: "youth", en: "Youth sports & Culture", gu: "યુવા રમતગમત અને સંસ્કૃતિ", icon: "TrophyIcon" }
];

async function fetchCategories() {
  const now = Date.now();
  if (categoriesCache.lastFetch > 0 && now - categoriesCache.lastFetch < CACHE_DURATION) {
    return categoriesCache.data;
  }

  try {
    const { data } = await axios.get('https://www.india.gov.in/my-government/schemes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);
    const categories: SchemeCategory[] = [];

    // Attempt to scrape links aiming at scheme categories
    $('a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      
      const textLower = text.toLowerCase();
      const matchedCat = schemeCategoriesMatrix.find(cat => textLower.includes(cat.en.split(',')[0].toLowerCase()) || textLower.includes(cat.id));

      if (matchedCat && text.length > 2) {
        // Prevent duplicates
        if (!categories.find(c => c.id === matchedCat.id)) {
          const fullUrl = href.startsWith('/') ? `https://www.india.gov.in${href}` : href;
          categories.push({
            id: matchedCat.id,
            title_en: matchedCat.en,
            title_gu: matchedCat.gu,
            icon_type: matchedCat.icon,
            target_url: fullUrl
          });
        }
      }
    });

    if (categories.length > 0) {
      categoriesCache = {
        data: categories,
        lastFetch: now
      };
    } else {
      throw new Error("No categories found on live site");
    }
  } catch (error) {
    console.error('Failed to fetch scheme categories via Scraper, using static fallback matrix', error);
    // Offline / Hardcoded Fallback Protocol
    const fallbackCategories = schemeCategoriesMatrix.map(cat => ({
      id: cat.id,
      title_en: cat.en,
      title_gu: cat.gu,
      icon_type: cat.icon,
      target_url: `https://www.india.gov.in/my-government/schemes/search?schemeCategory=${cat.id}`
    }));
    
    categoriesCache = {
      data: fallbackCategories,
      lastFetch: now
    };
  }

  return categoriesCache.data;
}

async function generateContentWithFallback(
  ai: any,
  params: {
    contents: any;
    config?: any;
  },
  models: string[] = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
): Promise<any> {
  let lastError: any = null;
  for (const model of models) {
    try {
      console.log(`[Gemini API] Attempting generation using model alias: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const errMsg = error.message || '';
      console.log(`[Gemini API] Dispatch alternative from ${model}. Info: ${errMsg}`);
    }
  }
  throw lastError || new Error('All models failed');
}

async function startServer() {
  await seedAdminUser();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/projects', (req, res) => {
    res.json({ projects: loadProjects() });
  });

  app.post('/api/projects', (req, res) => {
    const projects = loadProjects();
    const newProject = req.body;
    projects.unshift(newProject);
    saveProjects(projects);
    res.json({ success: true, project: newProject });
  });

  app.put('/api/projects/:id', (req, res) => {
    const projects = loadProjects();
    const idx = projects.findIndex((p: any) => p.id === req.params.id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...req.body };
      saveProjects(projects);
      res.json({ success: true, project: projects[idx] });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.delete('/api/projects/:id', (req, res) => {
    const projects = loadProjects();
    const newProjects = projects.filter((p: any) => p.id !== req.params.id);
    saveProjects(newProjects);
    res.json({ success: true });
  });

  app.get('/api/ledger', (req, res) => {
    res.json({ ledger: loadLedger() });
  });

  app.post('/api/ledger', (req, res) => {
    const ledger = loadLedger();
    const newEntry = req.body;
    ledger.unshift(newEntry);
    saveLedger(ledger);

    // Automation Logic: Auto-sync with Projects Database
    const projects = loadProjects();
    const projectName = newEntry.reason.trim();
    const existingIdx = projects.findIndex((p: any) => p.name.toLowerCase() === projectName.toLowerCase());

    if (existingIdx === -1) {
      const newProj = {
        id: newEntry.id + '-proj',
        name: projectName,
        estimatedCost: Number(newEntry.amount), // Allocated Budget
        category: newEntry.category,
        status: newEntry.isFinalPayment ? 'Completed' : 'Ongoing',
        createdAt: newEntry.date || new Date().toISOString(),
        ...(newEntry.isFinalPayment ? { completedAt: new Date().toISOString() } : {})
      };
      projects.unshift(newProj);
      saveProjects(projects);
    } else {
       if (newEntry.isFinalPayment) {
         projects[existingIdx].status = 'Completed';
         projects[existingIdx].completedAt = new Date().toISOString();
         saveProjects(projects);
       }
    }

    res.json({ success: true, entry: newEntry });
  });

  app.delete('/api/ledger/:id', (req, res) => {
    const ledger = loadLedger();
    const newLedger = ledger.filter((e: any) => e.id !== req.params.id);
    saveLedger(newLedger);
    res.json({ success: true });
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, phoneNumber, email, password } = req.body;
      const users = loadUsers();
      
      const cleanPhone = (phone: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      };

      const cleanedPhoneInput = cleanPhone(phoneNumber);
      const existingUser = users.find(u => {
        const uEmail = u.email ? u.email.trim().toLowerCase() : '';
        const reqEmail = email ? email.trim().toLowerCase() : '';
        if (reqEmail && uEmail === reqEmail) return true;
        
        const uPhoneClean = cleanPhone(u.phoneNumber);
        if (cleanedPhoneInput && uPhoneClean === cleanedPhoneInput) return true;
        
        return false;
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists, please Login' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: `USR-${Date.now()}`,
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword
      };

      users.push(newUser);
      saveUsers(users);

      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
      const userResponse = { id: newUser.id, firstName, lastName, email, phoneNumber };
      
      res.json({ token, user: userResponse });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const users = loadUsers();
      
      const cleanPhone = (phone: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      };

      const loginId = identifier ? identifier.trim() : '';
      const loginIdLower = loginId.toLowerCase();
      const loginIdCleanPhone = cleanPhone(loginId);

      const user = users.find(u => {
        const uEmail = u.email ? u.email.trim().toLowerCase() : '';
        if (uEmail && uEmail === loginIdLower) return true;
        
        const uPhoneClean = cleanPhone(u.phoneNumber);
        if (loginIdCleanPhone && uPhoneClean === loginIdCleanPhone) return true;
        
        return false;
      });

      if (!user) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Incorrect Password' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const userResponse = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber };
      
      res.json({ token, user: userResponse });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const users = loadUsers();
      const user = users.find(u => u.id === decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const userResponse = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber };
      res.json({ user: userResponse });
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/village-budget', (req, res) => {
    res.json(loadVillageBudget());
  });

  app.put('/api/village-budget', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    // Simplistic auth check (enforce logged-in user context in MVP where Sarpanch is the only one who can hit this in UI)
    try {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET);
      
      const { totalFund } = req.body;
      if (typeof totalFund !== 'number' || totalFund < 0) {
        return res.status(400).json({ error: 'Invalid fund amount' });
      }
      
      saveVillageBudget({ totalFund });
      // Minimal audit log (could write to file, console for now)
      console.log(`[AUDIT] Budget updated to ${totalFund} by token ${token.substring(0, 10)}... at ${new Date().toISOString()}`);
      
      res.json({ success: true, totalFund });
    } catch (e) {
      res.status(403).json({ error: 'Unauthorized to update budget' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  function handleSmartFallbackChat(rawMessage: string, history: any[] = []): string {
    const userText = rawMessage
      .replace(/\[USER_STATUS:\s*\w+\]/g, '')
      .replace(/\[SYSTEM:[^\]]+\]/g, '')
      .trim();
    const textLower = userText.toLowerCase();

    // English switch or translation request detection
    const isExplicitEnglishSwitch = 
      rawMessage.includes('[SYSTEM: Switch language to English]') ||
      /^\s*(english|inglis|अंग्रेजी|અંગ્રેજી)\s*$/i.test(userText) ||
      /(change|switch|translate|speak|talk|convert|use|set|mode|reply|respond).*(to|in|into)?.*(english|inglis)/i.test(userText) ||
      /(in|to|into)\s*(english|inglis)/i.test(userText) ||
      /speak\s*english|talk\s*english|use\s*english/i.test(userText);

    if (isExplicitEnglishSwitch) {
      return 'Language successfully switched to English. How may I assist you with Gram Panchayat services, government schemes, or grievance registration today?';
    }

    const wantsEnglish = textLower.includes('english') || textLower.includes('inglis');

    // Check language preference from message or history
    const isHindi = !wantsEnglish && (
      rawMessage.includes('Switch language to Hindi') ||
      /hindi|हिंदी|हिन्दी|हिंदी में/.test(textLower) ||
      /[\u0900-\u097F]/.test(rawMessage) ||
      (history.some((h: any) => h.parts?.some((p: any) => /[\u0900-\u097F]/.test(p.text || ''))))
    );

    const isGujarati = !wantsEnglish && !isHindi && (
      rawMessage.includes('Switch language to Gujarati') || 
      /gujarati|ગુજરાતી|ગુજરાતીમાં/.test(textLower) ||
      /[\u0A80-\u0AFF]/.test(rawMessage) ||
      (history.some((h: any) => h.parts?.some((p: any) => /[\u0A80-\u0AFF]/.test(p.text || ''))))
    );

    // Language switch direct requests
    if (rawMessage.includes('[SYSTEM: Switch language to Hindi]') || /^\s*(speak in hindi|switch to hindi|hindi|हिंदी|हिंदी में बात करो|हिंदी में बोलो)\s*$/i.test(userText)) {
      return 'भाषा सफलतापूर्वक हिंदी में बदल दी गई है। मैं ग्राम पंचायत सेवाओं या शिकायतों में आपकी क्या सहायता कर सकता हूँ?';
    }
    if (rawMessage.includes('[SYSTEM: Switch language to Gujarati]') || /^\s*(speak in gujarati|switch to gujarati|gujarati|ગુજરાતી|ગુજરાતીમાં વાત કરો)\s*$/i.test(userText)) {
      return 'ભાષા સફળતાપૂર્વક ગુજરાતીમાં બદલાઈ ગઈ છે. હું તમને ગ્રામ પંચાયતની સેવાઓ અથવા ફરિયાદોમાં કેવી રીતે મદદ કરી શકું?';
    }

    const isAnonymous = rawMessage.includes('[USER_STATUS: ANONYMOUS]');
    
    let location = 'Vadnagar';
    const locMatch = rawMessage.match(/Active Location\s*=\s*"([^"]+)"/);
    if (locMatch && locMatch[1]) {
      location = locMatch[1];
    }

    const complaintKeywords = [
      'complaint', 'lodge', 'file', 'report', 'broken', 'damage', 'drain', 'water', 
      'road', 'electricity', 'garbage', 'sanitation', 'light', 'pipe', 'leak', 'pothole', 
      'certificate', 'issue', 'problem', 'ફરિયાદ', 'પાણી', 'રસ્તો', 'લાઈટ', 'કચરો', 'ગટર', 'સમસ્યા',
      'शिकायत', 'पानी', 'सड़क', 'बिजली', 'कचरा', 'नाली', 'सफाई', 'समस्या', 'प्रमाणपत्र'
    ];
    const isComplaintIntent = complaintKeywords.some(kw => textLower.includes(kw));

    if (isComplaintIntent) {
      if (isAnonymous) {
        if (isHindi) {
          return 'सत्यापित शिकायत दर्ज करने के लिए, आपका लॉग इन होना आवश्यक है। कृपया नीचे दिए गए बटन का उपयोग करके लॉग इन करें या नया खाता बनाएं। [TRIGGER_AUTH_REDIRECT]';
        }
        return isGujarati
          ? 'ચકાસાયેલ ફરિયાદ નોંધાવવા માટે, તમારે લોગ ઇન રહેવું જરૂરી છે. કૃપા કરીને નીચેના બટનનો ઉપયોગ કરીને લોગ ઇન કરો અથવા નવું એકાઉન્ટ બનાવો. [TRIGGER_AUTH_REDIRECT]'
          : 'To register a verified complaint, you need to be logged in. Please use the button below to log in or create an account. [TRIGGER_AUTH_REDIRECT]';
      }

      let category = 'other';
      if (/water|pipeline|leak|tank|supply|પાણી|પાઇપ|पानी|पाइप|नल/.test(textLower)) category = 'water';
      else if (/road|pothole|street|asphalt|paving|રસ્તો|દરોડ|सड़क|रास्ता|गड्ढा/.test(textLower)) category = 'roads';
      else if (/light|electricity|power|wire|transformer|લાઈટ|વીજળી|बिजली|लाइट|तार/.test(textLower)) category = 'electricity';
      else if (/garbage|drain|waste|clean|sanitation|kachra|કચરો|ગટર|સફાઈ|कचरा|नाली|सफाई/.test(textLower)) category = 'sanitation';
      else if (/certificate|birth|death|caste|income|દાખલો|પ્રમાણપત્ર|प्रमाणपत्र|दाखिला/.test(textLower)) category = 'certificates';

      const desc = userText || 'Grievance reported via AI Sarthi Assistant';
      const flag = `[FLAG: ESCALATE_TO_SARPANCH_PORTAL | CATEGORY: ${category} | LOCATION: ${location} | DESCRIPTION: ${desc}]`;

      if (isHindi) {
        return `${flag}\n\nआपकी शिकायत ("${desc}") सफलतापूर्वक दर्ज कर ली गई है और ${location} पंचायत सरपंच डैशबोर्ड पर भेज दी गई है। हमारी टीम जल्द ही कार्रवाई करेगी।`;
      }
      if (isGujarati) {
        return `${flag}\n\nતમારી ફરિયાદ ("${desc}") સફળતાપૂર્વક નોંધાઈ ગઈ છે અને ${location} પંચાયત સરપંચ ડેશબોર્ડ પર મોકલવામાં આવી છે. અમારી ટીમ ટૂંક સમયમાં કાર્યવાહી કરશે.`;
      }
      return `${flag}\n\nYour complaint regarding "${desc}" in ${location} has been successfully logged and escalated directly to the Sarpanch Dashboard for immediate attention.`;
    }

    if (/scheme|yojana|pm-kisan|farmer|kisan|subsidy|welfare|યોજના|ખેડૂત|योजना|किसान|सब्सिडी/.test(textLower)) {
      if (isHindi) {
        return `हमारी ग्राम पंचायत में उपलब्ध प्रमुख सरकारी योजनाएं:\n\n1. **पीएम-किसान सम्मान निधि**: पात्र किसानों के लिए ₹6,000/वर्ष की सीधी वित्तीय सहायता।\n2. **जल जीवन मिशन**: हर ग्रामीण घर के लिए नल से शुद्ध पेयजल।\n3. **पीएम आवास योजना (ग्रामीण)**: आवास निर्माण के लिए सहायता।\n4. **आयुष्मान भारत योजना**: प्रति परिवार ₹5 लाख तक का मुफ्त इलाज।\n\nअधिक जानकारी के लिए पोर्टल पर 'Government Schemes' टैब देखें।`;
      }
      if (isGujarati) {
        return `અમારી ગ્રામ પંચાયતમાં ઉપલબ્ધ મુખ્ય સરકારી યોજનાઓ:\n\n1. **પીએમ-કિસાન સન્માન નિધિ**: ખેડૂતો માટે વાર્ષિક ₹6,000 ની નાણાકીય સહાય.\n2. **જલ જીવન મિશન**: દરેક ગ્રામીણ ઘર માટે નળથી શુદ્ધ પીવાનું પાણી.\n3. **પીએમ આવાસ યોજના (ગ્રામીણ)**: ઘર નિર્માણ માટે સહાય.\n4. **આયુષ્માન ભારત યોજના**: પરિવાર દીઠ ₹5 લાખ સુધીની મફત તબીબી સારવાર.\n\nવધુ વિગતો માટે પોર્ટલના 'Government Schemes' ટૅબ પર ક્લિક કરો.`;
      }
      return `Here are key government schemes available in our Gram Panchayat:\n\n1. **PM-Kisan Samman Nidhi**: Direct financial support of ₹6,000/year for eligible farmers.\n2. **Jal Jeevan Mission**: Household tap water connections for clean drinking water.\n3. **PM Awas Yojana (Gramin)**: Financial assistance for rural housing construction.\n4. **Ayushman Bharat**: Free healthcare coverage up to ₹5 Lakhs per family per year.\n\nYou can explore and apply under the 'Government Schemes' section on this portal.`;
    }

    if (/sarpanch|contact|office|timing|hours|phone|address|helpline|સરપંચ|સંપર્ક|કચેરી|सरपंच|संपर्क|कार्यालय/.test(textLower)) {
      if (isHindi) {
        return `ग्राम पंचायत कार्यालय विवरण:\n\n📍 **स्थान**: मुख्य पंचायत भवन, वडनगर सेंटर\n⏰ **कार्यालय समय**: सोमवार - शनिवार, सुबह 10:00 से शाम 5:00 बजे तक\n📞 **हेल्पलाइन**: +91 (02762) 220-100\n✉️ **ईमेल**: sarpanch@vadnagar-panchayat.gov.in\n\nआप सरपंच डैशबोर्ड पर सभी विकास कार्यों की प्रगति भी देख सकते हैं।`;
      }
      if (isGujarati) {
        return `ગ્રામ પંચાયત કચેરીની વિગતો:\n\n📍 **સ્થળ**: મુખ્ય પંચાયત ભવન, વડનગર સેન્ટર\n⏰ **ઓફિસ સમય**: સોમ થી શનિ, સવારે 10:00 થી સાંજે 5:00\n📞 **હેલ્પલાઇન નંબર**: +91 (02762) 220-100\n✉️ **ઇમેઇલ**: sarpanch@vadnagar-panchayat.gov.in\n\nતમે આ પોર્ટલ પર સરપંચ ડેશબોર્ડ દ્વારા તમામ વિકાસ કાર્યો પણ જોઈ શકો છો.`;
      }
      return `Gram Panchayat Office Details:\n\n📍 **Location**: Main Panchayat Bhavan, Vadnagar Center\n⏰ **Office Hours**: Mon - Sat, 10:00 AM to 5:00 PM\n📞 **Helpline**: +91 (02762) 220-100\n✉️ **Email**: sarpanch@vadnagar-panchayat.gov.in\n\nYou can also monitor live village projects and complaints directly on the Sarpanch Dashboard.`;
    }

    if (/crop|price|mandi|rate|market|wheat|cotton|mustard|agri|ખેતી|પાક|ભાવ|મંડી|फसल|मंडी|दाम|गेहूं|कपास|सरसों/.test(textLower)) {
      if (isHindi) {
        return `आज के मुख्य मंडी (APMC) भाव (प्रति क्विंटल):\n\n🌾 **गेहूं (Wheat)**: ₹2,450 / क्विंटल\n🌾 **कपास (Cotton)**: ₹7,100 / क्विंटल\n🌾 **सरसों (Mustard)**: ₹5,600 / क्विंटल\n🌾 **अरंडी (Castor)**: ₹6,200 / क्विंटल\n\nलाइव अपडेट के लिए मुख्य पोर्टल पर 'Crop Prices' विजेट देखें।`;
      }
      if (isGujarati) {
        return `આજના મુખ્ય એપીએમસી મંડી ભાવ (પ્રતિ ક્વિન્ટલ):\n\n🌾 **ઘઉં (Wheat)**: ₹2,450 / ક્વિન્ટલ\n🌾 **કપાસ (Cotton)**: ₹7,100 / ક્વિન્ટલ\n🌾 **રાઇ (Mustard)**: ₹5,600 / ક્વિન્ટલ\n🌾 **એરંડા (Castor)**: ₹6,200 / ક્વિન્ટલ\n\nલાઇવ અપડેટ માટે હોમ પેજ પર 'Crop Prices' વિભાગ તપાસો.`;
      }
      return `Today's APMC Mandi Market Prices (per Quintal):\n\n🌾 **Wheat**: ₹2,450 / Qtl\n🌾 **Cotton**: ₹7,100 / Qtl\n🌾 **Mustard**: ₹5,600 / Qtl\n🌾 **Castor**: ₹6,200 / Qtl\n\nFor real-time price trends, check the 'Crop Prices' widget on the main portal.`;
    }

    if (isHindi) {
      return `नमस्ते! मैं "सारथी" हूँ, आपका ग्राम पंचायत AI सहायक। मैं आपकी निम्नलिखित में सहायता कर सकता हूँ:\n- सड़क, पानी, बिजली या स्वच्छता की शिकायत दर्ज करना\n- सरकारी योजनाओं की जानकारी प्राप्त करना\n- सरपंच एवं पंचायत कार्यालय से संपर्क करना\n- फसल के बाजार भाव और मौसम अपडेट देखना\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?`;
    }
    if (isGujarati) {
      return `નમસ્તે! હું "સારથી" છું, તમારો ગ્રામ પંચાયત એઆઈ સહાયક. હું તમને નીચેના કાર્યમાં મદદ કરી શકું છું:\n- પાણી, રસ્તા, લાઈટ વગેરેની ફરિયાદ નોંધવી\n- સરકારી યોજનાઓ વિશે માહિતી મેળવવી\n- સરપંચ કચેરીનો સંપર્ક સાધવો\n- પાકના બજાર ભાવ અને હવામાન અપડેટ્સ મેળવવા\n\nઆજે હું તમને કેવી રીતે મદદ કરી શકું?`;
    }
    return `Hello! I am "Sarthi", your AI community assistant for Gram Panchayat services. I can assist you with:\n- Registering and tracking complaints (roads, water, electricity, sanitation)\n- Exploring Government Schemes (PM-Kisan, Jal Jeevan, PM Awas)\n- Contacting Sarpanch & Panchayat Office\n- Checking Mandi crop prices and weather updates\n\nHow can I help you today?`;
  }

  function handleSmartFallbackAnalysis(issues: any[] = []) {
    if (!issues || issues.length === 0) return { groups: [] };

    const categoryMap: Record<string, any[]> = {};
    issues.forEach((issue: any) => {
      const cat = issue.category || 'other';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(issue);
    });

    const groups: any[] = [];
    Object.keys(categoryMap).forEach(cat => {
      const catIssues = categoryMap[cat];
      const issueIds = catIssues.map(i => i.id);
      const affectedCitizens = Array.from(new Set(catIssues.map(i => i.reporter || i.citizenId || 'Citizen')));
      const affectedLocations = Array.from(new Set(catIssues.map(i => i.location || 'Vadnagar')));
      const catCapitalized = cat.charAt(0).toUpperCase() + cat.slice(1);
      
      groups.push({
        summary: `Multiple reported grievances regarding ${catCapitalized} infrastructure requiring priority attention.`,
        category: catCapitalized,
        issueIds,
        affectedCitizens,
        affectedLocations
      });
    });

    return { groups };
  }

  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        const fallbackText = handleSmartFallbackChat(message || '', history || []);
        return res.json({ response: fallbackText });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are "Sarthi", an empathetic, efficient, and AI-powered community assistant for a local village administration system. Your job is to help users register community complaints (such as road damage, water issues, or streetlights) and bridge the communication gap between citizens and the Sarpanch.

Core Capabilities:
1. Trilingual Support: You operate seamlessly in English, Hindi, and Gujarati. If the user asks to switch language, speak in, or translate to English, Hindi, or Gujarati (e.g., "speak in Hindi", "हिंदी में बात करो", "translate to Gujarati", "talk in English"), immediately switch your response to that requested language.
2. Authentication Check: You must verify if a user has an account before logging a complaint.
3. Sarpanch Escalation: Once a valid complaint is captured, you mark it for high-visibility escalation on the Sarpanch Dashboard.

Operational Workflow & State Machine:
Step 1: Greeting & Language Sync. Start the conversation with a polite greeting. If you receive a hidden instruction like "[SYSTEM: Switch language to English]", "[SYSTEM: Switch language to Hindi]", or "[SYSTEM: Switch language to Gujarati]", or if the user asks in chat to switch/translate language, immediately shift all subsequent responses to that language and acknowledge the change naturally without breaking the conversation flow.
Step 2: Intent Classification. If the user wants to file a complaint (e.g., "road is broken", "no water"), proceed to Step 3. For general inquiries, answer politely in the active language.
Step 3: Automated Authentication Verification. When a user expresses intent to file a complaint, check the current system variable "[USER_STATUS]". Scenario A: "[USER_STATUS: ANONYMOUS]" (Not Logged In) -> Immediately halt the complaint flow. Inform the user politely in the active language that authentication is required to track updates: "To register a verified complaint, you need to be logged in. Please use the button below to log in or create an account." (or Hindi/Gujarati equivalent). Output the command token exactly "[TRIGGER_AUTH_REDIRECT]". Scenario B: "[USER_STATUS: LOGGED_IN]" -> Do not ask the user for verification. Skip directly to Step 4.
Step 4: Complaint Registration & Escalation. Proceed with collecting the specific issue details (e.g., Road damage, Streetlight failure) and map them to the logged-in user profile. Identify the correct issue category from exactly one of these enum values: water, sanitation, roads, electricity, certificates, or other. Automatically tag the complaint with the active location provided by the top bar system context. CRUCIAL: Output the final log with metadata exactly like this: "[FLAG: ESCALATE_TO_SARPANCH_PORTAL | CATEGORY: <Category> | LOCATION: <Current Location> | DESCRIPTION: <Description>]" (replacing <Category> with the parsed enum string, <Current Location> with the system location context provided, and <Description> with a clean, professional summary of the issue). This ensures the engineering backend routes the complaint straight to the dashboard of that specific village's Sarpanch. Do NOT output phrases like "Generated by Assistant" in the description.

Style Guidelines:
- Tone: Helpful, grounded, polite.
- Keep responses concise and optimized for mobile screens.
- Avoid administrative jargon.`;

      const response = await generateContentWithFallback(ai, {
        contents: [...(history || []), { role: 'user', parts: [{ text: message }] }],
        config: { systemInstruction }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error('Chat error, using smart fallback:', error?.message);
      const fallbackText = handleSmartFallbackChat(message || '', history || []);
      res.json({ response: fallbackText });
    }
  });

  app.post('/api/analyze-complaints', async (req, res) => {
    const { issues = [] } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json(handleSmartFallbackAnalysis(issues));
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are an AI analyst evaluating community complaints. Group complaints that describe the exact same underlying issue, even if worded differently. Return an array of groups. Each group should have a 'summary' string, a 'category' string, an 'issueIds' array of strings, an 'affectedCitizens' array of strings (the reporters), and an 'affectedLocations' array of strings.`;

      const response = await generateContentWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(issues.map((i: any) => ({ id: i.id, title: i.title, desc: i.description, reporter: i.reporter, location: i.location }))) }] }],
        config: { 
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "A summary of the grouped issues." },
                        category: { type: Type.STRING, description: "The overarching category of the issue." },
                        issueIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The IDs of the original issues." },
                        affectedCitizens: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names or IDs of reporters." },
                        affectedLocations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Locations mentioned." }
                    },
                    required: ["summary", "category", "issueIds", "affectedCitizens", "affectedLocations"]
                }
            }
        }
      });
      
      let jsonText = response.text;
      if (!jsonText) {
          return res.json(handleSmartFallbackAnalysis(issues));
      }
      
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      
      try {
        const groups = JSON.parse(jsonText);
        res.json({ groups });
      } catch (e: any) {
        res.json(handleSmartFallbackAnalysis(issues));
      }
    } catch (error: any) {
      console.error('Analyze error, using fallback:', error?.message);
      res.json(handleSmartFallbackAnalysis(issues));
    }
  });

  app.get('/api/schemes', async (req, res) => {
    const schemes = await fetchSchemes();
    res.json({ schemes });
  });

  app.get('/api/scheme-categories', async (req, res) => {
    const categories = await fetchCategories();
    res.json({ categories });
  });

  app.get('/api/v1/schemes/categories', async (req, res) => {
    const categories = await fetchCategories();
    res.json({ categories });
  });

  app.get('/api/v1/weather', async (req, res) => {
    const weather = await fetchWeather();
    res.json({ weather });
  });

  app.get('/api/v1/crop-prices', (req, res) => {
    // In production, this would execute the Python Selenium scraper logic via an internal microservice
    // Here we provide the mocked structure simulating the scraped Agmarknet data
    const marketPrices = [
      {
        market: "Gondal",
        commodity: "Cotton",
        variety: "Shankar-6",
        min_price: 7000,
        max_price: 7500,
        modal_price: 7250,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      },
      {
        market: "Rajkot",
        commodity: "Groundnut",
        variety: "G-20",
        min_price: 6600,
        max_price: 7000,
        modal_price: 6800,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      },
      {
        market: "Unjha",
        commodity: "Jeera (Cumin)",
        variety: "Machine Clean",
        min_price: 24000,
        max_price: 25000,
        modal_price: 24500,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      },
      {
        market: "Amreli",
        commodity: "Wheat",
        variety: "Lokwan",
        min_price: 2400,
        max_price: 2500,
        modal_price: 2450,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    ];
    res.json({ prices: marketPrices, lastSynced: new Date().toISOString() });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
