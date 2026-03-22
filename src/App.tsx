import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  BarChart2, 
  MessageSquare, 
  Database, 
  User, 
  Bell, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Clock, 
  Plus, 
  TrendingUp, 
  Award, 
  Lock, 
  ArrowLeft, 
  HelpCircle, 
  Upload, 
  Video, 
  Info, 
  Sparkles, 
  ArrowRight,
  Music,
  Target,
  Waves,
  Smile,
  Zap,
  Share2,
  Mic,
  Send,
  MoreVertical,
  BadgeCheck,
  Video as VideoIcon,
  Settings,
  MessageCircle,
  X,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';
import type { Session } from '@supabase/supabase-js';

// --- Types ---
type Tab = 'practice' | 'analysis' | 'coach' | 'data' | 'profile';

// --- Mock Data ---
const ACTIVITY_DATA = [
  { name: '10月1日', value: 30 },
  { name: '10月5日', value: 45 },
  { name: '10月10日', value: 35 },
  { name: '10月15日', value: 60 },
  { name: '10月20日', value: 40 },
  { name: '10月25日', value: 75 },
  { name: '今天', value: 50 },
];

// --- Components ---

const VideoUploadModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-primary">记录新练习</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-primary-fixed text-primary hover:bg-primary hover:text-white transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Camera size={32} />
                </div>
                <span className="font-bold">立即拍摄</span>
              </button>
              <button className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-secondary-container/20 text-secondary hover:bg-secondary hover:text-white transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Upload size={32} />
                </div>
                <span className="font-bold">本地上传</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-primary">提示：</span> 
                建议使用横屏拍摄，并确保全身入镜，以便 AI 能够更精准地识别你的动作骨骼。
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: 'practice', label: '练习', icon: Calendar },
    { id: 'analysis', label: '分析', icon: BarChart2 },
    { id: 'coach', label: '教练', icon: MessageSquare },
    { id: 'data', label: '数据', icon: Database },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 pb-6 pt-3 z-50 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(107,56,212,0.08)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-purple-100 text-primary scale-105' 
                  : 'text-slate-400 hover:text-primary'
              }`}
            >
              <Icon size={24} fill={isActive ? "currentColor" : "none"} />
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const Header = ({ title, showBack, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-purple-500/5 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="p-2 hover:bg-purple-50 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
        )}
        {!showBack && (
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-2 border-primary/10">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwlbAzXSkQmTncSWQJPo16Tpk58IxfRqpnG-BAv18WtFcuB_IhuG5y-KJt7cYn_yPOMlBkzOSNDvXNe1B3VXykhpVH0d-W4GeA5LiGSq6hUEd-YBcpD6CLM_ghnO5s0KhGK3ZhHAv2NkCowQhYos2ktAqh3yXWL4f6Sj8LTQlh0hJrXcjX1NU4nExUHzHHHVLU5Jg62O79RtYWd0FEFOW-gz36SFgvuZiGkSEBqwIag9zVQmsbY65Fwrs1LHEeZWaFEHgodOjoki0" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <span className="text-xl font-black text-primary tracking-tight font-headline">{title}</span>
      </div>
      <button className="p-2 hover:bg-purple-50 rounded-full transition-colors">
        <Bell size={24} className="text-slate-500" />
      </button>
    </header>
  );
};

// --- Page: Practice Log ---
const PracticeLog = () => {
  const [selectedDate, setSelectedDate] = useState(15);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="pt-24 px-6 pb-32 max-w-2xl mx-auto space-y-8">
      <section>
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight mb-1">练习记录</h1>
            <p className="text-on-surface-variant text-sm font-medium opacity-70">记录你的每一次舞动瞬间</p>
          </div>
          <div className="bg-primary-fixed px-4 py-2 rounded-2xl flex items-center gap-2">
            <Flame size={20} className="text-primary fill-primary" />
            <span className="text-primary font-bold text-lg">12</span>
            <span className="text-primary/70 text-xs font-bold">天连胜</span>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">2023年11月</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-surface-container rounded-xl transition-colors"><ChevronLeft size={16} /></button>
            <button className="p-2 hover:bg-surface-container rounded-xl transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['一', '二', '三', '四', '五', '六', '日'].map(d => (
            <span key={d} className="text-xs font-bold text-on-surface-variant opacity-50">{d}</span>
          ))}
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selectedDate;
            const hasPractice = [1, 4, 8, 15].includes(day);
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(day)}
                className={`relative py-2 text-sm font-medium flex flex-col items-center rounded-xl transition-all ${
                  isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 font-bold' : 'hover:bg-surface-container'
                }`}
              >
                {day}
                {hasPractice && !isSelected && (
                  <div className={`absolute bottom-0 w-1 h-1 rounded-full ${day === 1 ? 'bg-secondary' : 'bg-primary'}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {selectedDate === 15 ? '今日练习' : `${selectedDate}日练习`} (11月{selectedDate}日)
          </h3>
          <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">
            {selectedDate === 15 ? '共2个视频' : '暂无视频'}
          </span>
        </div>

        {selectedDate === 15 ? (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-56 w-full">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB32zwYoTL4pwJqFH1CY2gybdDqZ9_Rzv6KeIrIsWNHXwOshvL63o4UfLwibvToARoz2uDm55mCZHlSunrc-3UHpoO7v2JtxnC1zxVK7g2L3quKNHzZA5vMxBwDaMpsUUFXxc7ehYfOFD7NoVigR9HJ3hazx4n-VCRxds9azKX3S2jajxAbIsmFn3yMA2l89Rho2sakQlArsLGsBf5JZ9QKXPwcQ76UVCAmpLK0rJ4EIhFs5_XmNFGRYSXCipTevjdxQstRh76DOcY" 
                alt="Dancer"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-[10px] font-bold tracking-widest uppercase">Hip-hop</span>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Clock size={14} className="text-white" />
                <span className="text-white text-xs font-medium">18:45 · 12:42</span>
              </div>
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-lg">
                <Play size={20} fill="currentColor" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg leading-tight">基础隔离练习 - 颈部与胸部</h4>
                <div className="flex items-center gap-1 text-secondary font-bold">
                  <BarChart2 size={14} />
                  <span className="text-xs">88分</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-surface-container px-3 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant">每日练习</span>
                <span className="bg-surface-container px-3 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant">动作流程度</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <VideoIcon size={48} strokeWidth={1} />
            <p className="text-sm font-medium">这一天还没有练习记录哦</p>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-2 bg-primary-fixed text-primary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all"
            >
              去练习
            </button>
          </div>
        )}
      </section>

      <div className="fixed bottom-28 right-6 z-40">
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
};

