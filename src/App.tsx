/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from 'qrcode.react';
import { GoogleGenAI } from "@google/genai";
import { io, Socket } from "socket.io-client";
import { 
  Home, 
  MessageSquare, 
  Link as LinkIcon, 
  Users, 
  UserPlus,
  Shield, 
  Key, 
  Settings, 
  Bell, 
  User, 
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Phone,
  Facebook,
  Instagram,
  MoreVertical,
  Music,
  Video,
  Linkedin,
  Twitter,
  Search,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Camera,
  Mic,
  Bookmark,
  X,
  Trash2,
  PlusCircle,
  StopCircle,
  Mail,
  CreditCard,
  Zap,
  Check,
  ShoppingCart,
  Target,
  Star,
  DollarSign,
  Layers,
  ListFilter,
  History,
  Share2,
  Database,
  Sparkles,
  Languages,
  Volume2,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Cake,
  Info,
  Calendar,
  ExternalLink
} from "lucide-react";

interface Order {
  id: string;
  customer: string;
  phone?: string;
  item: string;
  amount: string;
  paid: string;
  due: string;
  status: string;
  date: string;
  channel: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  roles: string[];
  status: string;
  joinedDate: string;
  avatar: string;
}

interface PlatformAccount {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Offline';
  lastSync: string;
  details: string;
}

interface ConnectedPlatform {
  id: string;
  name: string;
  iconType: string;
  desc: string;
  accounts: PlatformAccount[];
}

interface Lead {
  name: string;
  email: string;
  source: string;
  status: string;
  score: number;
  date: string;
}

const getApiKey = () => {
  try {
    // Try process.env (Vite define) or import.meta.env (standard Vite)
    return process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

let globalSocket: Socket | null = null;

interface Chat {
  id: number;
  name: string;
  platform: string;
  platformIcon: React.ReactNode;
  platformColor: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
  isStarred: boolean;
  isSpam: boolean;
  isBin: boolean;
  isDone: boolean;
  hasOrdered: boolean;
  assignedTo: string | null;
  profile: {
    bio: string;
    work: string;
    education: string;
    location: string;
    hometown: string;
    relationship: string;
    birthday: string;
    email: string;
    phone: string;
    gender: string;
    coverImage: string;
    joinedDate: string;
  };
  messages: {
    id: number;
    text: string;
    sender: 'me' | 'them';
    time: string;
    translatedText?: string;
    type?: 'text' | 'image' | 'voice';
    mediaUrl?: string;
  }[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem("app_logo"));
  const [faviconUrl, setFaviconUrl] = useState<string | null>(() => localStorage.getItem("app_favicon"));
  const [appName, setAppName] = useState<string>(() => localStorage.getItem("app_name") || "Amaizing IT");
  const [appColors, setAppColors] = useState(() => {
    const saved = localStorage.getItem("app_colors");
    return saved ? JSON.parse(saved) : {
      sidebarTop: "#14060a",
      sidebarMiddle: "#a00c1c",
      sidebarBottom: "#060203",
      primaryAccent: "#f05340",
      pageBg: "#0f172a",
      cardBg: "#1e293b"
    };
  });
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Admin", email: "admin@example.com", verified: true, roles: ["Administrator"], status: "Yes", joinedDate: "Apr 18, 2026", avatar: "A" },
    { id: 2, name: "Agent", email: "agent@example.com", verified: true, roles: ["Agent"], status: "Yes", joinedDate: "Apr 18, 2026", avatar: "A" }
  ]);

  React.useEffect(() => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [faviconUrl]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 font-sans">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-xl mb-4">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          )}
          <h2 className="text-slate-200 font-bold text-xl tracking-tight uppercase">{appName}</h2>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1e2d45] w-full max-w-lg rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-12 border border-slate-700/50"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-8 font-medium">Sign in to access your workspace.</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-slate-300 font-bold text-sm mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold text-sm mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-700 bg-[#0f172a] text-emerald-600 focus:ring-emerald-500 transition-colors cursor-pointer"
                />
                <span className="ml-3 text-slate-400 font-medium group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-slate-400 font-medium hover:text-white underline decoration-slate-700 underline-offset-4 transition-colors"
              >
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0a946b] hover:bg-[#08835d] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] uppercase tracking-wider text-sm mt-4"
            >
              Log In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <Dashboard 
    onLogout={() => setIsLoggedIn(false)} 
    logoUrl={logoUrl} 
    setLogoUrl={setLogoUrl}
    faviconUrl={faviconUrl}
    setFaviconUrl={setFaviconUrl} 
    appName={appName}
    setAppName={setAppName}
    appColors={appColors}
    setAppColors={setAppColors}
    employees={employees}
    setEmployees={setEmployees}
  />;
}

