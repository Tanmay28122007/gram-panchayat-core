import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ViewState, IssueCategory, Issue } from "./types";
import { mockIssues, mockLedger } from "./data";
import { CitizenPortal } from "./components/CitizenPortal";
import { CitizenRegister } from "./components/CitizenRegister";
import { ComplaintTracker } from "./components/ComplaintTracker";
import { SarpanchDashboard } from "./components/SarpanchDashboard";
import { FinanceLedger } from "./components/FinanceLedger";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { SarpanchLogin } from "./components/SarpanchLogin";
import { SeasonPanel } from "./components/SeasonPanel";
import { ProjectMonitoring } from "./components/ProjectMonitoring";
import { GlobalFooter } from "./components/GlobalFooter";
import { RoleSelection } from "./components/RoleSelection";
import { FloatingChat } from "./components/FloatingChat";
import { ToastContainer, ToastMessage } from "./components/Toast";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Globe,
  CloudSun,
  ArrowLeft,
  Map,
  LogOut,
} from "lucide-react";

import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

// Wrap shared state so we don't lose it on navigation
function RouterApp() {
  const { t, lang, setLang } = useLanguage();
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem("app_issues");
    return stored ? JSON.parse(stored) : mockIssues;
  });
  const [ledger, setLedger] = useState(mockLedger);
  const [isSarpanchAuthenticated, setIsSarpanchAuthenticated] = useState(false);
  const [citizenUser, setCitizenUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isCitizenAuthenticated = !!citizenUser;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const { data } = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (data.user) setCitizenUser(data.user);
        } catch (e) {
          localStorage.removeItem("authToken");
        }
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  const addToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    localStorage.setItem("app_issues", JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app_issues" && e.newValue) {
        setIssues(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const prevIssuesRef = React.useRef(issues);

  useEffect(() => {
    if (citizenUser) {
      const prevIssues = prevIssuesRef.current;
      issues.forEach((currentIssue) => {
        if (currentIssue.reporterId === citizenUser.id) {
          const prevIssue = prevIssues.find((i) => i.id === currentIssue.id);
          if (prevIssue) {
            if (prevIssue.status !== currentIssue.status) {
              if (currentIssue.status === 'resolved') {
                addToast(`Your complaint (${currentIssue.title}) has been marked as Resolved.`, 'success');
              } else if (currentIssue.status === 'yellow') {
                addToast(`Your complaint (${currentIssue.title}) is now Under Review.`, 'info');
              }
            } else if (currentIssue.escalated !== prevIssue.escalated && currentIssue.escalated) {
              addToast(`Your complaint (${currentIssue.title}) has been escalated to ${currentIssue.escalatedTo}.`, 'info');
            }
          }
        }
      });
    }
    prevIssuesRef.current = issues;
  }, [issues, citizenUser]);

  const handleReportIssue = (category: IssueCategory, description: string, imageUrl?: string, coordinates?: {lat: number, lng: number}) => {
    const newIssue: Issue = {
      id: `TKT-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      title: `New ${category} issue reported`,
      category,
      description:
        description ||
        "Automatically added from Citizen Portal.",
      location: "GPS Tagged Location",
      coordinates,
      reporter: citizenUser ? `${citizenUser.firstName} ${citizenUser.lastName}` : "Anonymous Citizen",
      reporterId: citizenUser?.id,
      upvotes: 0,
      status: "green" as const,
      reportedAt: new Date().toISOString(),
      escalated: false,
      issueImageUrl: imageUrl,
    };
    setIssues((prev) => [newIssue, ...prev]);
    alert(t.alertReported);
  };

  const handleEscalate = (id: string, escalatedTo: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, escalated: true, escalatedTo, status: "red" } : i,
      ),
    );
  };

  const handleResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "resolved",
              resolvedAt: new Date().toISOString(),
              proofImageUrl:
                "https://images.unsplash.com/photo-1541888040058-005809633e70?q=80&w=200&auto=format&fit=crop",
            }
          : i,
      ),
    );
  };

  const handleReview = (id: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "yellow" } : i,
      ),
    );
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 rounded-full border-4 border-t-[#52796F] border-[#E6E1D3] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DisclaimerBanner />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<RoleSelection />} />

        {/* Citizen Route */}
        <Route
          path="/citizen-register"
          element={
            <CitizenRegister onRegister={(user) => setCitizenUser(user)} />
          }
        />
        <Route
          path="/citizen-dashboard/*"
          element={
            <CitizenAppLayout 
              user={citizenUser} 
              onLogout={() => {
                setCitizenUser(null);
                localStorage.removeItem("authToken");
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="services" replace />} />
                <Route
                  path="services"
                  element={<CitizenPortal onReportIssue={handleReportIssue} isAuthenticated={isCitizenAuthenticated} />}
                />
                <Route
                  path="track"
                  element={
                    isCitizenAuthenticated ? (
                      <ComplaintTracker issues={issues} user={citizenUser} />
                    ) : (
                      <Navigate to="/citizen-register" replace />
                    )
                  }
                />
                <Route path="season" element={<SeasonPanel />} />
                <Route
                  path="projects"
                  element={<ProjectMonitoring role="citizen" />}
                />
              </Routes>
            </CitizenAppLayout>
          }
        />

        {/* Sarpanch Login Route */}
        <Route
          path="/sarpanch-login"
          element={
            <SarpanchAuthContainer
              isAuthenticated={isSarpanchAuthenticated}
              onLogin={() => setIsSarpanchAuthenticated(true)}
            />
          }
        />

        {/* Sarpanch Dashboard Route */}
        <Route
          path="/sarpanch-dashboard/*"
          element={
            isSarpanchAuthenticated ? (
              <SarpanchAppLayout 
                onLogout={() => setIsSarpanchAuthenticated(false)}
                pendingCount={issues.filter(i => i.status !== 'resolved').length}
              >
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="overview" replace />}
                  />
                  <Route
                    path="overview"
                    element={
                      <SarpanchDashboard
                        issues={issues.map(i => ({ ...i, reporter: 'Anonymous', reporterId: undefined }))}
                        onEscalate={handleEscalate}
                        onResolve={handleResolve}
                        onReview={handleReview}
                      />
                    }
                  />
                  <Route path="finance" element={<FinanceLedger />} />
                  <Route
                    path="projects"
                    element={<ProjectMonitoring role="sarpanch" />}
                  />
                </Routes>
              </SarpanchAppLayout>
            ) : (
              <Navigate to="/sarpanch-login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RouterApp />
      <FloatingChat />
    </LanguageProvider>
  );
}


// Layout components

function CitizenAppLayout({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#3D3D3D] font-sans selection:bg-[#A3B18A]/30">
      <nav className="bg-white/50 backdrop-blur-md border-b border-[#E6E1D3] sticky top-8 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={() => navigate("/")}
                className="mr-2 p-2 hover:bg-[#F4F1EA] rounded-full text-[#5A5A40]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#52796F] text-white flex items-center justify-center font-bold text-xl">
                C
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-serif font-bold text-[#2C2C1E] tracking-tight leading-tight">
                  {t.title}
                </h1>
                <p className="text-[10px] text-[#8B8B7A] uppercase tracking-widest leading-none">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 items-center">
              {user ? (
                <div className="flex items-center gap-3 pr-2 border-r border-[#E6E1D3]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E6E1D3] flex items-center justify-center font-bold text-[#5A5A40]">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold hidden md:inline-block text-[#5A5A40]">
                      {user.firstName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      navigate("/");
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/citizen-register")}
                  className="px-4 py-1.5 rounded-full bg-[#52796F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#3d5a52] transition-colors mr-2"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setLang(lang === "en" ? "gu" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E1D3] text-xs font-bold text-[#5A5A40] hover:bg-[#F4F1EA] transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "en" ? "ગુજરાતી" : "English"}
              </button>

              <div className="flex gap-1 sm:gap-2 border-l pl-4 ml-2 border-[#E6E1D3]">
                <NavButton
                  onClick={() => navigate("/citizen-dashboard/services")}
                  active={window.location.pathname.includes("/services")}
                  icon={Users}
                  label={t.navCitizen}
                />
                {user && (
                  <NavButton
                    onClick={() => navigate("/citizen-dashboard/track")}
                    active={window.location.pathname.includes("/track")}
                    icon={LayoutDashboard}
                    label="Track"
                  />
                )}
                <NavButton
                  onClick={() => navigate("/citizen-dashboard/season")}
                  active={window.location.pathname.includes("/season")}
                  icon={CloudSun}
                  label={t.navSeason}
                />
                <NavButton
                  onClick={() => navigate("/citizen-dashboard/projects")}
                  active={window.location.pathname.includes("/projects")}
                  icon={Map}
                  label={lang === "en" ? "Projects" : "પ્રોજેક્ટ્સ"}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-8 flex-1">{children}</main>
      <GlobalFooter />
    </div>
  );
}

function SarpanchAppLayout({ children, onLogout, pendingCount }: { children: React.ReactNode, onLogout: () => void, pendingCount: number }) {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#3D3D3D] font-sans selection:bg-[#8B5A2B]/30">
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#E6E1D3] sticky top-8 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={() => navigate("/")}
                className="mr-2 p-2 hover:bg-[#FDFBF7] rounded-full text-[#5A5A40]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-xl">
                S
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-serif font-bold text-[#2C2C1E] tracking-tight leading-tight">
                  {t.navSarpanch}
                </h1>
                <p className="text-[10px] text-[#8B8B7A] uppercase tracking-widest leading-none">
                  Administration
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 items-center">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync Active</span>
              </div>
              <button
                onClick={() => setLang(lang === "en" ? "gu" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E1D3] text-xs font-bold text-[#5A5A40] hover:bg-[#FDFBF7] transition-colors"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "en" ? "ગુજરાતી" : "English"}
              </button>

              <div className="flex gap-1 sm:gap-2 border-l pl-4 ml-2 border-[#E6E1D3]">
                <NavButton
                  onClick={() => navigate("/sarpanch-dashboard/overview")}
                  active={window.location.pathname.includes("/overview")}
                  icon={LayoutDashboard}
                  label="Overview"
                  badgeCount={pendingCount}
                />
                <NavButton
                  onClick={() => navigate("/sarpanch-dashboard/finance")}
                  active={window.location.pathname.includes("/finance")}
                  icon={PieChart}
                  label={t.navFinance}
                />
                <NavButton
                  onClick={() => navigate("/sarpanch-dashboard/projects")}
                  active={window.location.pathname.includes("/projects")}
                  icon={Map}
                  label={lang === "en" ? "Projects" : "પ્રોજેક્ટ્સ"}
                />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-full border border-red-200 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-8 flex-1">{children}</main>
      <GlobalFooter />
    </div>
  );
}

function SarpanchAuthContainer({
  isAuthenticated,
  onLogin,
}: {
  isAuthenticated: boolean;
  onLogin: () => void;
}) {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/sarpanch-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative">
      <div className="absolute top-8 left-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 p-2 hover:bg-[#F4F1EA] rounded-full text-[#5A5A40] text-sm font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center pb-8 pt-24">
        <SarpanchLogin
          onLogin={() => {
            onLogin();
          }}
        />
      </div>
      <GlobalFooter />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  badgeCount
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  badgeCount?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer relative",
        active
          ? "bg-[#5A5A40] text-white"
          : "text-[#8B8B7A] hover:text-[#2C2C1E] hover:bg-[#E6E1D3]/50",
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {badgeCount !== undefined && (
        <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