// --- Page: Analysis ---
const Analysis = ({ onShowReport }: { onShowReport: () => void }) => {
  const [autoCrop, setAutoCrop] = useState(true);
  const [fpsAlign, setFpsAlign] = useState('precise');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: '你好！我是你的 AI 舞蹈教练。关于刚才的分析或者动作要领，有什么我可以帮你的吗？' }
  ]);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    // In a real app, this might take some time
    setTimeout(() => {
      // Scroll to bottom to show chatbot
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'bot', 
        text: `关于“${chatMessage}”，建议你在做这个动作时，核心力量要更收紧一些，注意膝盖的方向。你可以尝试放慢速度再练习一次。` 
      }]);
    }, 1000);
  };

  return (
    <div className="pt-24 px-6 pb-32 max-w-2xl mx-auto space-y-10">
      <section>
        <h2 className="text-[2.75rem] leading-tight font-black text-on-surface mb-4 tracking-tighter">
          准备<span className="text-primary italic">进化</span>
        </h2>
        <p className="text-on-surface-variant leading-relaxed font-medium">
          上传两段视频，StreetBeat AI 将通过骨骼识别技术对比你与导师的每一个动作细节，精准捕捉你的“发力感”偏差。
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group overflow-hidden bg-white rounded-[2rem] p-1 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="aspect-[3/4] rounded-[1.8rem] bg-surface-container relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant group-hover:border-primary/40 transition-colors overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/dance1/400/600')" }}></div>
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Award size={32} />
              </div>
              <h3 className="text-lg font-bold mb-1">导师视频</h3>
              <p className="text-xs text-on-surface-variant px-4">上传你想要模仿的目标动作视频</p>
              <button className="mt-6 px-5 py-2.5 rounded-full bg-on-surface text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                <Upload size={14} />
                选择文件
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="text-[10px] font-black tracking-widest uppercase bg-secondary text-white px-2 py-0.5 rounded">Reference</span>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white rounded-[2rem] p-1 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="aspect-[3/4] rounded-[1.8rem] bg-surface-container relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant group-hover:border-primary/40 transition-colors overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/dance2/400/600')" }}></div>
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-white mb-4 shadow-lg shadow-secondary/20">
                <User size={32} />
              </div>
              <h3 className="text-lg font-bold mb-1">我的练习</h3>
              <p className="text-xs text-on-surface-variant px-4">上传你练习这段舞蹈的实拍视频</p>
              <button className="mt-6 px-5 py-2.5 rounded-full bg-on-surface text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                <VideoIcon size={14} />
                从相册选择
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="text-[10px] font-black tracking-widest uppercase bg-primary text-white px-2 py-0.5 rounded">User</span>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="bg-surface-container-low rounded-[2rem] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <h4 className="text-xl font-bold">分析设置</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">区域自动裁剪</p>
                  <p className="text-xs text-on-surface-variant">AI 将自动识别并追踪舞者主体</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoCrop(!autoCrop)}
                className={`w-11 h-6 rounded-full relative transition-colors ${autoCrop ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <motion.div 
                  animate={{ x: autoCrop ? 22 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">多级帧率对齐</p>
                  <p className="text-xs text-on-surface-variant">通过时间轴扭曲实现动作同步</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFpsAlign('precise')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${fpsAlign === 'precise' ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  精准
                </button>
                <button 
                  onClick={() => setFpsAlign('standard')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${fpsAlign === 'standard' ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  标准
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary-container/10 rounded-[2rem] border border-primary/10 flex items-start gap-4">
          <Info size={20} className="text-primary flex-shrink-0 mt-1" />
          <div className="text-xs leading-relaxed text-on-surface-variant font-medium">
            <p className="font-bold mb-1 text-primary">建议提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>请确保环境光线充足，减少背景干扰。</li>
              <li>尽量保持导师视频与练习视频的拍摄角度一致。</li>
              <li>视频长度建议在 15-30 秒以内以获得最佳分析效果。</li>
            </ul>
          </div>
        </div>
      </section>

      {!isAnalyzing ? (
        <button 
          onClick={handleStartAnalysis}
          className="w-full h-16 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all group"
        >
          <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          开始智能分析
          <ChevronRight size={16} className="opacity-50" />
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <button 
              onClick={onShowReport}
              className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all flex items-center gap-2"
            >
              查看详细报告 <BarChart2 size={18} />
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[400px]">
            <div className="bg-primary p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">AI 动作咨询</p>
                <p className="text-[10px] opacity-80">在线解答你的舞蹈疑惑</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-on-surface shadow-sm rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="询问动作要领..."
                className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button 
                onClick={handleSendMessage}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- Page: Analysis Report ---
const AnalysisReport = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-purple-50 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-xl font-black text-primary tracking-tight">AI 分析报告</h1>
        </div>
        <button className="p-2 hover:bg-purple-50 rounded-full">
          <Share2 size={24} className="text-primary" />
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-tr from-primary via-primary-container to-[#9D68FF] p-10 text-white shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">PERFORMANCE REPORT</p>
                <h2 className="text-xl font-bold">总分评价</h2>
              </div>
              <div className="flex items-baseline justify-center md:justify-start">
                <span className="text-[8.5rem] font-black leading-none tracking-tighter">85</span>
                <div className="flex flex-col ml-2">
                  <span className="text-3xl font-bold text-white/40">/100</span>
                  <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded-sm mt-1">GREAT</span>
                </div>
              </div>
              <div className="inline-flex items-center px-5 py-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <Award size={14} className="mr-2 text-secondary fill-secondary" />
                <span className="text-sm font-bold">击败了全球 92% 的练习者</span>
              </div>
            </div>
            
            {/* Simple Radar Chart Mockup */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 border border-white/10 rounded-full"></div>
              <div className="absolute inset-4 border border-white/10 rounded-full"></div>
              <div className="absolute inset-8 border border-white/10 rounded-full"></div>
              <div className="absolute inset-0 bg-secondary/40" style={{ clipPath: 'polygon(50% 10%, 90% 45%, 75% 85%, 30% 80%, 15% 40%)' }}></div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            维度得分与反馈
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Music, label: '节奏感', score: 92, color: 'text-primary', bg: 'bg-primary/10', desc: '节奏控制极其精准，完美卡在重音点上，展现了极佳的乐感。' },
              { icon: Target, label: '准确度', score: 88, color: 'text-primary', bg: 'bg-primary/10', desc: '主要动作位点与大师模板高度契合，四肢的角度控制非常标准。' },
              { icon: Waves, label: '流畅度', score: 76, color: 'text-primary-container', bg: 'bg-primary-container/10', desc: '衔接部分略显生硬，建议在动作转换时保持呼吸均匀，增加连贯感。' },
              { icon: Smile, label: '表现力', score: 82, color: 'text-orange-500', bg: 'bg-orange-50', desc: '自信心十足，身体律动带出了舞蹈的神韵，继续保持这种状态。' },
              { icon: Zap, label: '力量控制', score: 70, color: 'text-red-500', bg: 'bg-red-50', desc: '爆发力尚可，但控制力稍弱，在定点动作时容易产生多余的晃动。' },
            ].map((item, i) => (
              <div key={i} className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 ${i === 4 ? 'md:col-span-2' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                      <item.icon size={24} />
                    </div>
                    <span className="font-bold text-lg">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${item.color}`}>{item.score}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1">/100</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            问题说明 (Problem Breakdown)
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] p-4 flex gap-4 items-center shadow-sm">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-200">
                <img src="https://picsum.photos/seed/error1/200/200" alt="Error" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play size={24} className="text-white" fill="white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold">动作迟滞</span>
                  <span className="text-[10px] text-slate-400 font-medium">00:12 - 00:14</span>
                </div>
                <h4 className="font-bold text-sm mb-1">手臂摆动幅度不足</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2">在此段 Power Move 中，双臂未完全打开，导致惯性损失。</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            针对性训练建议
          </button>
          <button className="flex-1 bg-white text-primary border-2 border-primary/10 py-5 rounded-2xl font-bold text-lg hover:bg-primary/5 active:scale-95 transition-transform">
            重新录制一段
          </button>
        </div>
      </main>
    </div>
  );
};