function Dashboard({ 
  onLogout, 
  logoUrl, 
  setLogoUrl,
  faviconUrl,
  setFaviconUrl,
  appName,
  setAppName,
  appColors,
  setAppColors,
  employees,
  setEmployees
}: { 
  onLogout: () => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  faviconUrl: string | null;
  setFaviconUrl: (url: string | null) => void;
  appName: string;
  setAppName: (name: string) => void;
  appColors: any;
  setAppColors: (colors: any) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}) {
  const [currentView, setCurrentView] = useState("Home");
  const [facebookAccessToken, setFacebookAccessToken] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const isExpanded = !isSidebarCollapsed || isSidebarHovered;

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 0,
      name: "Hasibul Hasan",
      platform: "whatsapp",
      platformIcon: <Phone className="w-3 h-3" />,
      platformColor: "bg-emerald-500",
      lastMsg: "Is the API integration ready for testing?",
      time: "10:45 AM",
      unread: 2,
      online: true,
      avatar: "H",
      isStarred: true,
      isSpam: false,
      isBin: false,
      isDone: false,
      hasOrdered: false,
      assignedTo: null,
      profile: {
        bio: "Managing Director at TechHub. Tech enthusiast and coffee lover.",
        work: "Software Architecture & System Design",
        education: "B.Sc in Computer Science, BUET",
        location: "Dhaka, Bangladesh",
        hometown: "Sylhet",
        relationship: "Married",
        birthday: "March 12, 1992",
        email: "hasib.hasan@techhub.com",
        phone: "+8801712345678",
        gender: "Male",
        coverImage: "https://picsum.photos/seed/hasib_cover/800/300",
        joinedDate: "October 2012"
      },
      messages: [
        { id: 1, text: "Assalamu Alaikum!", sender: "them", time: "10:30 AM" },
        { id: 2, text: "Walaikum Assalam, yes we are finishing the chat module.", sender: "me", time: "10:32 AM" },
        { id: 3, text: "Is the API integration ready for testing?", sender: "them", time: "10:45 AM" }
      ]
    },
    {
      id: 1,
      name: "Tania Afrin",
      platform: "messenger",
      platformIcon: <Facebook className="w-3 h-3" />,
      platformColor: "bg-blue-500",
      lastMsg: "The new UI looks amazing on mobile!",
      time: "9:12 AM",
      unread: 0,
      online: false,
      avatar: "T",
      isStarred: false,
      isSpam: false,
      isBin: false,
      isDone: false,
      hasOrdered: false,
      assignedTo: null,
      profile: {
        bio: "Fashion Designer & Part-time Blogger. Exploring the world of pixels.",
        work: "Creative Designer at Vogue BD",
        education: "Fashion Design, Shanto-Mariam",
        location: "Dhaka, Bangladesh",
        hometown: "Dhaka",
        relationship: "Single",
        birthday: "August 22, 1998",
        email: "tania.afrin@vogue.bd",
        phone: "+8801812345678",
        gender: "Female",
        coverImage: "https://picsum.photos/seed/tania_cover/800/300",
        joinedDate: "February 2015"
      },
      messages: [
        { id: 1, text: "Hi, I checked the new design.", sender: "them", time: "9:00 AM" },
        { id: 2, text: "The new UI looks amazing on mobile!", sender: "them", time: "9:12 AM" }
      ]
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: "ORD-7291", customer: "Jamal Ahmed", item: "Messenger Plan", amount: "৳5500.00", paid: "৳5500.00", due: "৳0.00", status: "Paid", date: "2024-04-19", channel: "Facebook" },
    { id: "ORD-7292", customer: "Sara Khan", item: "WhatsApp API", amount: "৳2100.00", paid: "৳1000.00", due: "৳1100.00", status: "Partial", date: "2024-04-19", channel: "WhatsApp" },
    { id: "ORD-7293", customer: "Karim Ullah", item: "Enterprise Setup", amount: "৳54000.00", paid: "৳0.00", due: "৳54000.00", status: "Unpaid", date: "2024-04-18", channel: "LinkedIn" },
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    { name: "Rafiqul Islam", email: "rafiq@example.com", source: "WhatsApp", status: "Hot", score: 85, date: "2024-04-19" },
    { name: "Anika Rahman", email: "anika@test.com", source: "Messenger", status: "Warm", score: 60, date: "2024-04-19" },
    { name: "Tanvir Hasan", email: "tanvir@biz.com", source: "X (Twitter)", status: "New", score: 30, date: "2024-04-18" },
  ]);

  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([
    {
      id: "whatsapp",
      name: "WhatsApp",
      desc: "Cloud API & QR Gateway",
      iconType: "Phone",
      accounts: [
        { id: "wa-1", name: "+880 1712-345678", status: "Healthy", lastSync: "2 mins ago", details: "Main Business Line" }
      ]
    },
    {
      id: "facebook",
      name: "Messenger",
      desc: "Business Page Messages",
      iconType: "Facebook",
      accounts: [
        { id: "fb-1", name: "Aaramaura Shop", status: "Healthy", lastSync: "Just now", details: "Main Store Page" },
        { id: "fb-2", name: "Support Hub", status: "Healthy", lastSync: "5 mins ago", details: "Customer Support" }
      ]
    },
    {
      id: "tiktok",
      name: "TikTok",
      desc: "Creator DMs & Comments",
      iconType: "Music",
      accounts: []
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      desc: "Org Pages & Talent Hub",
      iconType: "Linkedin",
      accounts: [
        { id: "li-1", name: "Aaramaura Tech", status: "Healthy", lastSync: "1 hour ago", details: "Corporate Page" }
      ]
    },
    {
      id: "x",
      name: "X (Twitter)",
      desc: "DMs & Mentions",
      iconType: "Twitter",
      accounts: [
        { id: "x-1", name: "@aaramaura_it", status: "Healthy", lastSync: "Never", details: "Primary Profile" }
      ]
    },
    {
      id: "instagram",
      name: "Instagram",
      desc: "Story Replies & DMs",
      iconType: "Instagram",
      accounts: []
    }
  ]);

  interface SidebarItemData {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    group?: string;
  }

  const sidebarItems: SidebarItemData[] = [
    { icon: <Home className="w-5 h-5" />, label: "Home", active: true },
    { icon: <Zap className="w-5 h-5 text-amber-400" />, label: "AI Assistant" },
    { icon: <Phone className="w-5 h-5" />, label: "WhatsApp" },
    { icon: <Facebook className="w-5 h-5" />, label: "Facebook / Messenger" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
    { icon: <Music className="w-5 h-5" />, label: "TikTok" },
    { icon: <Twitter className="w-5 h-5" />, label: "X" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
    { icon: <LinkIcon className="w-5 h-5" />, label: "Connections" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Chats", group: "WORK" },
    { icon: <ShoppingCart className="w-5 h-5" />, label: "Orders & Leads" },
    { icon: <Users className="w-5 h-5" />, label: "Employees" },
    { icon: <Shield className="w-5 h-5" />, label: "Roles" },
    { icon: <Key className="w-5 h-5" />, label: "Permissions" },
    { icon: <Database className="w-5 h-5" />, label: "Manual Migration" },
    { icon: <User className="w-5 h-5" />, label: "Profile" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Packages", group: "SYSTEM" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  const stats = [
    { label: "CONVERSATIONS", value: chats.length.toString() },
    { label: "MESSAGES STORED", value: chats.reduce((acc, c) => acc + c.messages.length, 0).toString() },
    { label: "TODAY", value: chats.filter(c => c.time.includes('AM') || c.time.includes('PM') || c.time === 'Just now').length.toString(), sub: "Inbound & outbound" },
    { label: "WHATSAPP THREADS", value: chats.filter(c => c.platform === 'whatsapp').length.toString() },
    { label: "MESSENGER THREADS", value: chats.filter(c => c.platform === 'messenger' || c.platform === 'facebook').length.toString() },
    { label: "ASSIGNED TO YOU", value: chats.filter(c => c.assignedTo === 'Admin').length.toString() },
  ];

  return (
    <div className="flex min-h-screen font-sans text-slate-100" style={{ backgroundColor: appColors.pageBg }}>
      {/* Sidebar */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`${isExpanded ? 'w-64' : 'w-20'} text-white flex flex-col shrink-0 border-r border-slate-800/50 transition-all duration-300 ease-in-out relative z-30 overflow-hidden md:flex`}
        style={{ 
          background: `linear-gradient(to bottom, ${appColors.sidebarTop}, ${appColors.sidebarMiddle}, ${appColors.sidebarBottom})` 
        }}
      >
        <div className={`p-6 flex items-center transition-all ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-700/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer hover:scale-105 transition-transform active:scale-95"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <MessageSquare className="w-6 h-6" style={{ color: appColors.primaryAccent }} />
            )}
          </div>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <h1 className="font-bold text-lg leading-tight uppercase tracking-tight text-white truncate">{appName}</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Unified View</p>
            </motion.div>
          )}
        </div>

        <div className="flex-1 px-3 space-y-6 pt-4 overflow-y-auto no-scrollbar overflow-x-hidden">
          <div>
            {isExpanded && <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Menu</p>}
            {sidebarItems.slice(0, 8).map((item, i) => (
              <SidebarItem 
                key={i} 
                icon={item.icon} 
                label={item.label} 
                active={currentView === item.label} 
                onClick={() => setCurrentView(item.label)}
                collapsed={!isExpanded}
              />
            ))}
          </div>

          <div>
            {isExpanded && <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Work</p>}
            {sidebarItems.slice(8, 12).map((item, i) => (
              <SidebarItem 
                key={i} 
                icon={item.icon} 
                label={item.label} 
                active={currentView === item.label} 
                onClick={() => setCurrentView(item.label)}
                collapsed={!isExpanded}
              />
            ))}
          </div>

          <div>
            {isExpanded && <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">System</p>}
            {sidebarItems.slice(12).map((item, i) => (
              <SidebarItem 
                key={i} 
                icon={item.icon} 
                label={item.label} 
                active={currentView === item.label} 
                onClick={() => setCurrentView(item.label)}
                collapsed={!isExpanded}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={onLogout}
          className={`m-6 p-3 text-xs font-bold uppercase tracking-widest border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 ${!isExpanded ? 'p-0 h-10 w-10 mx-auto' : ''}`}
        >
          {isExpanded ? 'Logout' : <Archive className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header 
          className="h-16 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30"
          style={{ backgroundColor: appColors.cardBg }}
        >
          <h2 className="text-xl font-bold text-white">{currentView}</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
            </button>
            <div 
              onClick={() => setCurrentView("Profile")}
              className="flex items-center gap-3 pl-6 border-l border-slate-800 group cursor-pointer"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: appColors.primaryAccent }}
              >
                A
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold leading-tight text-white">Admin</p>
                <p className="text-xs text-slate-400">admin@example.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={`flex-1 relative ${currentView === "Chats" ? "h-full" : "p-8 max-w-7xl mx-auto w-full overflow-y-auto"}`}>
          <AnimatePresence mode="wait">
            {currentView === "Home" ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Welcome Banner */}
                <div 
                  className="rounded-[2rem] p-10 border border-slate-800 shadow-xl relative overflow-hidden group"
                  style={{ backgroundColor: appColors.cardBg }}
                >
                  <div 
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 opacity-20"
                    style={{ backgroundColor: appColors.primaryAccent }}
                  ></div>
                  <div className="relative z-10">
                    <p className="text-slate-400 font-medium mb-1">Good morning</p>
                    <h3 className="text-4xl font-bold mb-6 text-white">Admin</h3>
                    <p className="text-slate-300 max-w-2xl leading-relaxed">
                      Here is a snapshot of your workspace. Jump into chats, manage connections, or adjust settings from the shortcuts below.
                    </p>
                    <p className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Sunday, April 19</p>
                  </div>
                </div>

                {/* Shortcuts */}
                <section>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Shortcuts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <ShortcutCard 
                      icon={<Zap className="w-6 h-6" />} 
                      title="AI Assistant" 
                      desc="Smart replies & content" 
                      onClick={() => setCurrentView("AI Assistant")}
                      color="bg-amber-500/10 text-amber-400"
                    />
                    <ShortcutCard 
                      icon={<MessageSquare className="w-6 h-6" />} 
                      title="Chats" 
                      desc="Open the unified inbox" 
                      onClick={() => setCurrentView("Chats")}
                      color="bg-emerald-500/10 text-emerald-400"
                    />
                    <ShortcutCard 
                      icon={<LinkIcon className="w-6 h-6" />} 
                      title="Connections" 
                      desc="WhatsApp & Messenger accounts" 
                      onClick={() => setCurrentView("Connections")}
                      color="bg-sky-500/10 text-sky-400"
                    />
                    <ShortcutCard 
                      icon={<Settings className="w-6 h-6" />} 
                      title="Settings" 
                      desc="Notifications & appearance" 
                      onClick={() => setCurrentView("Settings")}
                      color="bg-pink-500/10 text-pink-400"
                    />
                    <ShortcutCard 
                      icon={<User className="w-6 h-6" />} 
                      title="Profile" 
                      desc="Account & security" 
                      onClick={() => setCurrentView("Profile")}
                      color="bg-purple-500/10 text-purple-400"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setCurrentView("WhatsApp")}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      WhatsApp setup
                    </button>
                    <button 
                      onClick={() => setCurrentView("Facebook / Messenger")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Messenger setup
                    </button>
                  </div>
                </section>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Activity</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {stats.map((stat, i) => (
                        <div key={i} className="bg-[#1e293b] p-8 rounded-[1.5rem] border border-slate-800 shadow-xl hover:bg-[#202f4a] transition-colors">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className="text-4xl font-bold text-white">{stat.value}</p>
                          {stat.sub && <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider">{stat.sub}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="bg-[#1e293b] p-8 rounded-[1.5rem] border border-slate-800 shadow-xl">
                      <h5 className="font-bold mb-1 text-white">Connected lines</h5>
                      <p className="text-xs text-slate-400 mb-8">Active channel accounts</p>
                      <div className="space-y-3">
                        <div onClick={() => setCurrentView("WhatsApp")} className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl hover:bg-[#16213a] transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-200">WhatsApp</span>
                          </div>
                          <span className="w-6 h-6 bg-[#1e2d45] border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold shadow-sm text-white">1</span>
                        </div>
                        <div onClick={() => setCurrentView("Facebook / Messenger")} className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl hover:bg-[#16213a] transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                              <Facebook className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-200">Messenger</span>
                          </div>
                          <span className="w-6 h-6 bg-[#1e2d45] border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold shadow-sm text-white">2</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </motion.div>
            ) : currentView === "AI Assistant" ? (
              <AIAssistantView />
            ) : currentView === "Connections" ? (
              <ConnectionsView 
                platforms={connectedPlatforms}
                setPlatforms={setConnectedPlatforms}
                onConnectWhatsApp={() => setCurrentView("WhatsApp")} 
                onConnectFacebook={() => setCurrentView("Facebook / Messenger")} 
                onConnectInstagram={() => setCurrentView("Instagram")}
                onConnectTikTok={() => setCurrentView("TikTok")}
                onConnectLinkedIn={() => setCurrentView("LinkedIn")}
                onConnectX={() => setCurrentView("X")}
              />
            ) : currentView === "Chats" ? (
              <ChatsView 
                setOrders={setOrders} 
                setLeads={setLeads} 
                employees={employees} 
                chats={chats}
                setChats={setChats}
              />
            ) : currentView === "WhatsApp" ? (
              <WhatsAppView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
              />
            ) : currentView === "Facebook / Messenger" ? (
              <FacebookMessengerView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
                setFacebookAccessToken={setFacebookAccessToken}
              />
            ) : currentView === "Instagram" ? (
              <InstagramView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
              />
            ) : currentView === "TikTok" ? (
              <TikTokView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
              />
            ) : currentView === "LinkedIn" ? (
              <LinkedInView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
              />
            ) : currentView === "X" ? (
              <XView 
                setPlatforms={setConnectedPlatforms} 
                setChats={setChats}
                onSuccess={() => setCurrentView("Connections")} 
              />
            ) : currentView === "Employees" ? (
              <EmployeesView employees={employees} setEmployees={setEmployees} />
            ) : currentView === "Roles" ? (
              <RolesView />
            ) : currentView === "Permissions" ? (
              <PermissionsView />
            ) : currentView === "Orders & Leads" ? (
              <OrdersLeadsView orders={orders} leads={leads} />
            ) : currentView === "Manual Migration" ? (
              <ManualMigrationView />
            ) : currentView === "Packages" ? (
              <PackagesView />
            ) : currentView === "Profile" ? (
              <ProfileView />
            ) : currentView === "Settings" ? (
              <SettingsView 
                logoUrl={logoUrl} 
                onLogoChange={setLogoUrl}
                faviconUrl={faviconUrl}
                onFaviconChange={setFaviconUrl} 
                appName={appName}
                onAppNameChange={setAppName}
                appColors={appColors}
                onAppColorsChange={setAppColors}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="p-6 bg-slate-800/50 rounded-full mb-6">
                  <Settings className="w-12 h-12 text-slate-500 animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                <p className="text-slate-400">The <span className="text-emerald-400 font-bold">{currentView}</span> sub-module is currently under development.</p>
                <button 
                  onClick={() => setCurrentView("Home")}
                  className="mt-8 px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Back to Overview
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, collapsed }) => {
  return (
    <div 
      onClick={onClick}
      className={`
      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1 group relative
      ${active ? 'bg-[#1e293b] text-white shadow-lg shadow-black/20 border border-slate-700/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}
      ${collapsed ? 'justify-center' : ''}
    `}>
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
      {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>}
      
      {collapsed && (
        <div className="absolute left-[calc(100%+0.5rem)] px-3 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[100] border border-slate-800 shadow-2xl">
          {label}
        </div>
      )}
    </div>
  );
};

interface ShortcutCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  onClick?: () => void;
}

function ShortcutCard({ icon, title, desc, color, onClick }: ShortcutCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#1e293b] p-6 rounded-[1.5rem] border border-slate-800 shadow-xl flex items-center gap-5 hover:border-slate-600 hover:bg-[#202f4a] transition-all cursor-pointer group"
    >
      <div className={`w-14 h-14 ${color} rounded-[1rem] flex items-center justify-center transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h5 className="font-bold leading-none mb-1 text-white">{title}</h5>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{desc}</p>
      </div>
    </div>
  );
}

function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Super Admin",
    phone: "+8801700000000",
    joinDate: "January 12, 2024",
    bio: "Head of Operations at OmniInbox. Managing multi-channel messaging workflows and AI-powered automation strategies."
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="h-32 bg-gradient-to-r from-rose-600 to-purple-700 opacity-20"></div>
        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 -mt-12 mb-10">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-[2rem] bg-rose-600 border-4 border-[#1e293b] flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                {profile.name[0]}
              </div>
              <div className="mb-2">
                <h3 className="text-3xl font-black text-white tracking-tight">{profile.name}</h3>
                <p className="text-rose-500 font-bold uppercase tracking-[0.2em] text-[10px]">{profile.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 text-sm font-bold text-slate-300">
                  {profile.email}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 text-sm font-bold text-slate-300">
                  {profile.phone}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Joined OmniInbox</label>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 text-sm font-bold text-slate-400">
                  {profile.joinDate}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">About Me</label>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-400 font-medium min-h-[160px]">
                  {profile.bio}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white mb-1">Account Security</h5>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">2FA ENABLED</p>
          <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Manage Security</button>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <Key className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white mb-1">API Access</h5>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">PERSONAL TOKENS: 2</p>
          <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">View Tokens</button>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <Bell className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-white mb-1">Preferences</h5>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">EMAIL NOTIFICATIONS</p>
          <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Change Rules</button>
        </div>
      </div>
    </motion.div>
  );
}

function AIAssistantView() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"marketing" | "support" | "analysis">("marketing");

  const generateAIContent = async (type: string, customPrompt?: string) => {
    setIsLoading(true);
    setResponse("");
    try {
      let finalPrompt = customPrompt || prompt;
      if (type === "marketing") {
        finalPrompt = `Generate 3 high-engaging social media post copies (with emojis and hashtags) for ${finalPrompt}. One for Facebook, one for Instagram, and one for TikTok.`;
      } else if (type === "support") {
        finalPrompt = `I am a customer support agent. A customer said: "${finalPrompt}". Suggest a professional, friendly, and helpful reply in Bengali and English.`;
      } else if (type === "analysis") {
        finalPrompt = `Analyze this business idea and provide 3 growth tips: "${finalPrompt}".`;
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: finalPrompt,
      });

      setResponse(result.text || "No response received.");
    } catch (error) {
      console.error("AI Generation Error:", error);
      setResponse("Error generating content. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const marketingIdeas = [
    "Eid-ul-Fitr Mega Sale on Punjabi and Sharees",
    "New Gadget Arrival: Smart Watch Series 8",
    "Weekend Special Menu at Gourmet Kitchen"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex items-center gap-6 mb-10 relative">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg border border-amber-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">AI Smart Assistant</h3>
            <p className="text-slate-400 font-medium">Powered by Gemini for intelligent business operations</p>
          </div>
        </div>

        <div className="flex gap-4 p-1 bg-[#0f172a] rounded-2xl border border-slate-800 mb-10 w-fit">
          <button 
            onClick={() => setActiveTab("marketing")}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "marketing" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-slate-500 hover:text-slate-200"}`}
          >
            Campaign Builder
          </button>
          <button 
            onClick={() => setActiveTab("support")}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "support" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-slate-500 hover:text-slate-200"}`}
          >
            Support Suggestor
          </button>
          <button 
            onClick={() => setActiveTab("analysis")}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "analysis" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-slate-500 hover:text-slate-200"}`}
          >
            Business Insight
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                {activeTab === "marketing" ? "What are you promoting?" : activeTab === "support" ? "Customer Query" : "Business Context"}
              </label>
              <div className="relative group">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTab === "marketing" ? "e.g. 50% Discount on Tech Items for students..." :
                    activeTab === "support" ? "e.g. I haven't received my delivery yet, where is it?" :
                    "e.g. My ecommerce store is getting traffic but no sales..."
                  }
                  rows={4}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-[1.5rem] p-6 text-white text-sm outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-slate-700"
                ></textarea>
                <button 
                  disabled={isLoading || !prompt.trim()}
                  onClick={() => generateAIContent(activeTab)}
                  className="absolute bottom-4 right-4 p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === "marketing" && (
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Popular Templates</h5>
                <div className="flex flex-wrap gap-2">
                  {marketingIdeas.map((idea, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setPrompt(idea); generateAIContent("marketing", idea); }}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white hover:border-amber-500/30 transition-all"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Generated Result</h4>
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 min-h-[300px] relative overflow-hidden group">
              {!response && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 opacity-30">
                  <Activity className="w-12 h-12 mb-4" />
                  <p className="text-sm font-medium">Ready to assist. Your AI response will appear here.</p>
                </div>
              )}
              
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm z-10">
                  <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-xs font-bold text-amber-400 uppercase tracking-widest animate-pulse">Thinking...</p>
                </div>
              )}

              {response && (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                  {response}
                </div>
              )}

              {response && !isLoading && (
                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-3">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(response); alert("Copied to clipboard!"); }}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Result
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AIInsightCard icon={<MessageSquare />} title="Smart Reply" desc="AI automatically suggests replies to customer messages based on history." color="text-emerald-400" />
        <AIInsightCard icon={<Globe />} title="Auto Translation" desc="Messages are translated instantly to your preferred language." color="text-blue-400" />
        <AIInsightCard icon={<Target />} title="Lead Scoring" desc="AI identifies high-value leads and notifies you in real-time." color="text-amber-400" />
      </div>
    </motion.div>
  );
}

function AIInsightCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:border-slate-700 transition-all group">
      <div className={`w-12 h-12 ${color} bg-white/5 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <h5 className="font-bold text-white mb-2">{title}</h5>
      <p className="text-xs text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function SyncOverlay({ 
  isSyncing, 
  progress, 
  brandColor, 
  onSuccess 
}: { 
  isSyncing: boolean; 
  progress: number; 
  brandColor: string;
  onSuccess: () => void;
}) {
  if (!isSyncing) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-[#0f172a]/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md rounded-[2rem]"
    >
      <div className="space-y-6 w-full max-w-xs transition-all">
        <div className="relative w-20 h-20 mx-auto">
          <div className={`absolute inset-0 border-4 ${brandColor.replace('bg-', 'border-')}/20 rounded-full`}></div>
          <motion.div 
            className={`absolute inset-0 border-4 ${brandColor.replace('bg-', 'border-')} rounded-full border-t-transparent`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className={`w-8 h-8 ${brandColor.replace('bg-', 'text-')} animate-pulse`} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h5 className="text-lg font-bold text-white">Syncing Messages...</h5>
          <p className="text-xs text-slate-400">Fetching threads and technical data</p>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div 
            className={`${brandColor} h-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <p className={`text-[10px] font-mono ${brandColor.replace('bg-', 'text-')}`}>{progress}% Complete</p>
        
        {progress === 100 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onSuccess}
            className={`w-full ${brandColor} hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2`}
          >
            Go to Inbox
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function WhatsAppView({ 
  setPlatforms,
  setChats,
  onSuccess 
}: { 
  setPlatforms?: React.Dispatch<React.SetStateAction<ConnectedPlatform[]>>,
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>,
  onSuccess?: () => void
}) {
  const [method, setMethod] = useState<"api" | "qr">("qr");
  const [qrStatus, setQrStatus] = useState<"waiting" | "scanned" | "connected">("waiting");
  const [realQr, setRealQr] = useState<string | null>(null);
  const [qrSeed, setQrSeed] = useState(Date.now().toString());
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  React.useEffect(() => {
    const socket = io();
    globalSocket = socket;
    console.log("Connecting to WhatsApp socket...");

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("wa_qr", (qr: string) => {
      console.log("QR received via socket");
      setRealQr(qr);
      setQrStatus("waiting");
    });

    socket.on("wa_status", (status: string) => {
      console.log("WhatsApp status:", status);
      if (status === "connected") {
        setQrStatus("connected");
        setRealQr(null);
        startSync("Real Device");
      } else if (status === "disconnected") {
        setQrStatus("waiting");
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // WhatsApp Message Logic
    socket.on("wa_message", (m: any) => {
      console.log("New WA message received:", m);
      const messages = m.messages;
      if (!messages || messages.length === 0) return;

      const msg = messages[0];
      const fromMe = msg.key.fromMe;
      const remoteJid = msg.key.remoteJid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (text && setChats) {
        setChats(prev => {
          const updatedChats = [...prev];
          const chatIndex = updatedChats.findIndex(c => 
            c.platform === 'whatsapp' && (c.profile.phone === remoteJid || c.name.includes(remoteJid.split('@')[0]))
          );

          if (chatIndex !== -1) {
            // Update existing chat
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Avoid duplicate messages if possible
            const isDuplicate = updatedChats[chatIndex].messages.some(m => m.text === text && m.time === timeString);
            if (!isDuplicate) {
              updatedChats[chatIndex].messages.push({
                id: Date.now(),
                text: text,
                sender: fromMe ? "me" : "them",
                time: timeString
              });
              updatedChats[chatIndex].lastMsg = text;
              updatedChats[chatIndex].time = timeString;
              if (!fromMe) updatedChats[chatIndex].unread += 1;
            }
          } else {
            // Create new chat for this JID
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const jidName = remoteJid.split('@')[0];
            
            const newChat: Chat = {
              id: Date.now(),
              name: jidName,
              platform: "whatsapp",
              platformIcon: <Phone className="w-3 h-3" />,
              platformColor: "bg-emerald-500",
              lastMsg: text,
              time: timeString,
              unread: fromMe ? 0 : 1,
              online: true,
              avatar: jidName[0].toUpperCase(),
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: "Real-time WhatsApp User",
                work: "N/A",
                education: "N/A",
                location: "N/A",
                hometown: "N/A",
                relationship: "N/A",
                birthday: "N/A",
                email: "",
                phone: remoteJid,
                gender: "N/A",
                coverImage: "https://picsum.photos/seed/wa/800/300",
                joinedDate: "New"
              },
              messages: [
                { id: Date.now(), text: text, sender: fromMe ? "me" : "them", time: timeString }
              ]
            };
            updatedChats.unshift(newChat);
          }
          return updatedChats;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startSync = (name: string) => {
    setIsSyncing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setSyncProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        if (setChats) {
          const newChat: Chat = {
            id: Date.now(),
            name: `User from ${name}`,
            platform: "whatsapp",
            platformIcon: <Phone className="w-3 h-3" />,
            platformColor: "bg-emerald-500",
            lastMsg: "Is your product support available on WhatsApp?",
            time: "Just now",
            unread: 1,
            online: true,
            avatar: name[0].toUpperCase(),
            isStarred: false,
            isSpam: false,
            isBin: false,
            isDone: false,
            hasOrdered: false,
            assignedTo: null,
            profile: {
              bio: `Support request synced from WhatsApp ${name}.`,
              work: "Lead",
              education: "N/A",
              location: "Bangladesh",
              hometown: "N/A",
              relationship: "New Connection",
              birthday: "N/A",
              email: "wa-user@sync.com",
              phone: name,
              gender: "N/A",
              coverImage: "https://picsum.photos/seed/wa_cover/800/300",
              joinedDate: "April 2024"
            },
            messages: [
              { id: 1, text: `Hello OmniInbox! I just saw your WhatsApp profile for "${name}". Do you provide API support?`, sender: "them", time: "Just now" }
            ]
          };
          setChats(prev => [newChat, ...prev]);
        }
        setTimeout(() => setIsSyncing(false), 2000);
      }
    }, 150);
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (method === "qr" && qrStatus === "waiting" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setQrSeed(Date.now().toString());
      setTimeLeft(60);
    }
    return () => clearInterval(timer);
  }, [method, qrStatus, timeLeft]);

  // Remove the automatic "scanned" timeout to prevent user confusion. 
  // User must now manually "Simulate Scan" for the demo.
  
  const steps = [
    {
      title: "Create Meta Developers Account",
      desc: "Go to developers.facebook.com and create a new app. Select 'Business' as the app type."
    },
    {
      title: "Setup WhatsApp Product",
      desc: "Find WhatsApp in your dashboard and click 'Set Up'. Complete your business profile verification."
    },
    {
      title: "Get Permanent Access Token",
      desc: "Create a System User, give 'WhatsApp Business Management' permission, and generate a permanent token."
    },
    {
      title: "Collect Identifiers",
      desc: "Copy the App ID, Phone Number ID, and Business Account ID from your Meta dashboard."
    }
  ];

  return (
    <motion.div
      key="whatsapp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">WhatsApp Connection</h3>
              <p className="text-slate-400 text-sm">Choose your preferred method to link your account</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setMethod("api"); setQrStatus("waiting"); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${method === "api" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Cloud API
            </button>
            <button 
              onClick={() => setMethod("qr")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${method === "qr" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Link via QR
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "api" ? (
            <motion.div 
              key="api-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Setup Guide</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                <SyncOverlay 
                  isSyncing={isSyncing} 
                  progress={syncProgress} 
                  brandColor="bg-emerald-500" 
                  onSuccess={() => onSuccess?.()} 
                />
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">API Credentials</h4>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  startSync("+880 1712-345678");
                }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Permanent Access Token</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 text-white outline-none transition-all"
                      placeholder="EAAB..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone ID</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 text-white outline-none transition-all"
                        placeholder="10293..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Account ID</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 text-white outline-none transition-all"
                        placeholder="29384..."
                      />
                    </div>
                  </div>
                  <button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 mt-4 active:scale-95"
                  >
                    Verify & Connect
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="qr-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-10"
            >
              <div className="max-w-md w-full text-center space-y-10">
                <div className="relative inline-block">
                  <div className="bg-white p-8 rounded-[2.5rem] inline-block shadow-[0_20px_50px_rgba(16,185,129,0.15)] border-4 border-emerald-500/10">
                    <div 
                      className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center relative group transition-all duration-300 pointer-events-none"
                    >
                      {realQr ? (
                        <div className="relative">
                          <img src={realQr} alt="WhatsApp QR Code" className="w-[220px] h-[220px]" />
                          <div className="absolute inset-0 border border-slate-100 rounded-lg pointer-events-none"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="relative">
                            <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full"></div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center">Generating QR</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight text-center">Secure Connection...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      {qrStatus === "connected" && (
                        <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 rounded-2xl">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                           </div>
                           <h5 className="text-xl font-bold mb-2">Connected!</h5>
                           <p className="text-xs text-white/80 font-medium">Your WhatsApp is now linked.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <button 
                      onClick={() => { setQrSeed(Date.now().toString()); setQrStatus("waiting"); setTimeLeft(60); }}
                      className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform active:rotate-180"
                    >
                      <RefreshCw className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl text-emerald-400 font-mono text-xs">
                      Refresh in {timeLeft}s
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {qrStatus === "waiting" ? (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-black text-white tracking-tight">Link your device</h4>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-3 max-w-sm mx-auto">
                          <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                          <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest leading-tight text-left">
                            End-to-End Encrypted Session. Your messages remain private and secure.
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left space-y-4 max-w-sm mx-auto bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                        <div className="flex gap-4">
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-black shrink-0 border border-slate-700">1</span>
                          <p className="text-sm text-slate-400 font-medium">Open <span className="text-emerald-400 font-bold">WhatsApp</span> on your phone</p>
                        </div>
                        <div className="flex gap-4">
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-black shrink-0 border border-slate-700">2</span>
                          <p className="text-sm text-slate-400 font-medium">Tap <span className="text-slate-200 font-bold">Settings</span> &gt; <span className="text-slate-200 font-bold">Linked Devices</span></p>
                        </div>
                        <div className="flex gap-4">
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-black shrink-0 border border-slate-700">3</span>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">Point your camera to this screen to capture the code</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-widest bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-500/20">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                          Secure Link Protocol Active
                        </div>
                        
                        <div className="max-w-xs space-y-4">
                          <p className="text-slate-500 text-[11px] leading-relaxed text-center italic">If the QR code doesn't appear or you have connection errors, please try resetting the session.</p>
                          <button 
                            onClick={() => {
                              if (globalSocket) {
                                globalSocket.emit("wa_logout");
                                setQrStatus("waiting");
                                setRealQr(null);
                              }
                            }}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Reset & Re-login
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-white tracking-tight">Connected Successfully!</h4>
                        <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Device: SM-G9810 (Android 13)</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (setPlatforms) {
                            setPlatforms(prev => prev.map(p => {
                              if (p.id === 'whatsapp') {
                                const newAccount: PlatformAccount = {
                                  id: `wa-${Date.now()}`,
                                  name: "Business Phone (+8801...)",
                                  status: 'Healthy',
                                  lastSync: "Just now",
                                  details: "Connected via QR"
                                };
                                return { ...p, accounts: [...p.accounts, newAccount] };
                              }
                              return p;
                            }));
                          }
                          if (onSuccess) onSuccess();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/30 text-sm uppercase tracking-[0.2em] animate-pulse"
                      >
                        Enter Workspace
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EditAccountView({ platformId, account, onSave, onCancel }: any) {
  const [name, setName] = useState(account.name);
  const [details, setDetails] = useState(account.details);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0f172a] p-6 rounded-[2rem] border border-blue-500/30 space-y-6 shadow-2xl"
    >
      <div className="space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-widest">Edit Account Details</h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Display Name</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none font-bold" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configuration / Details</label>
          <input 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none font-bold" 
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onSave(platformId, { ...account, name, details })}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Save Changes
        </button>
        <button 
          onClick={onCancel}
          className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function ConnectionsView({ 
  platforms, 
  setPlatforms,
  onConnectWhatsApp, 
  onConnectFacebook, 
  onConnectInstagram,
  onConnectTikTok, 
  onConnectLinkedIn, 
  onConnectX 
}: { 
  platforms: ConnectedPlatform[],
  setPlatforms: React.Dispatch<React.SetStateAction<ConnectedPlatform[]>>,
  onConnectWhatsApp: () => void, 
  onConnectFacebook: () => void, 
  onConnectInstagram: () => void,
  onConnectTikTok: () => void, 
  onConnectLinkedIn: () => void, 
  onConnectX: () => void 
}) {
  const [activeTab, setActiveTab] = useState<"all" | "messaging" | "social" | "business">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingAccountPlatform, setAddingAccountPlatform] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<{ platformId: string, account: PlatformAccount } | null>(null);
  const [newAccountName, setNewAccountName] = useState("");

  const platformMeta: Record<string, { icon: React.ReactNode, color: string, type: string }> = {
    whatsapp: { icon: <Phone className="w-6 h-6" />, color: "text-emerald-400 bg-emerald-500/10", type: "messaging" },
    facebook: { icon: <Facebook className="w-6 h-6" />, color: "text-blue-400 bg-blue-500/10", type: "messaging" },
    x: { icon: <Twitter className="w-6 h-6" />, color: "text-white bg-slate-500/10", type: "social" },
    tiktok: { icon: <Music className="w-6 h-6" />, color: "text-rose-400 bg-rose-500/10", type: "social" },
    linkedin: { icon: <Linkedin className="w-6 h-6" />, color: "text-sky-400 bg-sky-500/10", type: "business" },
    instagram: { icon: <Instagram className="w-6 h-6" />, color: "text-pink-400 bg-pink-500/10", type: "social" },
  };

  const handleAddAccount = (platformId: string) => {
    if (!newAccountName) return;
    
    setPlatforms(prev => prev.map(p => {
      if (p.id === platformId) {
        return {
          ...p,
          accounts: [
            ...p.accounts,
            {
              id: `${platformId}-${Date.now()}`,
              name: newAccountName,
              status: "Healthy",
              lastSync: "Just now",
              details: "Recently Added Account"
            }
          ]
        };
      }
      return p;
    }));
    
    setNewAccountName("");
    setAddingAccountPlatform(null);
  };

  const removeAccount = (platformId: string, accountId: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id === platformId) {
        return {
          ...p,
          accounts: p.accounts.filter(a => a.id !== accountId)
        };
      }
      return p;
    }));
  };

  const filtered = platforms.filter(p => {
    const meta = platformMeta[p.id];
    const matchesTab = activeTab === "all" || (meta && meta.type === activeTab);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const dashboardStats = [
    { label: "Active Integrations", value: "3", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
    { label: "Total Sync Volume", value: "2.4k", icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { label: "API Health", value: "98.2%", icon: <Globe className="w-4 h-4 text-sky-400" /> },
    { label: "System Load", value: "Low", icon: <RefreshCw className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header & Filter Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Connections Central</h3>
          <p className="text-slate-400 mt-1 max-w-sm">Advanced multi-channel hub for API management and data synchronization status.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-900/20">
            <RefreshCw className="w-4 h-4" /> Sync All
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="bg-[#1e293b]/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-xl font-bold text-white">{stat.value}</h4>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-lg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-8">
        {(["all", "messaging", "social", "business"] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Connections Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((platform) => {
            const meta = platformMeta[platform.id];
            return (
              <motion.div
                layout
                key={platform.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-[#1e293b] p-6 rounded-[2.5rem] border border-slate-800 hover:border-slate-600 hover:bg-[#233149] transition-all relative overflow-hidden flex flex-col h-full shadow-2xl"
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${meta?.color || "text-white bg-slate-800"} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-500 ring-4 ring-slate-900/50 shadow-xl`}>
                      {meta?.icon}
                    </div>
                    <div>
                      <h4 
                        onClick={() => {
                          if (platform.id === 'whatsapp') onConnectWhatsApp();
                          else if (platform.id === 'messenger' || platform.id === 'facebook') onConnectFacebook();
                          else if (platform.id === 'instagram') onConnectInstagram();
                          else if (platform.id === 'tiktok') onConnectTikTok();
                          else if (platform.id === 'linkedin') onConnectLinkedIn();
                          else if (platform.id === 'x') onConnectX();
                        }}
                        className="text-xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight cursor-pointer"
                      >
                        {platform.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{platform.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      platform.accounts.length > 0 ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-700"
                    }`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {platform.accounts.length} Active
                    </span>
                  </div>
                </div>

                {/* Accounts List */}
                <div className="space-y-3 flex-1">
                  {platform.accounts.length > 0 ? (
                    platform.accounts.map((acc) => (
                      <div key={acc.id} className="space-y-3">
                        {editingAccount?.account.id === acc.id ? (
                          <EditAccountView 
                            platformId={platform.id}
                            account={acc}
                            onSave={(pId: string, updatedAcc: PlatformAccount) => {
                              setPlatforms(prev => prev.map(p => {
                                if (p.id === pId) {
                                  return {
                                    ...p,
                                    accounts: p.accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a)
                                  };
                                }
                                return p;
                              }));
                              setEditingAccount(null);
                            }}
                            onCancel={() => setEditingAccount(null)}
                          />
                        ) : (
                          <div className="bg-[#0f172a]/80 p-4 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group/acc flex items-center justify-between shadow-inner">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{acc.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{acc.lastSync}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingAccount({ platformId: platform.id, account: acc }); }}
                                className="opacity-0 group-hover/acc:opacity-100 p-2 hover:bg-blue-500/20 text-slate-600 hover:text-blue-400 rounded-lg transition-all"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeAccount(platform.id, acc.id); }}
                                className="opacity-0 group-hover/acc:opacity-100 p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-[#0f172a]/30 rounded-[2rem] border border-dashed border-slate-800">
                      <PlusCircle className="w-8 h-8 text-slate-700 mb-2 opacity-50" />
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center px-4">No accounts linked yet. Use the button below to add.</p>
                    </div>
                  )}
                </div>

                {/* Account Add Flow */}
                {addingAccountPlatform === platform.id ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#0f172a] rounded-2xl border border-blue-500/30 space-y-3 shadow-2xl"
                  >
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Account Name/Number..."
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAccount(platform.id)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none font-bold"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddAccount(platform.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setAddingAccountPlatform(null)}
                        className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        if (platform.id === 'whatsapp') onConnectWhatsApp();
                        else if (platform.id === 'messenger' || platform.id === 'facebook') onConnectFacebook();
                        else if (platform.id === 'instagram') onConnectInstagram();
                        else if (platform.id === 'tiktok') onConnectTikTok();
                        else if (platform.id === 'linkedin') onConnectLinkedIn();
                        else if (platform.id === 'x') onConnectX();
                      }}
                      className="mt-4 w-full py-2 bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-all"
                    >
                      Manage API & Config
                    </button>

                    <button 
                      onClick={() => setAddingAccountPlatform(platform.id)}
                      className="w-full py-4 bg-slate-900 border border-slate-800 hover:border-blue-600/50 hover:bg-blue-600/5 rounded-2xl text-slate-400 hover:text-blue-400 font-bold transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-blue-600/0 group-hover/btn:bg-blue-600/5 transition-all"></div>
                      <PlusCircle className="w-5 h-5 transition-transform group-hover/btn:rotate-90 group-hover/btn:scale-110" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black">Add New Account</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-600/10 to-transparent p-8 rounded-[2rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h5 className="font-bold text-lg text-white">Need help scaling your integrations?</h5>
            <p className="text-sm text-slate-400">Our enterprise API solutions provide 99.9% uptime and 24/7 monitoring.</p>
          </div>
        </div>
        <button className="bg-white hover:bg-slate-100 text-black px-8 py-3 rounded-xl font-bold text-sm whitespace-nowrap active:scale-95 transition-all">
          View Documentation
        </button>
      </div>
    </motion.div>
  );
}

function FacebookMessengerView({ 
  setPlatforms,
  setChats,
  onSuccess,
  setFacebookAccessToken
}: { 
  setPlatforms?: React.Dispatch<React.SetStateAction<ConnectedPlatform[]>>,
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>,
  onSuccess?: () => void,
  setFacebookAccessToken?: (token: string) => void
}) {
  const [method, setMethod] = useState<"api" | "login" | "manage">("login");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<{id: string, name: string, email: string, avatar: string}[]>([]);
  const [loginProgress, setLoginProgress] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualConfig, setManualConfig] = useState({
    token: "",
    pageId: "",
    secret: "",
    pageName: ""
  });
  const [activePages, setActivePages] = useState<Record<string, boolean>>({
    "1": true,
    "2": false,
    "3": true
  });

  const togglePage = (id: string) => {
    setActivePages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const businessPages = [
    { id: "1", name: "Aaramaura Shop", category: "Retail", followers: "12k" },
    { id: "2", name: "Support Hub", category: "Services", followers: "5.4k" },
    { id: "3", name: "Tech Gadgets Store", category: "Electronics", followers: "8.2k" },
  ];

  const handleConnect = (accountName: string) => {
    setIsConnecting(true);
    setLoginProgress(0);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoginProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      if (setPlatforms) {
        setPlatforms(prev => prev.map(p => {
          if (p.id === 'facebook') {
            const newAccount: PlatformAccount = {
              id: `fb-${Date.now()}`,
              name: accountName,
              status: 'Healthy',
              lastSync: "Just now",
              details: "Messenger API Active"
            };
            return { ...p, accounts: [...p.accounts, newAccount] };
          }
          return p;
        }));
      }
      if (manualConfig.token && setFacebookAccessToken) {
        setFacebookAccessToken(manualConfig.token);
      }
      setIsConnecting(false);
      setIsVerified(true);
      
      // Start Syncing Process
      setIsSyncing(true);
      let progress = 0;
      const syncInterval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
          clearInterval(syncInterval);
          if (setChats) {
            const newChatId = Date.now();
            const newChat: Chat = {
              id: newChatId,
              name: `Customer from ${accountName}`,
              platform: "messenger",
              platformIcon: <Facebook className="w-3 h-3" />,
              platformColor: "bg-blue-500",
              lastMsg: "Is this page active for orders?",
              time: "Just now",
              unread: 1,
              online: true,
              avatar: accountName[0].toUpperCase(),
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: `New customer synced from ${accountName} via Manual API.`,
                work: "Customer",
                education: "N/A",
                location: "Dhaka, Bangladesh",
                hometown: "N/A",
                relationship: "New Lead",
                birthday: "N/A",
                email: "customer@fb-sync.com",
                phone: "+8801XXXXXXX",
                gender: "N/A",
                coverImage: "https://picsum.photos/seed/fb_cover/800/300",
                joinedDate: "April 2024"
              },
              messages: [
                { id: 1, text: `Assalamu Alaikum! I saw your page "${accountName}" and I wanted to know if you are taking new orders?`, sender: "them", time: "Just now" }
              ]
            };
            setChats(prev => [newChat, ...prev]);
          }
          setTimeout(() => setIsSyncing(false), 2000);
        }
      }, 150);

      const newUserId = `fb-${Date.now()}`;
      const userNames = ["Amaizing IT", "Aaramaura Admin", "Support Lead", "Marketing Pro"];
      const selectedName = userNames[connectedUsers.length % userNames.length];
      
      const newUser = {
        id: newUserId,
        name: `${selectedName} (ID: ${Math.floor(Math.random() * 90000) + 10000})`,
        email: `${selectedName.toLowerCase().replace(" ", "")}@facebook.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserId}`
      };
      
      setConnectedUsers(prev => [...prev, newUser]);
    }, 1500);
  };

  const steps = [
    {
      title: "Create Meta App",
      desc: "Register at developers.facebook.com and create a 'Business' app for your project."
    },
    {
      title: "Add Messenger Product",
      desc: "Configure the Messenger product and set up a Webhook to receive real-time messages."
    },
    {
      title: "Link Facebook Pages",
      desc: "Connect your business pages to the app and grant 'pages_messaging' permissions."
    },
    {
      title: "Generate tokens",
      desc: "Get Page Access Tokens for each connected page to start sending and receiving content."
    }
  ];

  return (
    <motion.div
      key="facebook"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
              <Facebook className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Facebook & Messenger</h3>
              <p className="text-slate-400 text-sm">Connect and manage your business pages</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setMethod("login")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "login" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Express Link
            </button>
            <button 
              onClick={() => setMethod("manage")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "manage" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Manage Pages
            </button>
            <button 
              onClick={() => setMethod("api")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "api" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Manual API
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "login" ? (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 space-y-12"
            >
              {connectedUsers.length > 0 && (
                <div className="w-full flex flex-wrap justify-center gap-6">
                  {connectedUsers.map((user) => (
                    <motion.div 
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-blue-500/30 flex flex-col items-center space-y-4 shadow-2xl relative overflow-hidden group min-w-[280px]"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 animate-gradient-x"></div>
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt="FB Profile" 
                          className="w-20 h-20 rounded-full border-4 border-[#1e293b] shadow-xl group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
                          <Facebook className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="text-center space-y-0.5">
                        <h4 className="text-lg font-black text-white leading-tight">{user.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Connected</span>
                        </div>
                        <button 
                          onClick={() => {
                            setConnectedUsers(prev => prev.filter(u => u.id !== user.id));
                          }}
                          className="bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 px-3 py-1 rounded-full border border-slate-700 hover:border-rose-500/30 text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center space-y-8 w-full max-w-md">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40">
                    <Facebook className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-2xl font-bold">
                      {connectedUsers.length > 0 ? "Add Another Account" : "Connect via Facebook"}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed px-8">
                      {connectedUsers.length > 0 
                        ? "You can connect multiple Facebook accounts to manage all your business pages in one central inbox."
                        : "Connect your Meta account to automatically discover all your business pages and setup Messenger integration."
                      }
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                  <button 
                    onClick={() => handleConnect("Business Page")}
                    disabled={isConnecting}
                    className="flex items-center gap-3 bg-[#1877f2] hover:bg-[#166fe5] text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-80 disabled:cursor-wait min-w-[280px] justify-center"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Facebook className="w-5 h-5" />
                    )}
                    {isConnecting ? "Connecting to Meta..." : connectedUsers.length > 0 ? "Add New Facebook ID" : "Continue with Facebook"}
                  </button>
                  
                  {isConnecting && (
                    <div className="w-full max-w-[280px] h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${loginProgress}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
                Securely powered by Meta Graph API • Multiple Account Support Active
              </p>
            </motion.div>
          ) : method === "manage" ? (
            <motion.div
              key="manage-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Linked Pages</h4>
                <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {Object.values(activePages).filter(Boolean).length} Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessPages.map((page) => (
                  <div key={page.id} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                        {page.name[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-100">{page.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{page.category}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{page.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => togglePage(page.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none ${activePages[page.id] ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${activePages[page.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
              
                <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10 flex items-start gap-4 mt-8">
                  <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Messages from <span className="text-blue-400 font-bold">Active</span> pages will be routed to your unified inbox. Deactivating a page will stop receiving new messages from it until reactivated.
                  </p>
                </div>

                <div className="pt-6 flex justify-end">
                   <button 
                    onClick={() => handleConnect(`${Object.values(activePages).filter(Boolean).length} Pages Synchronized`)}
                    disabled={isConnecting}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                   >
                     {isConnecting ? "Updating..." : "Save & Sync Pages"}
                   </button>
                </div>
              </motion.div>
          ) : (
            <motion.div 
              key="api-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Connection Process</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                {isVerified && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-[#0f172a]/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
                  >
                    {isSyncing ? (
                      <div className="space-y-6 w-full max-w-xs transition-all">
                        <div className="relative w-20 h-20 mx-auto">
                          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                          <motion.div 
                            className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          ></motion.div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-black text-white">Syncing Messages...</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fetching historical data from {manualConfig.pageName}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${syncProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                            <span>Indexing threads</span>
                            <span>{syncProgress}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all scale-110">
                          <Check className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Connected & Synced!</h4>
                        <p className="text-slate-400 text-sm font-medium mb-8">Manual API is active. Historical messages have been imported to your inbox.</p>
                        <button 
                          onClick={onSuccess}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                        >
                          Go to Inbox
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manual API Config</h4>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  if (manualConfig.token && manualConfig.pageId && manualConfig.secret && manualConfig.pageName) {
                    handleConnect(manualConfig.pageName);
                  }
                }}>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Business Page Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={manualConfig.pageName}
                        onChange={(e) => setManualConfig(prev => ({ ...prev, pageName: e.target.value }))}
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 text-white outline-none transition-all pr-10"
                        placeholder="e.g. Aaramaura Shop"
                        required
                      />
                      {manualConfig.pageName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Page Access Token</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={manualConfig.token}
                        onChange={(e) => setManualConfig(prev => ({ ...prev, token: e.target.value }))}
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 text-white outline-none transition-all pr-10"
                        placeholder="EAAO..."
                        required
                      />
                      {manualConfig.token && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Facebook Page ID</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={manualConfig.pageId}
                        onChange={(e) => setManualConfig(prev => ({ ...prev, pageId: e.target.value }))}
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 text-white outline-none transition-all pr-10"
                        placeholder="pg_10023..."
                        required
                      />
                      {manualConfig.pageId && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">App Secret</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={manualConfig.secret}
                        onChange={(e) => setManualConfig(prev => ({ ...prev, secret: e.target.value }))}
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 text-white outline-none transition-all pr-10"
                        placeholder="••••••••••••"
                        required
                      />
                      {manualConfig.secret && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isConnecting || !manualConfig.token || !manualConfig.pageId || !manualConfig.secret || !manualConfig.pageName}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-4 active:scale-95 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Connect"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TikTokView({ setPlatforms, setChats, onSuccess }: { setPlatforms: any, setChats: any, onSuccess: any }) {
  const [method, setMethod] = useState<"api" | "login" | "manage">("login");
  const [activeAccounts, setActiveAccounts] = useState<Record<string, boolean>>({
    "1": true,
    "2": false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsSyncing(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          if (setChats) {
            const newChat: Chat = {
              id: Date.now(),
              name: "TikTok Creator",
              platform: "tiktok",
              platformIcon: <Music className="w-3 h-3" />,
              platformColor: "bg-rose-500",
              lastMsg: "Loved your latest short video response!",
              time: "Just now",
              unread: 1,
              online: true,
              avatar: "TC",
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: "New TikTok interaction synced via TikTok API.",
                work: "Influencer",
                education: "N/A",
                location: "Dhaka",
                hometown: "N/A",
                relationship: "New Interaction",
                birthday: "N/A",
                email: "creator@tiktok-sync.com",
                phone: "N/A",
                gender: "N/A",
                coverImage: "https://picsum.photos/seed/tiktok_cover/800/300",
                joinedDate: "April 2024"
              },
              messages: [{ id: 1, text: "I just saw your TikTok video and wanted to connect!", sender: "them", time: "Just now" }]
            };
            setChats((prev: any) => [newChat, ...prev]);
          }
          setTimeout(() => setIsSyncing(false), 2000);
          if (setPlatforms) {
            setPlatforms((prev: any) => prev.map((p: any) => p.id === 'tiktok' ? { ...p, status: 'Healthy', accounts: 1 } : p));
          }
        }
      }, 100);
    }, 1500);
  };

  const toggleAccount = (id: string) => {
    setActiveAccounts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const businessAccounts = [
    { id: "1", name: "@lifestyle_creators", type: "Creator", followers: "45.2k" },
    { id: "2", name: "@tech_tips_daily", type: "Business", followers: "128k" },
  ];

  const steps = [
    {
      title: "Register on TikTok for Developers",
      desc: "Create an account at developers.tiktok.com and apply for 'TikTok for Business' access."
    },
    {
      title: "Create App & Select Scopes",
      desc: "Create a new app and ensure you request 'video.list' and 'message.send' permissions."
    },
    {
      title: "Configure Redirect Whitelist",
      desc: "Add your dashboard URL to the allowed redirect list in the TikTok developer portal."
    },
    {
      title: "Exchange Auth Code for Token",
      desc: "Implement the OAuth flow to receive a long-lived Access Token for account management."
    }
  ];

  return (
    <motion.div
      key="tiktok"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <SyncOverlay 
          isSyncing={isSyncing} 
          progress={syncProgress} 
          brandColor="bg-rose-500" 
          onSuccess={() => onSuccess?.()} 
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">TikTok Integration</h3>
              <p className="text-slate-400 text-sm">Connect your TikTok Creator or Business accounts</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setMethod("login")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${method === "login" ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              TikTok Login
            </button>
            <button 
              onClick={() => setMethod("manage")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${method === "manage" ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Accounts
            </button>
            <button 
              onClick={() => setMethod("api")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${method === "api" ? "bg-rose-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Advanced API
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "login" ? (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 space-y-8"
            >
              <div className="w-20 h-20 bg-black rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-900/20 border border-slate-800">
                <Music className="w-10 h-10 text-white" />
              </div>
              <div className="text-center max-w-md space-y-4">
                <h4 className="text-2xl font-bold">Connect TikTok</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sign in with your TikTok account to manage messages and track performance directly from OmniInbox.
                </p>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-3 bg-black hover:bg-slate-900 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 border border-slate-800 text-sm disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Music className="w-5 h-5 text-rose-500" />
                )}
                {isConnecting ? "Connecting..." : "Continue with TikTok"}
              </button>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by TikTok for Developers API</p>
            </motion.div>
          ) : method === "manage" ? (
            <motion.div
              key="manage-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Connected Accounts</h4>
                <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {Object.values(activeAccounts).filter(Boolean).length} Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessAccounts.map((acc) => (
                  <div key={acc.id} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-rose-400 font-bold group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-100">{acc.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{acc.type}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{acc.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleAccount(acc.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none ${activeAccounts[acc.id] ? 'bg-rose-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${activeAccounts[acc.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="api-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Developer Setup</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">API Configuration</h4>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect();
                }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Client Key</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 text-white outline-none transition-all"
                      placeholder="aw12..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Client Secret</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 text-white outline-none transition-all"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Dashboard ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 text-white outline-none transition-all"
                      placeholder="dash_99..."
                    />
                  </div>
                  <button 
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-rose-900/20 mt-4 active:scale-95"
                  >
                    Save & Test Connection
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LinkedInView({ setPlatforms, setChats, onSuccess }: { setPlatforms: any, setChats: any, onSuccess: any }) {
  const [method, setMethod] = useState<"api" | "login" | "manage">("login");
  const [activePages, setActivePages] = useState<Record<string, boolean>>({
    "1": true
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsSyncing(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          if (setChats) {
            const newChat: Chat = {
              id: Date.now(),
              name: "Professional Lead",
              platform: "linkedin",
              platformIcon: <Linkedin className="w-3 h-3" />,
              platformColor: "bg-sky-600",
              lastMsg: "Interested in your business services.",
              time: "Just now",
              unread: 1,
              online: true,
              avatar: "PL",
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: "Professional lead synced via LinkedIn OAuth.",
                work: "Business Executive",
                education: "N/A",
                location: "Singapore",
                hometown: "N/A",
                relationship: "B2B Prospect",
                birthday: "N/A",
                email: "professional@linkedin-sync.com",
                phone: "N/A",
                gender: "N/A",
                coverImage: "https://picsum.photos/seed/linked_cover/800/300",
                joinedDate: "April 2024"
              },
              messages: [{ id: 1, text: "Assalamu Alaikum! I would like to discuss a potential business partnership.", sender: "them", time: "Just now" }]
            };
            setChats((prev: any) => [newChat, ...prev]);
          }
          setTimeout(() => setIsSyncing(false), 2000);
          if (setPlatforms) {
            setPlatforms((prev: any) => prev.map((p: any) => p.id === 'linkedin' ? { ...p, status: 'Healthy', accounts: 2 } : p));
          }
        }
      }, 100);
    }, 1500);
  };

  const togglePage = (id: string) => {
    setActivePages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const businessPages = [
    { id: "1", name: "OmniInbox Corp", type: "Company Page", followers: "1.2k" },
    { id: "2", name: "Tech Solutions Dhaka", type: "Showcase Page", followers: "850" },
  ];

  const steps = [
    {
      title: "Create LinkedIn Developer App",
      desc: "Go to linkedin.com/developers and create a new app. Request 'Marketing Developer Platform' access."
    },
    {
      title: "Verify Page Ownership",
      desc: "Generate a verification URL and have the Page Admin approve the app connection."
    },
    {
      title: "Configure OAuth 2.0",
      desc: "Set up the 'r_organization_social' and 'w_organization_social' permissions for messaging."
    },
    {
      title: "Sync Organization ID",
      desc: "Locate your Organization URN (e.g., urn:li:organization:12345) to enable direct routing."
    }
  ];

  return (
    <motion.div
      key="linkedin"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <SyncOverlay 
          isSyncing={isSyncing} 
          progress={syncProgress} 
          brandColor="bg-sky-600" 
          onSuccess={() => onSuccess?.()} 
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center">
              <Linkedin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">LinkedIn Pages</h3>
              <p className="text-slate-400 text-sm">Manage company pages and showcase accounts</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setMethod("login")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "login" ? "bg-sky-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Express Link
            </button>
            <button 
              onClick={() => setMethod("manage")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "manage" ? "bg-sky-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Pages
            </button>
            <button 
              onClick={() => setMethod("api")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "api" ? "bg-sky-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Manual API
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "login" ? (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 space-y-8"
            >
              <div className="w-20 h-20 bg-[#0077b5] rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-sky-900/40">
                <Linkedin className="w-10 h-10 text-white" />
              </div>
              <div className="text-center max-w-md space-y-4">
                <h4 className="text-2xl font-bold">Connect LinkedIn</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Connect your professional account to automatically sync and manage your company page conversations.
                </p>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-3 bg-[#0077b5] hover:bg-[#006399] text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Linkedin className="w-5 h-5" />
                )}
                {isConnecting ? "Authorizing..." : "Sign in with LinkedIn"}
              </button>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Securely integrated via LinkedIn Marketing Solutions</p>
            </motion.div>
          ) : method === "manage" ? (
            <motion.div
              key="manage-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active LinkedIn Pages</h4>
                <span className="text-xs text-sky-400 font-bold bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                  {Object.values(activePages).filter(Boolean).length} Synced
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessPages.map((page) => (
                  <div key={page.id} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-sky-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-sky-400 font-bold group-hover:scale-110 transition-transform">
                        {page.name[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-100">{page.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{page.type}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{page.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => togglePage(page.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none ${activePages[page.id] ? 'bg-sky-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${activePages[page.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="api-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">API Setup Process</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manual API Config</h4>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect();
                }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Client ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 text-white outline-none transition-all"
                      placeholder="78xxx..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Client Secret</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 text-white outline-none transition-all"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Organization URN</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-sky-500 text-white outline-none transition-all"
                      placeholder="urn:li:organization:..."
                    />
                  </div>
                  <button 
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-900/20 mt-4 active:scale-95"
                  >
                    Authorize OmniInbox
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InstagramView({ setPlatforms, setChats, onSuccess }: { setPlatforms: any, setChats: any, onSuccess: any }) {
  const [method, setMethod] = useState<"login" | "api">("login");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsSyncing(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          if (setChats) {
            const newChat: Chat = {
              id: Date.now(),
              name: "Insta Customer",
              platform: "instagram",
              platformIcon: <Instagram className="w-3 h-3" />,
              platformColor: "bg-pink-500",
              lastMsg: "Send pricing for this product.",
              time: "Just now",
              unread: 1,
              online: true,
              avatar: "IC",
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: "New follower synced via Instagram Graph API.",
                work: "Blogger",
                education: "N/A",
                location: "Dhaka",
                hometown: "N/A",
                relationship: "Follower",
                birthday: "N/A",
                email: "insta@sync.com",
                phone: "N/A",
                gender: "Female",
                coverImage: "https://picsum.photos/seed/insta_cover/800/300",
                joinedDate: "April 2024"
              },
              messages: [{ id: 1, text: "Hi, can I get the price list for your clothes?", sender: "them", time: "Just now" }]
            };
            setChats((prev: any) => [newChat, ...prev]);
          }
          setTimeout(() => setIsSyncing(false), 2000);
          if (setPlatforms) {
            setPlatforms((prev: any) => prev.map((p: any) => p.id === 'instagram' ? { ...p, status: 'Healthy', accounts: 1 } : p));
          }
        }
      }, 100);
    }, 1500);
  };
  
  const steps = [
    {
      title: "Convert to Business Profile",
      desc: "Ensure your Instagram account is switched to a 'Professional/Business' account and linked to a Facebook Page."
    },
    {
      title: "Grant Meta Permissions",
      desc: "Allow OmniInbox to manage your Instagram messages and comments via the Graph API flow."
    },
    {
      title: "Configure Automated Replies",
      desc: "Set up keywords or quick replies specifically for Instagram DMs and Story mentions."
    }
  ];

  return (
    <motion.div
      key="instagram"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <SyncOverlay 
          isSyncing={isSyncing} 
          progress={syncProgress} 
          brandColor="bg-pink-600" 
          onSuccess={() => onSuccess?.()} 
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Instagram Integration</h3>
              <p className="text-slate-400 text-sm">Automate Story replies, DMs and comments</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setMethod("login")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${method === "login" ? "bg-pink-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Link via Facebook
            </button>
            <button 
              onClick={() => setMethod("api")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${method === "api" ? "bg-pink-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Manual API
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "login" ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl">
                  <Instagram className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl border-4 border-[#1e293b] flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center max-w-md space-y-4">
                <h4 className="text-2xl font-bold">Connect via Facebook Login</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Instagram DMs require a connection through your Meta Business Suite. Log in with your Facebook account that manages the linked page.
                </p>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-3 bg-pink-600 hover:bg-pink-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Instagram className="w-5 h-5" />
                )}
                {isConnecting ? "Linking..." : "Link Instagram Business"}
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Setup Steps</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Instagram Graph API</h4>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">IG Business ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-pink-500 text-white outline-none transition-all"
                      placeholder="1784xxx..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Page Access Token</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-pink-500 text-white outline-none transition-all"
                      placeholder="EAAB..."
                    />
                  </div>
                  <button 
                    onClick={handleConnect}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-900/20 mt-4 active:scale-95"
                  >
                    Authenticate Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function XView({ setPlatforms, setChats, onSuccess }: { setPlatforms: any, setChats: any, onSuccess: any }) {
  const [method, setMethod] = useState<"api" | "login" | "manage">("login");
  const [activeProfiles, setActiveProfiles] = useState<Record<string, boolean>>({
    "1": true
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsSyncing(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          if (setChats) {
            const newChat: Chat = {
              id: Date.now(),
              name: "X User",
              platform: "x",
              platformIcon: <Twitter className="w-3 h-3" />,
              platformColor: "bg-slate-700",
              lastMsg: "Loved your latest tweet!",
              time: "Just now",
              unread: 1,
              online: true,
              avatar: "XU",
              isStarred: false,
              isSpam: false,
              isBin: false,
              isDone: false,
              hasOrdered: false,
              assignedTo: null,
              profile: {
                bio: "X interaction synced via Twitter API V2.",
                work: "N/A",
                education: "N/A",
                location: "Global",
                hometown: "N/A",
                relationship: "Follower",
                birthday: "N/A",
                email: "x@sync.com",
                phone: "N/A",
                gender: "N/A",
                coverImage: "https://picsum.photos/seed/x_cover/800/300",
                joinedDate: "April 2024"
              },
              messages: [{ id: 1, text: "I just saw your update on X and I want to know more about the pricing.", sender: "them", time: "Just now" }]
            };
            setChats((prev: any) => [newChat, ...prev]);
          }
          setTimeout(() => setIsSyncing(false), 2000);
          if (setPlatforms) {
            setPlatforms((prev: any) => prev.map((p: any) => p.id === 'x' ? { ...p, status: 'Healthy', accounts: 1 } : p));
          }
        }
      }, 100);
    }, 1500);
  };

  const toggleProfile = (id: string) => {
    setActiveProfiles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const businessProfiles = [
    { id: "1", name: "@OmniInbox_HQ", type: "Business Profile", followers: "5.8k" },
    { id: "2", name: "@Solution_Center", type: "Support Account", followers: "2.1k" },
  ];

  const steps = [
    {
      title: "Register on X Developer Portal",
      desc: "Access developer.x.com and sign up for 'Free' or 'Basic' tier access."
    },
    {
      title: "Set Up Project & App",
      desc: "Create a Project and an App to obtain your API Key, API Secret, and Bearer Token."
    },
    {
      title: "Enable User Authentication",
      desc: "Configure OAuth 2.0 Settings with 'Read and Write' permissions for DM management."
    },
    {
      title: "Whale Hook Configuration",
      desc: "Set up real-time webhooks to receive instant notifications for mentions and direct messages."
    }
  ];

  return (
    <motion.div
      key="x-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <SyncOverlay 
          isSyncing={isSyncing} 
          progress={syncProgress} 
          brandColor="bg-white" 
          onSuccess={() => onSuccess?.()} 
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10">
              <Twitter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">X Integration</h3>
              <p className="text-slate-400 text-sm">Manage business profiles and direct messages</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setMethod("login")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "login" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Connect X
            </button>
            <button 
              onClick={() => setMethod("manage")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "manage" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              Profiles
            </button>
            <button 
              onClick={() => setMethod("api")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${method === "api" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              V2 API Config
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {method === "login" ? (
            <motion.div 
              key="x-login-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12 space-y-8"
            >
              <div className="w-20 h-20 bg-black rounded-[1.5rem] flex items-center justify-center shadow-xl border border-slate-800 ring-2 ring-white/10">
                <Twitter className="w-10 h-10 text-white" />
              </div>
              <div className="text-center max-w-md space-y-4">
                <h4 className="text-2xl font-bold text-white">Authorize X</h4>
                <p className="text-slate-400 text-sm leading-relaxed text-balance">
                  Link your X profile to OmniInbox to read feeds, track hashtags, and respond to direct messages in one place.
                </p>
              </div>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-3 bg-white hover:bg-slate-200 text-black px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                ) : (
                  <Twitter className="w-5 h-5" />
                )}
                {isConnecting ? "Authenticating..." : "Auth via OAuth 2.0"}
              </button>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure connection using X V2 API</p>
            </motion.div>
          ) : method === "manage" ? (
            <motion.div
              key="x-manage-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Linked X Profiles</h4>
                <span className="text-xs text-white font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  {Object.values(activeProfiles).filter(Boolean).length} Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessProfiles.map((p) => (
                  <div key={p.id} className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-white/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform border border-white/10">
                        {p.name[1].toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-100">{p.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{p.type}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-wider">{p.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleProfile(p.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none ${activeProfiles[p.id] ? 'bg-blue-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${activeProfiles[p.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="x-api-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Developer Onboarding</h4>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-black flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm">{step.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 space-y-6 self-start relative overflow-hidden">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">X V2 API Credentials</h4>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect();
                }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">API Key</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-white text-white outline-none transition-all placeholder:text-slate-600"
                      placeholder="x_api_..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">API Secret Key</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-white text-white outline-none transition-all placeholder:text-slate-600"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Bearer Token</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-white text-white outline-none transition-all placeholder:text-slate-600"
                      placeholder="AAA..."
                    />
                  </div>
                  <button 
                    className="w-full bg-slate-100 hover:bg-white text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/20 mt-4 active:scale-95"
                  >
                    Verify Credentials
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ChatsView({ setOrders, setLeads, employees, chats, setChats }: { 
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>, 
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  employees: Employee[],
  chats: Chat[],
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
}) {
  const [selectedChat, setSelectedChat] = useState<number | null>(chats.length > 0 ? chats[0].id : null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Messages");
  const [newIdentity, setNewIdentity] = useState({ platform: 'whatsapp', number: '' });
  const [orderRate, setOrderRate] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderPaidAmount, setOrderPaidAmount] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderAgent, setOrderAgent] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [translatingId, setTranslatingId] = useState<number | null>(null);

  const translateText = async (text: string, toLang: string = targetLanguage) => {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${toLang}. Return ONLY the translated text.
        
        Text: ${text}`,
      });
      return result.text?.trim() || text;
    } catch (err) {
      console.error(err);
      return text;
    }
  };

  const handleTranslateMessage = async (msgId: number, originalText: string) => {
    if (translatingId) return;
    setTranslatingId(msgId);
    try {
      const translated = await translateText(originalText);
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            messages: chat.messages.map(m => 
              m.id === msgId ? { ...m, translatedText: translated } : m
            )
          };
        }
        return chat;
      }));
    } finally {
      setTranslatingId(null);
    }
  };

  const handleBengaliToEnglishInput = async () => {
    if (!messageText.trim() || isAIGenerating) return;
    setIsAIGenerating(true);
    try {
      const translated = await translateText(messageText, "English");
      setMessageText(translated);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const ProfileInfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start gap-4 group cursor-default">
      <div className="mt-1 text-slate-500 bg-slate-800/50 p-2 rounded-xl group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-[12px] text-slate-300 font-bold leading-tight truncate" title={value}>{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const handleAISmartReply = async () => {
    if (!currentChat || isAIGenerating) return;
    setIsAIGenerating(true);
    try {
      const lastMessages = currentChat.messages.slice(-5).map(m => `${m.sender === 'me' ? 'Agent' : 'Customer'}: ${m.text}`).join("\n");
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional customer support assistant for OmniInbox. Based on this conversation history, suggest a short, helpful, and polite reply for the agent to send. Reply only with the suggested text. Use the same language as the customer (Bengali or English).
        
        History:
        ${lastMessages}`,
      });
      setMessageText(result.text?.trim() || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAIGenerating(false);
    }
  };
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [newReplyImage, setNewReplyImage] = useState<string | null>(null);
  const [savedReplies, setSavedReplies] = useState([
    { id: 1, title: "Welcome", content: "Assalamu Alaikum! How can I help you?", imageUrl: null },
    { id: 2, title: "Wait", content: "Thank you for contacting us. We will reply soon.", imageUrl: null },
    { id: 3, title: "Phone Request", content: "Could you please share your contact number?", imageUrl: null },
    { id: 4, title: "Order Update", content: "Your order is being processed.", imageUrl: null },
    { id: 5, title: "Closing", content: "Is there anything else I can help with?", imageUrl: null }
  ]);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<any>(null);

  // Handle Recording Timer
  React.useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvas.toDataURL("image/png"));
      }
    }
  };

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const fakeTranscript = "এই মেসেজটি টেক্সটে কনভার্ট হয়েছে"; // Simulated STT for Bengali
    if (targetLanguage === "English") {
      setIsAIGenerating(true);
      const translated = await translateText(fakeTranscript, "English");
      handleSendMessage(`🎤 Voice: ${translated} (Translated from Bengali)`);
      setIsAIGenerating(false);
    } else {
      handleSendMessage(`🎤 Voice Message (${formatTime(recordingTime)})`);
    }
  };

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, chats]);

  const handleSendMedia = (type: 'image' | 'voice', data: string) => {
    if (selectedChat === null) return;
    const updatedChats = [...chats];
    const chatIndex = updatedChats.findIndex(c => c.id === selectedChat);
    if (chatIndex !== -1) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedChats[chatIndex].messages.push({
        id: Date.now(),
        text: type === 'image' ? "Captured Photo" : "Voice Message",
        type: type,
        mediaUrl: data,
        sender: "me",
        time: timeString
      });
      updatedChats[chatIndex].lastMsg = type === 'image' ? "📷 Photo" : "🎤 Voice Message";
      updatedChats[chatIndex].time = timeString;
      setChats(updatedChats);
      stopCamera();
    }
  };

  const handleSendMessage = (textOverride?: string, imageOverride?: string) => {
    const textToSend = textOverride || messageText;
    if ((!textToSend.trim() && !imageOverride) || selectedChat === null) return;

    const updatedChats = [...chats];
    const chatIndex = updatedChats.findIndex(c => c.id === selectedChat);
    
    if (chatIndex !== -1) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      updatedChats[chatIndex].messages.push({
        id: Date.now(),
        text: textToSend,
        type: imageOverride ? 'image' : undefined,
        mediaUrl: imageOverride as string,
        sender: "me",
        time: timeString
      });
      updatedChats[chatIndex].lastMsg = imageOverride ? "📷 " + textToSend : textToSend;
      updatedChats[chatIndex].time = timeString;
      
      setChats(updatedChats);

      // Real WhatsApp message sending
      if (updatedChats[chatIndex].platform === 'whatsapp' && globalSocket) {
        const jid = updatedChats[chatIndex].profile.phone;
        if (jid && jid.includes('@')) {
          console.log("Emitting real-time message to WhatsApp:", jid);
          globalSocket.emit("wa_send_message", { jid, text: textToSend });
        }
      }

      // Real Facebook message sending
      if ((updatedChats[chatIndex].platform === 'messenger' || updatedChats[chatIndex].platform === 'facebook') && globalSocket && facebookAccessToken) {
        const recipientId = updatedChats[chatIndex].profile.phone; // Assuming Page Scoped ID is stored here
        if (recipientId) {
          console.log("Emitting real-time message to Facebook:", recipientId);
          globalSocket.emit("fb_send_message", { recipientId, text: textToSend, accessToken: facebookAccessToken });
        }
      }

      if (!textOverride) setMessageText("");
      setIsRepliesOpen(false);
    }
  };

  const currentChat = selectedChat !== null ? chats.find(c => c.id === selectedChat) : null;
  const filteredChats = chats.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Bin filter is highest priority
    if (activeFilter === "Bin") return matchesSearch && c.isBin;
    if (c.isBin) return false;

    // Done filter
    if (activeFilter === "Done") return matchesSearch && c.isDone;
    if (c.isDone && activeFilter !== "Done") return false;

    // Spam filter is exclusive
    if (activeFilter === "Spam") return matchesSearch && c.isSpam;
    
    // Other filters exclude spam
    if (c.isSpam) return false;

    if (activeFilter === "All Messages") return matchesSearch;
    if (activeFilter === "Unread") return matchesSearch && c.unread > 0;
    if (activeFilter === "Priority") return matchesSearch && c.online;
    if (activeFilter === "Ad replies") return matchesSearch && c.platform === 'messenger';
    if (activeFilter === "Follow up") return matchesSearch && c.isStarred;
    if (activeFilter === "Ordered") return matchesSearch && c.hasOrdered;
    return matchesSearch;
  });

  const toggleStar = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isStarred: !chat.isStarred } : chat
    ));
  };

  const toggleSpam = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isSpam: !chat.isSpam } : chat
    ));
    if (selectedChat === chatId) setSelectedChat(null);
  };

  const toggleBin = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isBin: !chat.isBin, unread: 0 } : chat
    ));
    if (selectedChat === chatId) {
      // Find another chat to select or just deselect
      setSelectedChat(null);
    }
  };

  const toggleDone = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isDone: !chat.isDone } : chat
    ));
    if (selectedChat === chatId) {
      setSelectedChat(null);
    }
  };

  const toggleReadStatus = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unread: chat.unread > 0 ? 0 : 1 } : chat
    ));
  };

  const handleAssign = (chatId: number, employeeName: string | null) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, assignedTo: employeeName } : chat
    ));
    // Add a small delay to close so user sees the change
    setTimeout(() => setIsAssignMenuOpen(false), 200);
  };

  const handleMigrateHistory = () => {
    if (!currentChat) return;
    setChats(prev => prev.map(c => 
      c.id === currentChat.id ? { 
        ...c, 
        platform: newIdentity.platform,
        platformColor: newIdentity.platform === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500',
        platformIcon: newIdentity.platform === 'whatsapp' ? <Phone className="w-3 h-3" /> : <Facebook className="w-3 h-3" />
      } : c
    ));
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    currentChat.messages.push({
      id: Date.now(),
      text: `🔄 System: Conversation migrated to ${newIdentity.platform.toUpperCase()} (${newIdentity.number})`,
      sender: "me",
      time: timeString
    });
    setIsMigrationModalOpen(false);
    setNewIdentity({ platform: 'whatsapp', number: '' });
  };

  const handleCreateOrder = () => {
    if (!currentChat || !orderRate || !orderAmount) return;
    
    const rate = parseFloat(orderRate);
    const qty = parseFloat(orderAmount);
    const total = rate * qty;
    const paid = parseFloat(orderPaidAmount || "0");
    const due = total - paid;
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: currentChat.name,
      phone: orderPhone,
      item: `Order from Chat`,
      amount: `৳${total.toFixed(2)}`,
      paid: `৳${paid.toFixed(2)}`,
      due: `৳${due.toFixed(2)}`,
      status: due <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
      date: new Date().toISOString().split('T')[0],
      channel: orderAgent || employees[0]?.name || "System"
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setChats(prev => prev.map(c => c.id === currentChat.id ? { ...c, hasOrdered: true } : c));
    handleSendMessage(`✅ Order Created: ৳${total.toFixed(2)} (Paid: ৳${paid.toFixed(2)}, Due: ৳${due.toFixed(2)})${orderPhone ? `\n📞 Phone: ${orderPhone}` : ""}`);
    setIsOrderModalOpen(false);
    setOrderRate("");
    setOrderAmount("");
    setOrderPaidAmount("");
    setOrderPhone("");
    setOrderAgent("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-[#0f172a] overflow-hidden absolute inset-0 sm:static"
    >
      {/* Chats Sidebar */}
      <aside className="w-[320px] border-r border-slate-800 flex flex-col bg-[#020617]/50">
        <div className="p-4 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Inbox</h3>
          </div>
          
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsManageMenuOpen(!isManageMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-bold transition-all ${isManageMenuOpen ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#1e293b]/50 border-slate-800 text-slate-200 hover:bg-[#1e293b]'}`}
              >
                <Layers className="w-4 h-4" />
                <span>Manage</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isManageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isManageMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-[70] overflow-hidden p-1"
                  >
                    <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Filters</p>
                    {["All Messages", "Unread", "Ordered", "Priority", "Ad replies", "Follow up", "Done", "Spam", "Bin"].map((filter) => (
                      <button 
                        key={filter}
                        onClick={() => {
                          setActiveFilter(filter);
                          setIsManageMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeFilter === filter ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        {filter}
                        {activeFilter === filter && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Viewing: <span className="text-blue-400">{activeFilter}</span></span>
            <button className="p-1.5 bg-[#1e293b]/30 border border-slate-800/50 rounded-md text-slate-400 hover:text-white transition-all shrink-0">
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                if (chat.unread > 0) {
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                }
              }}
              className={`p-4 flex gap-4 cursor-pointer hover:bg-[#1e293b]/50 transition-all relative border-l-4 ${selectedChat === chat.id ? 'bg-[#1e293b] border-blue-500' : 'border-transparent'}`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${
                  chat.platform === 'whatsapp' ? 'bg-emerald-600' : 
                  chat.platform === 'messenger' ? 'bg-blue-600' : 
                  chat.platform === 'linkedin' ? 'bg-sky-700' : 
                  chat.platform === 'tiktok' ? 'bg-rose-600' :
                  chat.platform === 'x' ? 'bg-black' : 'bg-slate-700'
                }`}>
                  {chat.avatar}
                </div>
                {/* Platform Badge */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0f172a] flex items-center justify-center text-white ${chat.platformColor}`}>
                  {chat.platformIcon}
                </div>
                {chat.online && <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a]"></div>}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-200 truncate flex items-center gap-2">
                    {chat.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    {chat.name}
                  </h4>
                  <span className="text-[10px] text-slate-500">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-400 truncate leading-relaxed">{chat.lastMsg}</p>
                {chat.assignedTo && (
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-2.5 h-2.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400/70">{chat.assignedTo}</span>
                  </div>
                )}
              </div>
              
              {chat.unread > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      {currentChat ? (
        <>
          <main className="flex-1 flex flex-col bg-[#0f172a]">
          {/* Chat Header */}
          <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-[#1e293b]/20 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${
                currentChat.platform === 'whatsapp' ? 'bg-emerald-600' : 
                currentChat.platform === 'messenger' ? 'bg-blue-600' : 
                currentChat.platform === 'linkedin' ? 'bg-sky-700' : 
                currentChat.platform === 'tiktok' ? 'bg-rose-600' :
                currentChat.platform === 'x' ? 'bg-black' : 'bg-slate-700'
              }`}>
                {currentChat.avatar}
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  {currentChat.name}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${currentChat.platformColor} text-white`}>
                    {currentChat.platform}
                  </span>
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${currentChat.online ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {currentChat.online ? 'Online' : 'Offline'}
                  </span>
                  <div className="flex items-center gap-1 ml-2 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    <Database className="w-2 h-2 text-blue-400" />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">History Secured</span>
                  </div>

                  {/* Assign Section */}
                  <div className="relative ml-2">
                    <button 
                      onClick={() => setIsAssignMenuOpen(!isAssignMenuOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${currentChat.assignedTo ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                    >
                      <UserPlus className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {currentChat.assignedTo ? `Assigned: ${currentChat.assignedTo}` : 'Assign Agent'}
                      </span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isAssignMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isAssignMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{ left: 0 }}
                          className="absolute left-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-[70] overflow-hidden p-1"
                        >
                          <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">Select Agent</p>
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(currentChat.id, null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-between"
                            >
                              Unassigned
                              {!currentChat.assignedTo && <Check className="w-3 h-3 text-emerald-500" />}
                            </button>
                            {employees.map((emp) => (
                              <button 
                                key={emp.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssign(currentChat.id, emp.name);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${currentChat.assignedTo === emp.name ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                              >
                                {emp.name}
                                {currentChat.assignedTo === emp.name && <Check className="w-3 h-3 text-white" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2 bg-slate-800/40 p-1.5 rounded-xl border border-slate-700/50">
                <button 
                  onClick={() => currentChat && toggleDone(currentChat.id)}
                  className={`p-2 border rounded-lg transition-all ${currentChat?.isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 hover:bg-emerald-600/20 hover:text-emerald-500'}`}
                  title={currentChat?.isDone ? "Restore from Done" : "Move to Done"}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => currentChat && toggleStar(currentChat.id)}
                  className={`p-2 border rounded-lg transition-all ${currentChat?.isStarred ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'border-slate-700 hover:bg-slate-700 hover:text-white'}`}
                  title={currentChat?.isStarred ? "Unstar Conversation" : "Star/Priority"}
                >
                  <Star className={`w-4 h-4 ${currentChat?.isStarred ? 'fill-yellow-500' : ''}`} />
                </button>
                <button 
                  onClick={() => currentChat && toggleReadStatus(currentChat.id)}
                  className={`p-2 border rounded-lg transition-all ${currentChat?.unread === 0 ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-blue-600 border-blue-500 text-white'}`}
                  title={currentChat?.unread === 0 ? "Mark as Unread" : "Mark as Read"}
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOrderModalOpen(true)}
                  className="p-2 border border-slate-700 rounded-lg hover:bg-emerald-600/20 hover:text-emerald-500 transition-all"
                  title="Create Order"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsMigrationModalOpen(true)}
                  title="Migrate Identity"
                  className="p-2 border border-slate-700 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 transition-all"
                >
                  <History className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => currentChat && toggleSpam(currentChat.id)}
                  className={`p-2 border rounded-lg transition-all ${currentChat?.isSpam ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'border-slate-700 hover:bg-slate-700 hover:text-white'}`}
                  title={currentChat?.isSpam ? "Not Spam" : "Mark as Spam"}
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => currentChat && toggleBin(currentChat.id)}
                  className={`p-2 border rounded-lg transition-all ${currentChat?.isBin ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-700 hover:bg-rose-600/20 hover:text-rose-500'}`}
                  title={currentChat?.isBin ? "Restore Conversation" : "Move to Bin"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all" title="More Options"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Messages Scroll Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative"
          >
            {currentChat.isDone && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Archive className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-500">This conversation is marked as Done</p>
                    <p className="text-[10px] text-slate-500 tracking-tight">The task for this customer has been completed.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleDone(currentChat.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restore to Inbox
                </button>
              </div>
            )}
            {currentChat.isBin && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-500">This conversation is in the Bin</p>
                    <p className="text-[10px] text-slate-500 tracking-tight">You can restore it to the main inbox or it will be auto-deleted later.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleBin(currentChat.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restore
                </button>
              </div>
            )}
            {currentChat.isSpam && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-500">This conversation is marked as Spam</p>
                    <p className="text-[10px] text-slate-500 tracking-tight">Messages from this user are hidden from your main inbox.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSpam(currentChat.id)}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg active:scale-95"
                >
                  Not Spam
                </button>
              </div>
            )}
            {currentChat.messages.map((msg: any, i) => (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] space-y-1 group relative`}>
                  <div className={`px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-slate-800'
                  }`}>
                    {msg.type === 'image' && msg.mediaUrl ? (
                      <div className="space-y-2">
                        <img src={msg.mediaUrl} alt="Captured" className="rounded-xl max-w-full h-auto cursor-pointer" referrerPolicy="no-referrer" onClick={() => window.open(msg.mediaUrl)} />
                        {msg.text && <p>{msg.text}</p>}
                      </div>
                    ) : (
                      <>
                        <p>{msg.text}</p>
                        {msg.translatedText && (
                          <div className="mt-2 pt-2 border-t border-white/10 italic text-[13px] opacity-90 transition-all">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Translated</span>
                            {msg.translatedText}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-[10px] text-slate-500">
                      {msg.time}
                    </p>
                    {msg.sender === 'them' && !msg.translatedText && (
                      <button 
                        onClick={() => handleTranslateMessage(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-amber-400 text-slate-600"
                        title="Translate this message"
                      >
                        {translatingId === msg.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Languages className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Camera Overlay */}
            <AnimatePresence>
              {isCameraOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8"
                >
                  <button onClick={stopCamera} className="absolute top-8 right-8 p-3 bg-slate-800 text-white rounded-full hover:bg-slate-700">
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="relative w-full max-w-2xl bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-full h-auto" referrerPolicy="no-referrer" />
                    ) : (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-auto scale-x-[-1]" />
                    )}
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
                      {capturedImage ? (
                        <>
                          <button 
                            onClick={() => setCapturedImage(null)}
                            className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
                          >
                            Retake
                          </button>
                          <button 
                            onClick={() => handleSendMedia('image', capturedImage)}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40"
                          >
                            Send Photo
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={takePhoto}
                          className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
                        >
                          <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-900"></div>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 mt-6 font-medium animate-pulse">Smile for the camera!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Migration Modal */}
            <AnimatePresence>
              {isMigrationModalOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                  onClick={() => setIsMigrationModalOpen(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-[#1e293b] border border-slate-700 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="p-8 space-y-6 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                          <History className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Identity Migration</h3>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Permanent Conversation Archive</p>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-bold text-blue-300">OmniInbox Archive System</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          "History stays forever. If your page or number is blocked, you can link this conversation to a new connection instantly."
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">New Channel / Number</label>
                          <div className="flex gap-2">
                            <select 
                              value={newIdentity.platform}
                              onChange={(e) => setNewIdentity(prev => ({ ...prev, platform: e.target.value }))}
                              className="bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none w-1/3"
                            >
                              <option value="whatsapp">WhatsApp</option>
                              <option value="messenger">Facebook</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="New ID / Phone"
                              value={newIdentity.number}
                              onChange={(e) => setNewIdentity(prev => ({ ...prev, number: e.target.value }))}
                              className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => setIsMigrationModalOpen(false)}
                          className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleMigrateHistory}
                          className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Migrate Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved Replies Modal */}
            <AnimatePresence>
              {isOrderModalOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-[60] flex items-center justify-center p-8 bg-[#0f172a]/80 backdrop-blur-md"
                >
                  <div className="bg-[#1e293b] border border-slate-700 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="flex items-center justify-between relative">
                      <h5 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-emerald-400" />
                        Create Order
                      </h5>
                      <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-500 hover:text-white">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6 relative">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Customer Name</label>
                          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-300 font-bold text-sm">
                            {currentChat.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Employee / Channel</label>
                          <select 
                            value={orderAgent}
                            onChange={(e) => setOrderAgent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select Employee</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="tel" 
                            placeholder="01XXXXXXXXX"
                            value={orderPhone}
                            onChange={(e) => setOrderPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Rate (BDT)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={orderRate}
                              onChange={(e) => setOrderRate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-10 pr-6 text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Quantity</label>
                          <input 
                            type="number" 
                            placeholder="1"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Paid Amount (BDT)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">৳</span>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={orderPaidAmount}
                            onChange={(e) => setOrderPaidAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-10 pr-6 text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center text-slate-500">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total</span>
                          <span className="font-mono text-sm">৳{(parseFloat(orderRate || '0') * parseFloat(orderAmount || '0')).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-500">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Due</span>
                          <span className="font-mono text-sm font-bold">
                            ৳{Math.max(0, (parseFloat(orderRate || '0') * parseFloat(orderAmount || '0')) - parseFloat(orderPaidAmount || '0')).toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary</span>
                          <span className="text-2xl font-black text-white">
                            ৳{(parseFloat(orderRate || '0') * parseFloat(orderAmount || '0')).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={handleCreateOrder}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-[0.2em] text-[11px]"
                      >
                        Confirm & Add Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {isRepliesOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-24 left-8 right-8 bg-[#1e293b] border border-slate-700 rounded-3xl shadow-2xl z-40 p-6 max-h-[60%] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="font-bold text-white flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-blue-400" />
                      Saved Replies
                    </h5>
                    <button onClick={() => setIsRepliesOpen(false)} className="text-slate-500 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {savedReplies.map((reply) => (
                      <div key={reply.id} className="group flex items-center gap-3">
                        <button 
                          onClick={() => {
                            handleSendMessage(reply.content, reply.imageUrl || undefined);
                          }}
                          className="flex-1 text-left p-4 rounded-2xl bg-slate-900/50 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/50 transition-all flex items-start gap-4"
                        >
                          {reply.imageUrl && (
                            <img src={reply.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-800" referrerPolicy="no-referrer" />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">{reply.title}</span>
                            </div>
                            <p className="text-sm text-slate-300 group-hover:text-white line-clamp-2">{reply.content}</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setSavedReplies(prev => prev.filter(r => r.id !== reply.id))}
                          className="p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <h6 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Create New Template with Image</h6>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <button 
                            onClick={() => document.getElementById('reply-image-upload')?.click()}
                            className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 transition-all overflow-hidden shrink-0"
                          >
                            {newReplyImage ? (
                              <img src={newReplyImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[9px] font-bold">ADD PIC</span>
                              </>
                            )}
                          </button>
                          <input 
                            type="file" 
                            id="reply-image-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setNewReplyImage(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <input 
                            id="new-reply-title"
                            type="text" 
                            placeholder="Template Title (e.g. Discount Offer)"
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none h-[52px]"
                          />
                        </div>
                        <textarea 
                          id="new-reply-content"
                          placeholder="Your message content..."
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none resize-none"
                        ></textarea>
                        <button 
                          onClick={() => {
                            const t = document.getElementById('new-reply-title') as HTMLInputElement;
                            const c = document.getElementById('new-reply-content') as HTMLTextAreaElement;
                            if (t.value && (c.value || newReplyImage)) {
                              setSavedReplies(prev => [...prev, { 
                                id: Date.now(), 
                                title: t.value, 
                                content: c.value, 
                                imageUrl: newReplyImage 
                              }]);
                              t.value = "";
                              c.value = "";
                              setNewReplyImage(null);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
                        >
                          Save Template
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <footer className="p-4 border-t border-slate-800 bg-[#1e293b]/10 backdrop-blur-md shrink-0">
            <div className="max-w-4xl mx-auto">
              {isRecording ? (
                <div className="bg-rose-600/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4 text-rose-500">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                    <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                    <p className="text-sm font-medium">Recording Voice Message...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsRecording(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={stopRecording}
                      className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40"
                    >
                      <StopCircle className="w-4 h-4" />
                      Stop & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-2 shadow-xl flex items-end gap-2 focus-within:border-blue-500 transition-all">
                  <div className="flex items-center pb-1">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Emoji"><Smile className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Attach"><Paperclip className="w-5 h-5" /></button>
                    <button onClick={startCamera} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors" title="Camera"><Camera className="w-5 h-5" /></button>
                    <button onClick={startRecording} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Voice"><Mic className="w-5 h-5" /></button>
                    <button onClick={() => setIsRepliesOpen(!isRepliesOpen)} className={`p-2 transition-colors ${isRepliesOpen ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`} title="Saved Replies"><Bookmark className="w-5 h-5" /></button>
                    <button 
                      onClick={handleAISmartReply} 
                      disabled={isAIGenerating}
                      className={`p-2 transition-all ${isAIGenerating ? 'text-amber-500 animate-pulse' : 'text-slate-400 hover:text-amber-400'}`} 
                      title="AI Smart Reply"
                    >
                      <Sparkles className={`w-5 h-5 ${isAIGenerating ? 'animate-spin-slow' : ''}`} />
                    </button>
                    
                    <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

                    <div className="flex items-center gap-2 px-2">
                      <select 
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:text-blue-400 outline-none cursor-pointer"
                      >
                        <option value="English">EN</option>
                        <option value="Bengali">BN</option>
                        <option value="Arabic">AR</option>
                        <option value="Hindi">HI</option>
                        <option value="Spanish">ES</option>
                      </select>
                      <button 
                        onClick={handleBengaliToEnglishInput}
                        disabled={isAIGenerating || !messageText.trim()}
                        className="p-2 text-slate-400 hover:text-emerald-400 transition-all disabled:opacity-30"
                        title="Translate Current Input [Bengali to English]"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    {messageText.trim() && (
                      <button 
                        onClick={() => {
                          const title = prompt("Enter a title for this saved reply:", "Quick Reply");
                          if (title) {
                            setSavedReplies(prev => [...prev, { id: Date.now(), title, content: messageText }]);
                            alert("Message saved to templates!");
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-yellow-400 transition-colors" 
                        title="Save current text as reply"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Type a message via ${currentChat.platform.toUpperCase()}...`}
                    className="flex-1 bg-transparent border-none text-white text-sm outline-none py-3 px-2 resize-none max-h-32 min-h-[40px] leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all group active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
              <p className="text-center text-[9px] text-slate-500 mt-2 uppercase tracking-widest font-medium opacity-50">
                Messages are synced across all your connected devices
              </p>
            </div>
          </footer>
        </main>

        {/* Customer Profile Sidebar */}
        <aside className="w-[340px] bg-[#0f172a] border-l border-slate-800 flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Cover Photo */}
            <div className="relative h-32 bg-slate-800">
              <img 
                src={currentChat.profile?.coverImage || "https://picsum.photos/seed/fb_cover/800/300"} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
              
              {/* Profile Picture (Centered Overlap) */}
              <div className="absolute -bottom-10 left-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-[#0f172a] overflow-hidden bg-slate-700 shadow-2xl">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentChat.name}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {currentChat.online && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-[#0f172a] rounded-full shadow-emerald-500/20"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 px-6 pb-12 space-y-8">
              {/* Header Info */}
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  {currentChat.name}
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" title="Verified Account" />
                </h3>
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-0.5">
                  Synced via {currentChat.platform}
                </p>
                {currentChat.assignedTo && (
                  <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <User className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-400">Assigned: {currentChat.assignedTo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-lg active:scale-95">
                    View Profile
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Info className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Introduction</p>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "{currentChat.profile?.bio || 'No bio provided.'}"
                </p>
              </div>

              <div className="h-[1px] bg-slate-800/50"></div>

              {/* About Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Information</p>
                  <button className="text-[10px] font-bold text-blue-400 hover:underline">Edit Details</button>
                </div>
                
                <div className="space-y-4">
                  <ProfileInfoRow 
                    icon={Briefcase} 
                    label="Current Work" 
                    value={currentChat.profile?.work} 
                  />
                  <ProfileInfoRow 
                    icon={GraduationCap} 
                    label="Education" 
                    value={currentChat.profile?.education} 
                  />
                  <ProfileInfoRow 
                    icon={MapPin} 
                    label="Lives in" 
                    value={currentChat.profile?.location} 
                  />
                  <ProfileInfoRow 
                    icon={Globe} 
                    label="From" 
                    value={currentChat.profile?.hometown} 
                  />
                  <ProfileInfoRow 
                    icon={Heart} 
                    label="Relationship" 
                    value={currentChat.profile?.relationship} 
                  />
                  <ProfileInfoRow 
                    icon={Cake} 
                    label="Birthday" 
                    value={currentChat.profile?.birthday} 
                  />
                  <ProfileInfoRow 
                    icon={Mail} 
                    label="Email Address" 
                    value={currentChat.profile?.email} 
                  />
                  <ProfileInfoRow 
                    icon={Phone} 
                    label="Phone Number" 
                    value={currentChat.profile?.phone} 
                  />
                  <ProfileInfoRow 
                    icon={Calendar} 
                    label="Joined Facebook" 
                    value={currentChat.profile?.joinedDate} 
                  />
                </div>
              </div>

              {/* CRM Features (Unique to OmniInbox) */}
              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6 space-y-4">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">CRM Insight</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Orders</span>
                    <span className="text-white font-bold">12 Orders</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Customer LTV</span>
                    <span className="text-emerald-500 font-bold">৳ 24,500</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Lead Score</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= 4 ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} />)}
                    </div>
                  </div>
                </div>
                <button className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                  <ExternalLink className="w-3 h-3" />
                  Open in CRM
                </button>
              </div>
            </div>
          </div>
        </aside>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <MessageSquare className="w-16 h-16 opacity-10 mb-6" />
          <h3 className="text-xl font-bold opacity-30">Select a conversation to start chatting</h3>
        </div>
      )}
    </motion.div>
  );
}

function EditEmployeeView({ employee, onSave, onCancel, onDelete }: any) {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [roles, setRoles] = useState(employee.roles);
  const [status, setStatus] = useState(employee.status);

  const toggleRole = (role: string) => {
    setRoles((prev: string[]) => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit employee</h2>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back to employees
      </button>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-rose-700 rounded-3xl flex items-center justify-center text-3xl text-white font-black shadow-2xl">
              {employee.avatar}
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">{name}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID {employee.id} • Member since {employee.joinedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800/50">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Status</label>
                <div className="flex gap-4">
                  {['Active', 'Inactive'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s.toLowerCase())}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${status === s.toLowerCase() ? 'bg-rose-600/10 border-rose-600 text-rose-500 shadow-lg shadow-rose-900/20' : 'bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Roles & Permissions</label>
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                {["Administrator", "Agent", "Manager"].map((role) => (
                  <div 
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${roles.includes(role) ? 'bg-rose-600/5 border-rose-500/30' : 'bg-transparent border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${roles.includes(role) ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-900/40' : 'border-slate-700'}`}>
                        {roles.includes(role) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm font-bold ${roles.includes(role) ? 'text-white' : 'text-slate-500'}`}>{role}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed px-4 italic">
                Roles define granular access to inbox, connections and settings pages. Admin role includes full access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-slate-800/50">
            <button 
              onClick={() => onSave({ ...employee, name, email, roles, status })}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <Check className="w-4 h-4" /> Save changes
            </button>
            <button 
              onClick={onCancel}
              className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-10 space-y-8">
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white">Remove employee</h4>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">This will permanently delete the employee account and revoke all access.</p>
        </div>
        <button 
          onClick={onDelete}
          className="border-2 border-rose-500/30 hover:bg-rose-600 hover:border-rose-600 text-rose-500 hover:text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
        >
          <Trash2 className="w-4 h-4" /> Delete employee
        </button>
      </div>
    </motion.div>
  );
}

function EmployeesView({ employees, setEmployees }: { employees: Employee[], setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdate = (updatedEmp: any) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    setEditingEmployee(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      setEditingEmployee(null);
    }
  };

  if (editingEmployee) {
    return (
      <EditEmployeeView 
        employee={editingEmployee}
        onSave={handleUpdate}
        onCancel={() => setEditingEmployee(null)}
        onDelete={() => handleDelete(editingEmployee.id)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Employees</h3>
        </div>
        <div className="flex gap-4">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95">
            <X className="w-4 h-4 rotate-45" /> New employee
          </button>
          <button className="bg-white hover:bg-slate-100 text-black px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-slate-200 transition-all active:scale-95">
            Manage roles <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-[#1e293b] border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
          <span className="text-sm font-black text-white">{employees.length}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active</span>
          <span className="text-sm font-black text-emerald-500">2</span>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inactive</span>
          <span className="text-sm font-black text-white">0</span>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Verified email</span>
          <span className="text-sm font-black text-sky-500">2</span>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
          Assign roles to each team member. Access comes from each role's permissions (or from full admin panel access on a role). At least one user must keep a role with admin panel access.
        </p>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
          This workspace has 2 defined roles. Edit role permissions under Manage roles. Use Edit for account details, contact info, and notes.
        </p>

        {/* Quick Reference */}
        <div className="bg-[#1e293b]/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 shadow-xl">
          <h5 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Quick reference</h5>
          <ul className="space-y-4">
            {[
              "Save on each row updates roles only (not for your own row if you have admin panel access—your roles are locked). Use Edit for profile and account details.",
              "Inactive accounts cannot sign in. You cannot deactivate your own account from Edit.",
              "Deleting an employee removes their account; you cannot delete yourself or the last administrator.",
              "\"Panel\" means the role grants full admin panel access (all areas unless you use granular permissions on other roles).",
              "New accounts you add from \"New employee\" receive a verification email and can sign in after confirming it."
            ].map((text, i) => (
              <li key={i} className="flex gap-4 items-start text-xs text-slate-400 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 shrink-0"></span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Search Employees */}
        <div className="bg-[#1e293b]/30 p-8 rounded-[2rem] border border-slate-800/50 space-y-4">
          <h5 className="font-bold text-xs text-slate-500 uppercase tracking-[0.2em]">Search Employees</h5>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Name, email, phone, job title, department"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-[#1e293b]/30 rounded-[2rem] border border-slate-800/50 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f172a]/50 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-8 py-6">Name</th>
                <th className="px-8 py-6">Email & Verification</th>
                <th className="px-8 py-6">Roles</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {emp.avatar}
                      </div>
                      <div>
                        <h6 className="font-bold text-slate-100">{emp.name}</h6>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">ID {emp.id} <span className="mx-1 opacity-50">•</span> Member since {emp.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <h6 className="text-sm font-bold text-slate-200">{emp.email}</h6>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      {emp.verified && <CheckCircle2 className="w-3 h-3" />}
                      Email verified
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      {["Administrator", "Agent"].map((role) => (
                        <label key={role} className="flex items-center gap-3 cursor-pointer group/item">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${emp.roles.includes(role) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 bg-transparent'}`}>
                            {emp.roles.includes(role) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-xs font-bold ${emp.roles.includes(role) ? 'text-slate-200' : 'text-slate-500'}`}>{role}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-emerald-400 capitalize">{emp.status}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-lg transition-all border border-slate-700/50">Profile</button>
                      <button 
                        onClick={() => setEditingEmployee(emp)}
                        className="px-4 py-2 bg-white/5 hover:bg-white text-slate-300 hover:text-black font-bold text-xs rounded-lg transition-all border border-slate-700/50"
                      >
                        Edit
                      </button>
                      {emp.id === 2 && (
                        <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-lg active:scale-95">Save</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function EditOrderView({ order, onSave, onCancel }: any) {
  const [status, setStatus] = useState(order.status);
  const [paid, setPaid] = useState(order.paid);
  const [due, setDue] = useState(order.due);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit Order #{order.id}</h2>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back to orders
      </button>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
              <ShoppingCart className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">{order.customer}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{order.channel} • {order.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800/50">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Paid Amount</label>
                <input 
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Due Amount</label>
                <input 
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Order Status</label>
              <div className="grid grid-cols-2 gap-4">
                {['Paid', 'Partial', 'Unpaid', 'Cancelled'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${status === s ? 'bg-rose-600/10 border-rose-600 text-white' : 'bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-slate-800/50">
            <button 
              onClick={() => onSave({ ...order, status, paid, due })}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <Check className="w-4 h-4" /> Update order
            </button>
            <button 
              onClick={onCancel}
              className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EditLeadView({ lead, onSave, onCancel }: any) {
  const [status, setStatus] = useState(lead.status);
  const [score, setScore] = useState(lead.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit Lead Info</h2>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back to leads
      </button>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
              <Target className="w-8 h-8 text-sky-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">{lead.name}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{lead.email} • {lead.source}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800/50">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Lead Score ({score}%)</label>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                />
                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Cold</span>
                  <span>Warm</span>
                  <span>Hot</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Lead Status</label>
              <div className="grid grid-cols-2 gap-4">
                {['Hot', 'Warm', 'Cold', 'Closed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${status === s ? 'bg-rose-600/10 border-rose-600 text-white' : 'bg-[#0f172a] border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-slate-800/50">
            <button 
              onClick={() => onSave({ ...lead, status, score })}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <Check className="w-4 h-4" /> Save changes
            </button>
            <button 
              onClick={onCancel}
              className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OrdersLeadsView({ orders: initialOrders, leads: initialLeads }: { orders: Order[], leads: Lead[] }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'leads'>('orders');
  const [orders, setOrders] = useState(initialOrders);
  const [leads, setLeads] = useState(initialLeads);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const totalRevenue = orders.reduce((sum, order) => {
    const paidString = typeof order.paid === 'string' ? order.paid : String(order.paid || "0");
    const paidValue = parseFloat(paidString.replace('$', '').replace('৳', '').replace(',', ''));
    return sum + (isNaN(paidValue) ? 0 : paidValue);
  }, 0);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditingOrder(null);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.email === updatedLead.email ? updatedLead : l));
    setEditingLead(null);
  };

  if (editingOrder) {
    return <EditOrderView order={editingOrder} onSave={handleUpdateOrder} onCancel={() => setEditingOrder(null)} />;
  }

  if (editingLead) {
    return <EditLeadView lead={editingLead} onSave={handleUpdateLead} onCancel={() => setEditingLead(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Orders & Leads</h3>
          <p className="text-slate-400 text-sm mt-1">Track conversions and potential clients from your chat channels.</p>
        </div>
        <div className="flex bg-[#1e293b]/50 p-1 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Leads
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b]/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Revenue (BDT)</p>
          <p className="text-3xl font-black text-white">৳{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">+12% vs last month</p>
        </div>
        <div className="bg-[#1e293b]/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Conversion Rate</p>
          <p className="text-3xl font-black text-white">4.8%</p>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">+0.5% vs last week</p>
        </div>
        <div className="bg-[#1e293b]/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Active Leads</p>
          <p className="text-3xl font-black text-white">{leads.length}</p>
          <p className="text-[10px] text-rose-400 font-bold mt-2">{leads.filter(l => l.status === 'Hot').length} leads need attention</p>
        </div>
      </div>

      <div className="bg-[#1e293b]/30 rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#0f172a]/70 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/80">
              {activeTab === 'orders' ? (
                <>
                  <th className="px-10 py-6">Order ID</th>
                  <th className="px-10 py-6">Customer</th>
                  <th className="px-10 py-6">Phone</th>
                  <th className="px-10 py-6">Total</th>
                  <th className="px-10 py-6 text-emerald-500">Paid</th>
                  <th className="px-10 py-6 text-rose-500">Due</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-10 py-6">Lead Name</th>
                  <th className="px-10 py-6">Contact info</th>
                  <th className="px-10 py-6">Source</th>
                  <th className="px-10 py-6">Score</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {activeTab === 'orders' ? (
              orders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-10 py-6 font-mono font-bold text-slate-400">{order.id}</td>
                  <td className="px-10 py-6">
                    <div>
                      <p className="font-bold text-white">{order.customer}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{order.channel} • {order.date}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-slate-400 font-mono text-xs">{order.phone || 'N/A'}</td>
                  <td className="px-10 py-6 font-bold text-slate-300">{order.amount}</td>
                  <td className="px-10 py-6 font-black text-emerald-400">{order.paid}</td>
                  <td className="px-10 py-6 font-black text-rose-500">{order.due}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 
                      order.status === 'Partial' ? 'bg-amber-500/10 text-amber-400' : 
                      order.status === 'Unpaid' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setEditingOrder(order)}
                      className="px-4 py-2 bg-slate-800/50 hover:bg-white text-slate-400 hover:text-black font-black text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-800 hover:border-white active:scale-95"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              leads.map((lead) => (
                <tr key={lead.email} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-10 py-6 font-bold text-white">{lead.name}</td>
                  <td className="px-10 py-6 text-slate-400">{lead.email}</td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-slate-800/50 rounded-full text-[10px] font-black uppercase text-slate-400 border border-slate-700/50">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden w-24">
                      <div className="bg-rose-500 h-full" style={{ width: `${lead.score}%` }}></div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      lead.status === 'Hot' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 
                      lead.status === 'Warm' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-slate-500 font-medium">{lead.date}</td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setEditingLead(lead)}
                      className="px-4 py-2 bg-slate-800/50 hover:bg-white text-slate-400 hover:text-black font-black text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-800 hover:border-white active:scale-95"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ManualMigrationView() {
  const [targetId, setTargetId] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("whatsapp");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Manual History Migration</h3>
          <p className="text-slate-400 text-sm mt-1">Directly control and link archived conversations to new IDs or channels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1e293b]/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-tight">Manual Linking</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Admin Override Tool</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Use this tool when you need to manually force a conversation history onto a new platform identity. This bypasses the standard automated migration and allows for precision linking.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination Channel</label>
              <select 
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              >
                <option value="whatsapp">WhatsApp Business API</option>
                <option value="messenger">Facebook Messenger Page</option>
                <option value="tiktok">TikTok Business</option>
                <option value="linkedin">LinkedIn Professional</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Identity (Phone/ID)</label>
              <input 
                type="text" 
                placeholder="e.g. +8801XXXXXXXXX"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none placeholder:text-slate-700"
              />
            </div>
          </div>

          <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-3">
            <RefreshCw className="w-4 h-4" />
            Force Migration & Link
          </button>
        </div>

        <div className="bg-[#1e293b]/30 border border-slate-800/50 p-8 rounded-[2.5rem] space-y-6">
          <h5 className="font-bold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Administrative Actions
          </h5>
          
          <div className="space-y-4">
            {[
              { action: "Link Change", from: "WA:88017...", to: "WA:88019...", date: "Just now", status: "Success" },
              { action: "Manual Archive", from: "FB:Page_92", to: "Archive_DB", date: "2 hours ago", status: "Success" },
              { action: "History Sync", from: "Omni_DB", to: "Messenger", date: "Yesterday", status: "Verified" }
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0f172a]/50 rounded-2xl border border-slate-800/50">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">{log.from} ➔ {log.to}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest">{log.status}</span>
                  <span className="text-[10px] text-slate-600">{log.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] text-blue-400 leading-relaxed italic">
              "Administrative actions are logged and permanent. Use manual migration only when automated identity matching fails."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PackagesView() {
  const packages = [
    {
      name: "Lite",
      price: "$19",
      period: "/month",
      description: "Perfect for startups and small teams beginning their multi-channel journey.",
      features: ["2 Team Members", "WhatsApp API Access", "1,000 Messages/month", "Standard Support", "Basic Analytics"],
      buttonColor: "bg-slate-700 hover:bg-slate-600",
      icon: <Zap className="w-6 h-6 text-slate-400" />
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Our most popular choice for growing businesses needing scale.",
      features: ["5 Team Members", "Full Omni-Channel Inbox", "5,000 Messages/month", "Priority Support", "Advanced Analytics", "Custom Permissions"],
      buttonColor: "bg-rose-600 hover:bg-rose-700",
      featured: true,
      icon: <Zap className="w-6 h-6 text-rose-400" />
    },
    {
      name: "Growth",
      price: "$99",
      period: "/month",
      description: "Advanced tools and security for high-volume sales and support teams.",
      features: ["15 Team Members", "Advanced Automatons", "Unlimited History", "24/7 Priority Support", "Dedicated Account Manager", "White-label Options"],
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Enterprise-grade control and compliance for large organizations.",
      features: ["Unlimited Teams", "Custom API Integrations", "SLA Guarantee", "On-premise Options", "SSO & Advanced Security", "Custom Training"],
      buttonColor: "bg-sky-600 hover:bg-sky-700",
      icon: <Zap className="w-6 h-6 text-sky-400" />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-4 max-w-2xl">
        <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-rose-500" /> Subscription Packages
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          Choose the right plan for your business. Whether you're just starting or scaling globally, OmniInbox has a package that fits your needs. 
          <br />
          All plans include 14-day free trial on core features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-[#1e293b]/40 border ${pkg.featured ? 'border-rose-500/50 shadow-[0_0_40px_rgba(240,83,64,0.1)]' : 'border-slate-800/80'} rounded-[2.5rem] p-8 flex flex-col space-y-8 backdrop-blur-md group transition-all hover:translate-y-[-8px] hover:border-slate-700`}
          >
            {pkg.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-inner`}>
                {pkg.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{pkg.name}</h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plan</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tighter">{pkg.price}</span>
              <span className="text-xs text-slate-500 font-bold">{pkg.period}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium pb-4 border-b border-slate-800/50">
              {pkg.description}
            </p>

            <ul className="flex-1 space-y-4">
              {pkg.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full ${pkg.buttonColor} text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl`}>
              Purchase {pkg.name}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Badge / Footer */}
      <div className="bg-[#1e293b]/30 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-slate-800">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h6 className="font-bold text-white">Secure Payments & Data Safety</h6>
            <p className="text-xs text-slate-500 font-medium">All transition processed via AES-256 encryption. We never store credit card details.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Ready</div>
          <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Guaranteed</div>
        </div>
      </div>
    </motion.div>
  );
}

function EditPermissionView({ permission, onSave, onCancel, onDelete }: any) {
  const [name, setName] = useState(permission.name);
  const [description, setDescription] = useState(permission.description);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit permission</h2>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back to permissions
      </button>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
            Update permission details used by your role matrix. Changes apply wherever this permission is granted through roles.
          </p>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold placeholder:text-slate-700" 
              />
            </div>

            {permission.isSystem && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl space-y-2">
                <p className="text-sm font-black text-amber-500 uppercase tracking-widest">System permission</p>
                <p className="text-xs text-amber-500/60 font-bold leading-relaxed">
                  The slug is fixed so routes and policies stay stable. You can change the display name and description.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Slug</label>
              <div className="bg-[#0f172a]/50 border border-slate-800/50 rounded-2xl px-6 py-4">
                <code className="text-sm font-mono text-slate-500 font-bold">{permission.slug}</code>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold resize-none leading-relaxed"
                placeholder="Describe what this permission allows..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-slate-800/50">
            <button 
              onClick={() => onSave({ ...permission, name, description })}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <Check className="w-4 h-4" /> Save changes
            </button>
            <button 
              onClick={onCancel}
              className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-10 space-y-8">
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white">Remove permission</h4>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">Permanently remove this permission definition. This cannot be undone.</p>
        </div>
        <button 
          onClick={onDelete}
          className="border-2 border-rose-500/30 hover:bg-rose-600 hover:border-rose-600 text-rose-500 hover:text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
        >
          <Trash2 className="w-4 h-4" /> Delete permission
        </button>
      </div>
    </motion.div>
  );
}

function PermissionsView() {
  const [permissions, setPermissions] = useState([
    { name: "Connections", isSystem: true, description: "Manage WhatsApp and Messenger channel accounts (credentials, labels, active state).", slug: "connections.manage", roles: 1 },
    { name: "Employees", isSystem: true, description: "Assign roles to team members.", slug: "employees.manage", roles: 1 },
    { name: "Inbox", isSystem: true, description: "View and reply in the unified chats inbox.", slug: "inbox.access", roles: 1 },
    { name: "Integration settings", isSystem: true, description: "View webhook URLs and integration shortcuts on Settings.", slug: "settings.integrations", roles: 1 },
    { name: "LinkedIn", isSystem: true, description: "Connect and configure LinkedIn professional profiles.", slug: "linkedin.manage", roles: 1 },
    { name: "Messenger", isSystem: true, description: "Connect and configure Facebook Messenger.", slug: "messenger.manage", roles: 1 },
    { name: "Permissions", isSystem: true, description: "Create and edit permission definitions.", slug: "permissions.manage", roles: 1 },
    { name: "Roles", isSystem: true, description: "Create and edit roles and their permissions.", slug: "roles.manage", roles: 1 },
    { name: "TikTok", isSystem: true, description: "Connect and configure TikTok content accounts.", slug: "tiktok.manage", roles: 1 },
    { name: "WhatsApp", isSystem: true, description: "Connect and configure WhatsApp Cloud API.", slug: "whatsapp.manage", roles: 1 },
    { name: "X (Twitter)", isSystem: true, description: "Connect and configure X (formerly Twitter) accounts.", slug: "x.manage", roles: 1 },
  ]);

  const [editingPermission, setEditingPermission] = useState<any>(null);

  const handleUpdate = (updatedPerm: any) => {
    setPermissions(prev => prev.map(p => p.slug === updatedPerm.slug ? updatedPerm : p));
    setEditingPermission(null);
  };

  const handleDelete = (slug: string) => {
    if (window.confirm("Are you sure you want to delete this permission? This action cannot be undone.")) {
      setPermissions(prev => prev.filter(p => p.slug !== slug));
      setEditingPermission(null);
    }
  };

  if (editingPermission) {
    return (
      <EditPermissionView 
        permission={editingPermission}
        onSave={handleUpdate}
        onCancel={() => setEditingPermission(null)}
        onDelete={() => handleDelete(editingPermission.slug)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-4xl font-bold text-white tracking-tight">Permissions</h3>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Permissions are the building blocks for access. Assign them to roles, then assign roles to users on the <span className="text-rose-500 cursor-pointer hover:underline font-bold">Employees</span> page.
            <br />
            Any permission can be deleted only when it is not attached to any role.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-rose-900/20">
            <PlusCircle className="w-5 h-5" /> New permission
          </button>
        </div>
      </div>

      {/* Summary Filter Chips */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-[#1e293b] border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</span>
          <span className="text-lg font-black text-white">{permissions.length}</span>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System</span>
          <span className="text-lg font-black text-white">{permissions.filter(p => p.isSystem).length}</span>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Custom</span>
          <span className="text-lg font-black text-sky-500">{permissions.filter(p => !p.isSystem).length}</span>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-[#1e293b]/30 rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a]/70 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/80">
                <th className="px-10 py-8">Permission Details</th>
                <th className="px-10 py-8">Slug Identifier</th>
                <th className="px-10 py-8">Usage</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {permissions.map((perm) => (
                <tr key={perm.slug} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h6 className="font-black text-slate-100 text-base tracking-tight">{perm.name}</h6>
                        {perm.isSystem && (
                          <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest border border-slate-700/50">System</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-bold max-w-md leading-relaxed">{perm.description}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <code className="bg-[#0f172a] px-3 py-1.5 rounded-lg font-mono text-[11px] text-slate-400 font-bold border border-slate-800/50">
                      {perm.slug}
                    </code>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-sm font-black text-slate-300">{perm.roles} roles</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setEditingPermission(perm)}
                        className="px-6 py-2.5 bg-[#0f172a] hover:bg-white text-slate-400 hover:text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:border-white shadow-lg flex items-center gap-2 active:scale-95"
                      >
                        <Shield className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(perm.slug)}
                        className="p-2.5 bg-transparent hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function EditRoleView({ role, onSave, onCancel, onDelete }: any) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [panelAccess, setPanelAccess] = useState(role.panelAccess);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Edit role</h2>
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back to roles
      </button>

      <div className="bg-[#1e293b] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
            Update role definition and access level. Roles represent sets of permissions granted to employees.
          </p>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Role Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold placeholder:text-slate-700" 
              />
            </div>

            {role.isSystem && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl space-y-2">
                <p className="text-sm font-black text-amber-500 uppercase tracking-widest">System role</p>
                <p className="text-xs text-amber-500/60 font-bold leading-relaxed">
                  The slug is protected to ensure system stability. You can still modify the display name, description, and panel access.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Slug Identifier</label>
              <div className="bg-[#0f172a]/50 border border-slate-800/50 rounded-2xl px-6 py-4">
                <code className="text-sm font-mono text-slate-500 font-bold">{role.slug}</code>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Panel Access</label>
              <div className="flex gap-4">
                {[
                  { label: 'Full Access', val: true, desc: 'Grants full admin visibility' },
                  { label: 'Limited', val: false, desc: 'Inbox & basic tools only' }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setPanelAccess(opt.val)}
                    className={`flex-1 p-6 rounded-3xl text-left transition-all border-2 ${panelAccess === opt.val ? 'bg-rose-600/10 border-rose-600 shadow-xl shadow-rose-900/20' : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${panelAccess === opt.val ? 'border-rose-500 bg-rose-500' : 'border-slate-700'}`}>
                        {panelAccess === opt.val && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-sm font-black uppercase tracking-widest ${panelAccess === opt.val ? 'text-white' : 'text-slate-400'}`}>{opt.label}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-none">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Role Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-bold resize-none leading-relaxed"
                placeholder="Describe the responsibilities of this role..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-slate-800/50">
            <button 
              onClick={() => onSave({ ...role, name, description, panelAccess })}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <Check className="w-4 h-4" /> Save changes
            </button>
            <button 
              onClick={onCancel}
              className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {!role.isSystem && (
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-10 space-y-8">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-white">Remove role</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Permanently delete this custom role. This can only be done if no users are assigned.</p>
          </div>
          <button 
            onClick={onDelete}
            className="border-2 border-rose-500/30 hover:bg-rose-600 hover:border-rose-600 text-rose-500 hover:text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
          >
            <Trash2 className="w-4 h-4" /> Delete role
          </button>
        </div>
      )}
    </motion.div>
  );
}

function RolesView() {
  const [roles, setRoles] = useState([
    { 
      name: "Administrator", 
      isSystem: true, 
      description: "Full access to messaging tools, team settings, and role management.", 
      slug: "admin", 
      panelAccess: true, 
      users: 1 
    },
    { 
      name: "Agent", 
      isSystem: true, 
      description: "Standard team member without admin panel access.", 
      slug: "agent", 
      panelAccess: false, 
      users: 1 
    }
  ]);

  const [editingRole, setEditingRole] = useState<any>(null);

  const handleUpdate = (updatedRole: any) => {
    setRoles(prev => prev.map(r => r.slug === updatedRole.slug ? updatedRole : r));
    setEditingRole(null);
  };

  const handleDelete = (slug: string) => {
    const roleToRemove = roles.find(r => r.slug === slug);
    if (!roleToRemove) return;

    if (roleToRemove.users > 0) {
      alert("Cannot delete role because it is still assigned to users. Remove the role from employees first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      setRoles(prev => prev.filter(r => r.slug !== slug));
      setEditingRole(null);
    }
  };

  if (editingRole) {
    return (
      <EditRoleView 
        role={editingRole}
        onSave={handleUpdate}
        onCancel={() => setEditingRole(null)}
        onDelete={() => handleDelete(editingRole.slug)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-2xl font-bold text-white tracking-tight">Roles</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Define roles, optional full admin panel access, and which permissions each role grants. Assign roles to people on the <span className="text-blue-400 cursor-pointer hover:underline font-bold">Employees</span> page.
            <br />
            System roles are protected. Custom roles can be deleted only when no users are still assigned.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-900/20">
            <X className="w-5 h-5 rotate-45" /> New role
          </button>
          <button className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-slate-700/50 transition-all active:scale-95">
            Manage employees <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Summary Filter Chips */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-[#1e293b] border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md group border-b-2 border-b-slate-700">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</span>
          <span className="text-sm font-black text-white">2</span>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md group border-b-2 border-b-slate-700">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">System</span>
          <span className="text-sm font-black text-white">2</span>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md group border-b-2 border-b-sky-500/30">
          <span className="text-[11px] font-black text-sky-500 uppercase tracking-[0.2em]">Custom</span>
          <span className="text-sm font-black text-sky-500">0</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md group border-b-2 border-b-emerald-500/30">
          <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Panel access</span>
          <span className="text-sm font-black text-emerald-500">1</span>
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-[#1e293b]/40 border border-slate-800/80 p-10 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
        <h5 className="font-bold text-white text-xs uppercase tracking-[0.2em] flex items-center gap-3">
          <Activity className="w-4 h-4 text-blue-400" /> Quick reference
        </h5>
        <ul className="space-y-5">
          {[
            "\"Panel access\" means the role grants full admin panel visibility (all areas unless you rely on granular permissions on other roles).",
            "The Administrator role always carries every permission; editing it syncs permissions automatically.",
            "Delete is available only for custom roles with zero users assigned. Remove the role from employees first if needed."
          ].map((text, i) => (
            <li key={i} className="flex gap-5 items-start text-xs text-slate-400 leading-relaxed font-medium">
              <span className="w-1.5 h-1.5 bg-[#f05340] rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(240,83,64,0.4)]"></span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Roles Database Table */}
      <div className="bg-[#1e293b]/30 rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#0f172a]/70 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/80">
              <th className="px-10 py-8">Name</th>
              <th className="px-10 py-8">Slug</th>
              <th className="px-10 py-8">Panel Access</th>
              <th className="px-10 py-8">Users</th>
              <th className="px-10 py-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {roles.map((role) => (
              <tr key={role.slug} className="group hover:bg-white/[0.03] transition-all">
                <td className="px-10 py-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h6 className="font-black text-slate-100 text-sm tracking-tight">{role.name}</h6>
                      {role.isSystem && (
                        <span className="px-2.5 py-0.5 bg-slate-800 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest border border-slate-700/50">System</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold max-w-sm leading-relaxed">{role.description}</p>
                  </div>
                </td>
                <td className="px-10 py-8 font-mono text-[11px] text-slate-400 font-bold group-hover:text-blue-400 transition-colors">
                  {role.slug}
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${role.panelAccess ? 'bg-emerald-500 text-emerald-500' : 'bg-slate-700 text-slate-700'}`}></div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${role.panelAccess ? 'text-slate-200' : 'text-slate-500'}`}>
                      {role.panelAccess ? 'Yes' : 'No'}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-sm font-black text-slate-300">{role.users}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setEditingRole(role)}
                      className="flex items-center gap-3 px-6 py-2.5 bg-[#0f172a]/50 hover:bg-white text-slate-300 hover:text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:border-white shadow-xl active:scale-95 group/btn"
                    >
                      <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                      Edit
                    </button>
                    {!role.isSystem && (
                      <button 
                        onClick={() => handleDelete(role.slug)}
                        className="p-2.5 bg-transparent hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function SettingsView({ 
  logoUrl, 
  onLogoChange,
  faviconUrl,
  onFaviconChange,
  appName,
  onAppNameChange,
  appColors,
  onAppColorsChange
}: { 
  logoUrl: string | null; 
  onLogoChange: (url: string | null) => void;
  faviconUrl: string | null;
  onFaviconChange: (url: string | null) => void;
  appName: string;
  onAppNameChange: (name: string) => void;
  appColors: any;
  onAppColorsChange: (colors: any) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const faviconInputRef = React.useRef<HTMLInputElement>(null);
  const [tempLogo, setTempLogo] = React.useState<string | null>(logoUrl);
  const [tempFavicon, setTempFavicon] = React.useState<string | null>(faviconUrl);
  const [tempAppName, setTempAppName] = React.useState(appName);
  const [interfaceColors, setInterfaceColors] = React.useState(appColors);
  const [enableSound, setEnableSound] = React.useState(() => localStorage.getItem("notify_sound") !== "false");
  const [enableDesktop, setEnableDesktop] = React.useState(() => localStorage.getItem("notify_desktop") !== "false");
  const [isSaved, setIsSaved] = React.useState(false);
  const [isAppearanceSaved, setIsAppearanceSaved] = React.useState(false);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Notifications Enabled", {
        body: "You will now receive desktop alerts for new messages.",
        icon: faviconUrl || undefined
      });
      alert("Browser notifications enabled successfully!");
    } else {
      alert("Note: To enable notifications, you must grant permission in your browser settings.");
    }
  };

  const saveNotificationPrefs = () => {
    localStorage.setItem("notify_sound", String(enableSound));
    localStorage.setItem("notify_desktop", String(enableDesktop));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempFavicon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (tempLogo) {
      onLogoChange(tempLogo);
      localStorage.setItem("app_logo", tempLogo);
    }
    if (tempFavicon) {
      onFaviconChange(tempFavicon);
      localStorage.setItem("app_favicon", tempFavicon);
    }
    onAppNameChange(tempAppName);
    localStorage.setItem("app_name", tempAppName);
    onAppColorsChange(interfaceColors);
    localStorage.setItem("app_colors", JSON.stringify(interfaceColors));
    
    setIsAppearanceSaved(true);
    setTimeout(() => setIsAppearanceSaved(false), 3000);
    alert("Appearance settings saved successfully!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Settings Header */}
      <div className="bg-[#1e293b] rounded-[2.5rem] p-10 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#f05340] uppercase tracking-[0.2em]">Workspace</p>
            <h2 className="text-4xl font-bold text-white">Settings</h2>
            <p className="text-sm text-slate-400 font-medium">Manage notifications, appearance, and integrations in one place.</p>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-slate-200 font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <div className="w-8 h-8 bg-rose-600/20 rounded-lg flex items-center justify-center text-rose-500 font-bold text-xs uppercase">A</div>
            Profile & password
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <section className="bg-[#1e293b]/40 rounded-[2.5rem] p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-8 backdrop-blur-sm">
        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
          <Bell className="w-7 h-7 text-blue-400" />
        </div>
        <div className="flex-1 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
            <p className="text-sm text-slate-400 font-medium">Sounds, desktop alerts, and the header bell.</p>
          </div>
          
          <div className="space-y-5">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                className="mt-1.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 transition-all hover:border-emerald-500" 
              />
              <div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-500 transition-colors tracking-tight">Enable sound alerts</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Play a beep when new messages arrive while this page is open.</p>
              </div>
            </label>
            <label className="flex items-start gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={enableDesktop}
                onChange={(e) => setEnableDesktop(e.target.checked)}
                className="mt-1.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 transition-all hover:border-emerald-500" 
              />
              <div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-500 transition-colors tracking-tight">Enable desktop notifications</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Show system notifications when new messages arrive.</p>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/50">
            <button 
              onClick={saveNotificationPrefs}
              className={`${isSaved ? 'bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700'} text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved Successfully!
                </>
              ) : "Save notification preferences"}
            </button>
            <button 
              onClick={requestNotificationPermission}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              Enable browser notifications
            </button>
          </div>
        </div>
      </section>

      {/* Email Configuration */}
      <section className="bg-[#1e293b]/40 rounded-[2.5rem] p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-8 backdrop-blur-sm">
        <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-sky-500/20">
          <Mail className="w-7 h-7 text-sky-400" />
        </div>
        <div className="flex-1 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white">Email configuration</h3>
            <p className="text-sm text-slate-400 font-medium">Configure SMTP used for verification and password reset emails.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>SMTP host</label>
              <input defaultValue="mail.aaramaura.com" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>SMTP port</label>
              <input defaultValue="465" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>SMTP username</label>
              <input defaultValue="info@aaramaura.com" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>SMTP password</label>
              <input type="password" placeholder="Leave blank to keep existing password" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>Encryption</label>
              <select className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium cursor-pointer">
                <option>TLS</option>
                <option>SSL</option>
                <option>None</option>
              </select>
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>Mailer</label>
              <input defaultValue="smtp" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>From email</label>
              <input defaultValue="info@aaramaura.com" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>From name</label>
              <input defaultValue="Laravel" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" />
            </div>
          </div>

          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-rose-900/20 transition-all active:scale-95">
            Save email configuration
          </button>
        </div>
      </section>

      {/* Brand & Appearance */}
      <section className="bg-[#1e293b]/40 rounded-[2.5rem] p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-8 backdrop-blur-sm">
        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/20">
          <Globe className="w-7 h-7 text-rose-400" />
        </div>
        <div className="flex-1 space-y-10">
          <div>
            <h3 className="text-xl font-bold text-white">Brand & appearance</h3>
            <p className="text-sm text-slate-400 font-medium">Name, logo, favicon, and interface color values.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3 font-bold uppercase tracking-widest text-[10px] text-slate-500">
              <label>Application name</label>
              <input 
                value={tempAppName}
                onChange={(e) => setTempAppName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-rose-600 transition-all font-medium placeholder:text-slate-700" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Logo image</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
                  >
                    Choose file
                  </button>
                  <span className="text-xs text-slate-500 font-medium italic truncate max-w-[150px]">
                    {tempLogo ? "Logo selected" : "No file chosen"}
                  </span>
                  {tempLogo && (
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-700/50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      <img src={tempLogo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Favicon</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref={faviconInputRef}
                    onChange={handleFaviconUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => faviconInputRef.current?.click()}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
                  >
                    Choose file
                  </button>
                  <span className="text-xs text-slate-500 font-medium italic truncate max-w-[150px]">
                    {tempFavicon ? "Favicon selected" : "No file chosen"}
                  </span>
                  {tempFavicon && (
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-slate-700/50">
                      <img src={tempFavicon} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interface Colors */}
            <div className="bg-[#0f172a]/50 rounded-3xl p-8 border border-slate-800/50 space-y-8">
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-200 tracking-tight">Interface colors</h5>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">Set color values using hex or valid CSS color syntax. Preview updates live.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[
                  { label: "Sidebar gradient (top)", key: "sidebarTop" },
                  { label: "Sidebar gradient (middle)", key: "sidebarMiddle" },
                  { label: "Sidebar gradient (bottom)", key: "sidebarBottom" },
                  { label: "Primary accent color", key: "primaryAccent" },
                  { label: "Page background", key: "pageBg" },
                  { label: "Card / Panel background", key: "cardBg" }
                ].map((colorObj, i) => {
                  const val = (interfaceColors as any)[colorObj.key];
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{colorObj.label}</label>
                      <div className="flex bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-inner group">
                        <div className="w-12 h-12 shrink-0 border-r border-slate-800 group-hover:scale-110 transition-transform" style={{ backgroundColor: val }}></div>
                        <input 
                          value={val} 
                          onChange={(e) => setInterfaceColors((prev: any) => ({ ...prev, [colorObj.key]: e.target.value }))}
                          className="flex-1 px-4 text-xs font-mono font-bold text-slate-400 outline-none bg-transparent focus:text-rose-400 transition-colors" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <button 
              onClick={handleSave}
              className={`w-full ${isAppearanceSaved ? 'bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700'} text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2`}
            >
              {isAppearanceSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : "Save appearance"}
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
