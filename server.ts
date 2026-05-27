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

async function startServer() {
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
      
      const existingUser = users.find(u => u.email === email || u.phoneNumber === phoneNumber);
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
      
      const user = users.find(u => u.email === identifier || u.phoneNumber === identifier);
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