// --- Page: AI Coach ---
const AICoach = ({ session }: { session: Session | null }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '嘿！我是你的 AI 私教 **Kiri**。我看过你刚才上传的《Popping 基础训练》视频了。你的 **Pop** 爆发力非常出色，但在身体波浪（Wave）的过度部分稍显生硬。你想先针对哪部分进行针对性提升？' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/chat?user_id=${session.user.id}`).then(res => res.json()).then(data => {
      // Ensure data is array implicitly representing success
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data.map((msg: any) => ({ role: msg.role === 'ai' ? 'ai' : 'user', content: msg.content })));
      }
    }).catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, user_id: session?.user?.id })
      });
      const data = await res.json();
      if (data && data.error && !data.content) {
         setMessages(prev => [...prev, { role: 'ai', content: `[后端/DB报错] ${data.error}` }]);
      } else if (data && data.content) {
        setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', content: '连接后端失败，请确认服务器已启动。' }]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary tracking-tight">AI 舞动私教</span>
            <span className="text-[10px] text-secondary flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Kiri 正在线
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-purple-50 rounded-full">
          <MoreVertical size={24} className="text-slate-500" />
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 pt-24 px-4 pb-64 overflow-y-auto space-y-6 max-w-2xl mx-auto w-full no-scrollbar">
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-medium text-on-surface-variant tracking-wider uppercase">今天</span>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 items-end ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-10 h-10 rounded-2xl bg-primary-container flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-primary/10">
                <MessageCircle size={20} fill="white" />
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`p-4 rounded-t-3xl shadow-sm border border-outline-variant/10 ${
                msg.role === 'ai' 
                  ? 'bg-white rounded-br-3xl' 
                  : 'bg-primary text-white rounded-bl-3xl'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-400 px-2">10:24 AM</span>
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://picsum.photos/seed/user/100/100" 
                  alt="User"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        ))}
      </main>

      <div className="fixed bottom-20 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['如何提高爆发力？', '分析我的动作', '推荐背景音乐', '查看我的进度'].map(chip => (
              <button 
                key={chip}
                onClick={() => setInput(chip)}
                className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-white shadow-sm border border-purple-100 text-sm font-medium text-primary hover:bg-purple-50 active:scale-95 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="bg-white/90 backdrop-blur-2xl px-4 pt-3 pb-8 shadow-lg rounded-t-[2.5rem] border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                <Plus size={24} />
              </button>
              <div className="flex-1 relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-5 pr-12 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400" 
                  placeholder="向 Kiri 提问..." 
                  type="text"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary">
                  <Mic size={20} />
                </button>
              </div>
              <button 
                onClick={handleSend}
                className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Page: Data ---
const DanceData = () => {
  return (
    <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2 mb-2">
          <h2 className="text-[2.75rem] leading-none font-black text-on-surface tracking-tighter font-headline">舞动数据</h2>
          <p className="text-on-surface-variant font-medium mt-2">节奏不停，热爱不熄。</p>
        </div>
        
        <div className="col-span-1 p-6 rounded-[2rem] bg-primary text-white flex flex-col justify-between aspect-square relative overflow-hidden">
          <div className="z-10">
            <span className="text-xs font-bold tracking-widest opacity-80 uppercase">总计天数</span>
            <div className="text-5xl font-black mt-2 font-headline">128</div>
          </div>
          <div className="z-10 flex items-center gap-2">
            <Flame size={14} fill="white" />
            <span className="text-sm font-bold">持续突破中</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="col-span-1 p-6 rounded-[2rem] bg-white flex flex-col justify-between aspect-square border-none shadow-sm">
          <div>
            <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">练习时长</span>
            <div className="text-5xl font-black mt-2 text-primary font-headline tracking-tighter">46.5<span className="text-lg ml-1 text-on-surface-variant">H</span></div>
          </div>
          <div className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full self-start text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            <span>较上周 +12%</span>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low rounded-[2.5rem] p-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-bold text-on-surface">近 30 天活跃趋势</h3>
            <p className="text-xs text-on-surface-variant mt-1">你的律动曲线正在变得更加精准</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-secondary font-headline">A+</span>
            <div className="text-[10px] font-bold text-on-surface-variant">当前评级</div>
          </div>
        </div>
        
        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b38d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6b38d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#6b38d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4 px-1 text-[10px] font-bold text-on-surface-variant tracking-widest">
            <span>10月1日</span>
            <span>10月15日</span>
            <span>今天</span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-bold text-on-surface">成就奖章</h3>
          <button className="text-sm font-bold text-primary hover:bg-primary-fixed px-3 py-1 rounded-full transition-colors">查看全部</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Award, label: '节奏大师', sub: '连胜 7 天', bg: 'bg-secondary-container/20', color: 'text-secondary' },
            { icon: Zap, label: '力量瞬间', sub: '完成 Power Move', bg: 'bg-primary-fixed', color: 'text-primary' },
            { icon: Lock, label: '百日成诗', sub: '已完成 85%', bg: 'bg-surface-container', color: 'text-slate-400' },
          ].map((badge, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-4 flex flex-col items-center text-center space-y-3 group hover:scale-105 transition-transform">
              <div className={`w-16 h-16 rounded-full ${badge.bg} flex items-center justify-center ${badge.color}`}>
                <badge.icon size={32} fill={badge.color === 'text-slate-400' ? 'none' : 'currentColor'} />
              </div>
              <div>
                <div className="text-xs font-black leading-tight">{badge.label}</div>
                <div className="text-[10px] text-on-surface-variant font-medium mt-1">{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Page: Profile ---
const Profile = ({ session }: { session: Session | null }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleAction = (label: string) => {
    setToastMsg(`正在进入 ${label}...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-on-surface text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-on-surface font-headline leading-tight">个人中心</h1>
            <p className="text-on-surface-variant font-medium">{session?.user?.email || '舞者'} | LV.12 进阶</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary-container border-4 border-white flex items-center justify-center">
            <BadgeCheck size={24} className="text-secondary fill-secondary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '练习时长', value: '128', unit: 'H', color: 'text-primary' },
            { label: '最高分', value: '94', unit: 'Pts', color: 'text-secondary' },
            { label: '练习视频', value: '42', unit: '个', color: 'text-on-surface' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-xs font-bold text-on-surface-variant">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-primary-container rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-500/20">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-headline">会员中心</h3>
            <p className="text-purple-100/80 text-sm">解锁无限次 AI 舞姿分析报告</p>
          </div>
          <button 
            onClick={() => handleAction('会员续费')}
            className="bg-white text-primary font-bold px-5 py-2.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            立即续费
          </button>
        </div>
        <div className="absolute -right-4 -bottom-8 opacity-20">
          <Award size={120} className="text-white fill-white" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-on-surface-variant px-2 tracking-widest uppercase mb-4">功能菜单</h2>
        <div className="space-y-2">
          {[
            { icon: VideoIcon, label: '我的视频', sub: '已上传 42 段练习视频', color: 'text-primary', bg: 'bg-purple-50' },
            { icon: BarChart2, label: '我的报告', sub: '深度分析与改进建议', color: 'text-primary', bg: 'bg-purple-50' },
            { icon: Settings, label: '设置', sub: '账号、通知与偏好', color: 'text-slate-500', bg: 'bg-slate-100' },
            { icon: MessageCircle, label: '意见反馈', sub: '帮助我们做得更好', color: 'text-slate-500', bg: 'bg-slate-100' },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => handleAction(item.label)}
              className="group flex items-center justify-between p-5 bg-white rounded-3xl hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:bg-primary group-hover:text-white transition-colors`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="font-bold text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => supabase.auth.signOut()} className="w-full py-5 text-red-500 font-bold text-sm bg-red-50 rounded-3xl active:scale-[0.98] transition-all">
        退出登录
      </button>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const renderPage = () => {
    if (showReport) {
      return <AnalysisReport onBack={() => setShowReport(false)} />;
    }

    switch (activeTab) {
      case 'practice': return <PracticeLog />;
      case 'analysis': return <Analysis onShowReport={() => setShowReport(true)} />;
      case 'coach': return <AICoach session={session} />;
      case 'data': return <DanceData />;
      case 'profile': return <Profile session={session} />;
      default: return <PracticeLog />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'practice': return 'StreetBeat AI';
      case 'analysis': return 'AI 视频分析';
      case 'coach': return 'AI 舞动私教';
      case 'data': return '舞动数据';
      case 'profile': return '个人中心';
      default: return 'StreetBeat AI';
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {!showReport && <Header title={getTitle()} />}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={showReport ? 'report' : activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {!showReport && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
