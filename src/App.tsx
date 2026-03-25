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
  Camera,
  ExternalLink
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const VideoUploadModal = ({ isOpen, onClose, session, onUploadSuccess }: { isOpen: boolean, onClose: () => void, session: Session | null, onUploadSuccess?: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'info'>('upload');
  const [fileUrl, setFileUrl] = useState('');
  const [title, setTitle] = useState('');
  const [danceType, setDanceType] = useState('Hip-hop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${session?.user?.id || 'anonymous'}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
      setFileUrl(publicUrl);
      setStep('info');
    } catch (error: any) {
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!title.trim()) return alert("请输入练习记录标题");
    setUploading(true);
    try {
      await supabase.from('practice_logs').insert([{
        user_id: session?.user?.id,
        video_url: fileUrl,
        title: title,
        type: danceType,
        score: Math.floor(Math.random() * 20) + 75,
        created_at: new Date().toISOString()
      }]);
      alert('已记录您的舞动瞬间！');
      onUploadSuccess?.();
      onClose();
      setStep('upload');
      setTitle('');
    } catch (error: any) {
      alert('保存失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-primary">{step === 'upload' ? '记录新练习' : '补充练习详情'}</h3>
              <button onClick={onClose} disabled={uploading} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {step === 'upload' ? (
              <div className="grid grid-cols-2 gap-4">
                <button disabled className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                    <Camera size={32} />
                  </div>
                  <span className="font-bold text-xs text-center">立即拍摄 (维护中)</span>
                </button>
                
                <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-secondary-container/20 text-secondary hover:bg-secondary hover:text-white transition-all group">
                  <div className={`w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center transition-colors ${uploading ? 'animate-pulse' : 'group-hover:bg-white/20'}`}>
                    <Upload size={32} />
                  </div>
                  <span className="font-bold text-xs">{uploading ? '上传中...' : '本地上传'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="aspect-video rounded-3xl bg-slate-100 overflow-hidden relative">
                  <video src={fileUrl} className="w-full h-full object-cover" muted autoPlay loop />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <Sparkles className="text-white/50 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">练习内容</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="比如：隔离练习第一周" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">舞种</label>
                    <select value={danceType} onChange={(e) => setDanceType(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-medium appearance-none">
                      {['Hip-hop', 'Popping', 'Breaking', 'Jazz', 'Locking', 'House'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveInfo} disabled={uploading} className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                  {uploading ? '保存中...' : '完成记录'}
                </button>
              </div>
            )}
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed"><span className="font-bold text-primary">提示：</span> 认真记录每一份汗水，AI 教练会通过你的练习趋势给出更精准的回馈！</p>
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
const PracticeLog = ({ session }: { session: Session | null }) => {
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userRecords, setUserRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  const fetchRecords = async () => {
    const { data } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    
    // Filter for current selected day in current month
    const filtered = (data || []).filter(r => {
      const rd = new Date(r.created_at);
      return rd.getDate() === selectedDate && rd.getMonth() === now.getMonth();
    });
    setUserRecords(filtered);
  };

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

      {/* Recommended Practice moved to the top */}
      {selectedDate === now.getDate() && (
        <div 
          onClick={() => window.open('https://www.bilibili.com/video/BV1QN411D7Ew/', '_blank')}
          className="bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between text-white group cursor-pointer overflow-hidden relative"
        >
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
               <Sparkles size={12} className="text-secondary" />
               <span className="text-[10px] font-black uppercase tracking-widest">推荐练习</span>
            </div>
            <h4 className="text-2xl font-black leading-tight">基础隔离练习<br/>颈部与胸部</h4>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary group-hover:gap-4 transition-all">
              进入教程 <ArrowRight size={14} />
            </button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 group-hover:opacity-50 transition-opacity">
             <img src="https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900 to-transparent"></div>
        </div>
      )}

      <section className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">{now.getFullYear()}年{now.getMonth() + 1}月</h2>
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
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-xl text-on-surface">
            {selectedDate === now.getDate() ? '今日练习' : `${selectedDate}日练习`}
          </h3>
          <span className="text-xs font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/10">
            {userRecords.length} 个记录
          </span>
        </div>

        {userRecords.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {userRecords.map((r, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group border border-slate-50">
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  <video src={r.video_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <span className="text-white text-[10px] font-black tracking-widest uppercase">{r.type}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                       <span className="text-white/60 text-[10px] font-bold tracking-widest flex items-center gap-1 uppercase">
                         <Clock size={10} /> {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       <h4 className="text-white text-xl font-black leading-none">{r.title}</h4>
                    </div>
                    <button onClick={() => window.open(r.video_url, '_blank')} className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-90 transition-transform">
                      <Play size={24} fill="white" />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                         <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">分析分值</span>
                      </div>
                      <span className="text-xl font-black text-secondary">{r.score}<span className="text-[10px] ml-0.5">PTS</span></span>
                   </div>
                   <div className="flex -space-x-2">
                      {[1,2,3].map(j => (
                        <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${r.id}${j}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 space-y-6 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100/50">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
               <VideoIcon size={32} strokeWidth={1.5} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-on-surface/30 uppercase tracking-widest">No Practice Records</p>
              <p className="text-xs font-medium text-on-surface/20 mt-1">记录你的第一条舞动瞬间吧</p>
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-8 py-3 bg-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/10 hover:bg-primary-container transition-all active:scale-95"
            >
              即刻开练
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
        session={session}
        onUploadSuccess={fetchRecords}
      />
    </div>
  );
};

// --- Page: Analysis ---
const Analysis = ({ onShowReport, session }: { onShowReport: (report: any[], userUrl: string, refUrl: string) => void, session: Session | null }) => {
  const [autoCrop, setAutoCrop] = useState(true);
  const [fpsAlign, setFpsAlign] = useState('precise');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isRefUploading, setIsRefUploading] = useState(false);
  const [isUserUploading, setIsUserUploading] = useState(false);
  
  const [refVideo, setRefVideo] = useState('');
  const [userVideo, setUserVideo] = useState('');
  
  const refInput = useRef<HTMLInputElement>(null);
  const userInput = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isRef: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isRef) setIsRefUploading(true);
    else setIsUserUploading(true);

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    if (isRef) setRefVideo(localUrl);
    else setUserVideo(localUrl);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);

      // Replace local preview with permanent public URL once uploaded
      if (isRef) setRefVideo(publicUrl);
      else setUserVideo(publicUrl);
    } catch (err: any) {
      alert("视频上传失败，报错: " + err.message);
    } finally {
      if (isRef) setIsRefUploading(false);
      else setIsUserUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!refVideo || !userVideo) {
      setErrorText('请先上传左右两段完整的对比视频！');
      return;
    }
    setErrorText('');
    setIsAnalyzing(true);
    
    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refUrl: refVideo, userUrl: userVideo })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let parsed = [];
      try {
        const cleaned = data.report.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch(e) {
        throw new Error("AI大模型返回的数据格式不是标准 JSON，无法解析。");
      }
      
      setIsAnalyzing(false);
      
      // Save report to Supabase for persistence
      try {
        await supabase.from('analysis_reports').insert([{
          user_id: session?.user?.id,
          user_video_url: userVideo,
          ref_video_url: refVideo,
          report_json: parsed,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.error("Failed to save report to DB:", e);
      }

      onShowReport(parsed, userVideo, refVideo);
    } catch (err: any) {
      setErrorText(err.message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="pt-24 px-6 pb-32 max-w-2xl mx-auto space-y-10">
      <section>
        <h2 className="text-[2.75rem] leading-tight font-black text-on-surface mb-4 tracking-tighter">
          准备<span className="text-primary italic">进化</span>
        </h2>
        <p className="text-on-surface-variant leading-relaxed font-medium">
          上传两段视频，StreetBeat AI 将通过 Gemini Vision 模型对比你与导师的每一个动作细节，帮助你找到问题，越跳越好！
        </p>
      </section>

      {errorText && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm border border-red-100">
          ⚠️ {errorText}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="file" accept="video/*" ref={refInput} onChange={(e) => handleUpload(e, true)} className="hidden" />
        <input type="file" accept="video/*" ref={userInput} onChange={(e) => handleUpload(e, false)} className="hidden" />
        
        <div className="relative group overflow-hidden bg-white rounded-[2rem] p-1 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="aspect-[3/4] rounded-[1.8rem] bg-surface-container relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant transition-colors overflow-hidden p-2">
            {isRefUploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-primary animate-pulse">上传中...</p>
              </div>
            ) : refVideo ? (
               <video src={refVideo} className="w-full h-full object-cover rounded-xl" muted autoPlay loop playsInline />
            ) : (
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                  <Award size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">导师视频</h3>
                <button onClick={() => refInput.current?.click()} className="mt-6 px-5 py-2.5 rounded-full bg-on-surface text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                  <Upload size={14} />选择文件
                </button>
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="text-[10px] font-black tracking-widest uppercase bg-secondary text-white px-2 py-0.5 rounded">Reference</span>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white rounded-[2rem] p-1 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="aspect-[3/4] rounded-[1.8rem] bg-surface-container relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant transition-colors overflow-hidden p-2">
            {isUserUploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-secondary animate-pulse">上传中...</p>
              </div>
            ) : userVideo ? (
               <video src={userVideo} className="w-full h-full object-cover rounded-xl" muted autoPlay loop playsInline />
            ) : (
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-white mb-4 shadow-lg shadow-secondary/20">
                  <User size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">我的练习</h3>
                <button onClick={() => userInput.current?.click()} className="mt-6 px-5 py-2.5 rounded-full bg-on-surface text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                  <VideoIcon size={14} />上传相册视频
                </button>
              </div>
            )}
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
            <h4 className="text-xl font-bold">智能分析设置</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Gemini 视觉解析引擎</p>
                  <p className="text-xs text-on-surface-variant">启用最新的 Gemini 2.5 Flash 多模态核心</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg text-[10px] font-bold bg-primary-fixed text-primary transition-colors">Enabled</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={handleStartAnalysis}
        disabled={isAnalyzing || isRefUploading || isUserUploading}
        className={`w-full h-16 rounded-full text-white font-bold text-lg shadow-2xl flex items-center justify-center gap-3 transition-all group ${
          (isAnalyzing || isRefUploading || isUserUploading) 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-primary to-primary-container shadow-primary/30 active:scale-95 hover:shadow-primary/40'
        }`}
      >
        <Sparkles size={20} className={(isAnalyzing || isRefUploading || isUserUploading) ? '' : 'group-hover:rotate-12 transition-transform'} />
        {isAnalyzing ? '正在处理百万级像素特征...' : (isRefUploading || isUserUploading) ? '正在上传视频...' : '开始智能分析'}
        {!(isAnalyzing || isRefUploading || isUserUploading) && <ChevronRight size={16} className="opacity-50" />}
      </button>
    </div>
  );
};

// --- Page: Analysis Report ---
const AnalysisReport = ({ onBack, report, videoUrl, refVideoUrl, onAskCoach }: { onBack: () => void, report: any[], videoUrl: string, refVideoUrl: string, onAskCoach: (msg: string) => void }) => {
  const [screenshots, setScreenshots] = useState<Record<number, string>>({});
  const [refScreenshots, setRefScreenshots] = useState<Record<number, string>>({});
  const [previewData, setPreviewData] = useState<{url: string, time: number} | null>(null);
  
  useEffect(() => {
    if (!videoUrl || !report || report.length === 0) return;

    const captureAll = async () => {
      // Capture User screenshots
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      await new Promise(resolve => { video.onloadedmetadata = resolve; });

      // Capture Ref screenshots
      const refVideo = document.createElement('video');
      refVideo.crossOrigin = "anonymous";
      refVideo.src = refVideoUrl;
      await new Promise(resolve => { refVideo.onloadedmetadata = resolve; });

      for (const item of report) {
        if (item.timestamp === undefined) continue;
        
        // Screenshot for User
        await new Promise((resolve) => {
          video.currentTime = item.timestamp;
          video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 360;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            setScreenshots(prev => ({ ...prev, [item.timestamp]: canvas.toDataURL('image/jpeg') }));
            resolve(true);
          };
        });

        // Screenshot for Ref
        await new Promise((resolve) => {
          refVideo.currentTime = item.timestamp;
          refVideo.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = refVideo.videoWidth || 640;
            canvas.height = refVideo.videoHeight || 360;
            canvas.getContext('2d')?.drawImage(refVideo, 0, 0, canvas.width, canvas.height);
            setRefScreenshots(prev => ({ ...prev, [item.timestamp]: canvas.toDataURL('image/jpeg') }));
            resolve(true);
          };
        });
      }
    };
    captureAll();
  }, [report, videoUrl, refVideoUrl]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-purple-50 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-xl font-black text-primary tracking-tight">AI 动作对比报告</h1>
        </div>
        <button className="p-2 hover:bg-purple-50 rounded-full">
          <Share2 size={24} className="text-primary" />
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Playback Modal */}
        {previewData !== null && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <button onClick={() => setPreviewData(null)} className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full z-50">
              <X size={24} />
            </button>
            <video 
              src={previewData.url} 
              className="w-full max-h-[80vh] rounded-2xl" 
              autoPlay 
              controls 
              onLoadedMetadata={(e) => {
                (e.target as HTMLVideoElement).currentTime = previewData.time;
              }}
            />
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-tr from-primary via-primary-container to-[#9D68FF] p-10 text-white shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">GEMINI VISION REPORT</p>
                <h2 className="text-xl font-bold">总计发现</h2>
              </div>
              <div className="flex items-baseline justify-center md:justify-start">
                <span className="text-[5rem] font-black leading-none tracking-tighter">{report.length}</span>
                <div className="flex flex-col ml-2">
                  <span className="text-3xl font-bold text-white/40">个差异点</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            智能抽帧诊断 (Problem Breakdown)
          </h2>
          <div className="space-y-4">
            {report.map((item, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-5 shadow-sm border border-outline-variant/5">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setPreviewData({ url: videoUrl, time: item.timestamp })}
                      className="relative flex-1 aspect-video rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100 group"
                    >
                      {screenshots[item.timestamp] ? (
                        <img src={screenshots[item.timestamp]} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold animate-pulse">我的练习...</span>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={20} className="text-white fill-white" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[8px] font-bold">我的练习</div>
                    </button>

                    <button 
                      onClick={() => setPreviewData({ url: refVideoUrl, time: item.timestamp })}
                      className="relative flex-1 aspect-video rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700 group hover:opacity-90 transition-opacity"
                    >
                      {refScreenshots[item.timestamp] ? (
                        <img src={refScreenshots[item.timestamp]} alt="Mentor" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                           <Play size={20} className="text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={20} className="text-white fill-white" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-primary px-2 py-0.5 rounded text-white text-[8px] font-bold">参考导师</div>
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold tracking-wider">动作捕捉 00:{Math.floor(item.timestamp).toString().padStart(2, '0')}s</span>
                    </div>
                    <h4 className="font-bold text-base mb-2 text-on-surface leading-tight">{item.issue}</h4>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1">“{item.suggestion}”</p>
                  </div>
                </div>
              </div>
            ))}
            {report.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-bold bg-white rounded-[2rem]">
                未发现明显动作异常。
              </div>
            )}
          </div>
        </section>

        {report.length > 0 && (
          <div className="pt-6">
            <button 
              onClick={() => {
                const summary = report.map(r => `[${r.timestamp}s] ${r.issue}: ${r.suggestion}`).join('\n');
                onAskCoach(`你好！我刚刚完成了视频分析，系统发现了以下问题：\n${summary}\n\n请针对这些问题给我更详细的训练建议和改进方法。`);
              }}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              针对性训练建议
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Page: AI Coach ---
const AICoach = ({ session, initialInput, onClearInitial }: { session: Session | null, initialInput?: string, onClearInitial?: () => void }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '嘿！我是你的 AI 私教 **Kiri**。我看过你刚才上传的《Popping 基础训练》视频了。你的 **Pop** 爆发力非常出色，但在身体波浪（Wave）的过度部分稍显生硬。你想先针对哪部分进行针对性提升？' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendWithText = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, user_id: session?.user?.id })
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    handleSendWithText(msg);
  };

  useEffect(() => {
    if (initialInput && initialInput.trim()) {
      handleSendWithText(initialInput);
      onClearInitial?.();
    }
  }, [initialInput]);

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
              <div className={`p-4 rounded-t-3xl shadow-sm border border-outline-variant/10 text-sm leading-relaxed ${
                msg.role === 'ai' 
                  ? 'bg-white rounded-br-3xl text-on-surface' 
                  : 'bg-primary text-white rounded-bl-3xl'
              }`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                      h1: ({node, ...props}) => <h1 className="font-bold text-lg mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="font-bold text-base mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-bold text-sm mb-2" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
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
const Profile = ({ session, onViewHistoryReport }: { 
  session: Session | null, 
  onViewHistoryReport?: (report: any[], userUrl: string, refUrl: string) => void 
}) => {
  const [view, setView] = useState<'menu' | 'videos' | 'reports' | 'pricing' | 'settings' | 'feedback'>('menu');
  const [videos, setVideos] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'videos') fetchVideos();
    if (view === 'reports') fetchReports();
  }, [view]);

  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  };

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  const handleDeleteVideo = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这段练习记录吗？')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('practice_logs')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;

      setVideos(prev => prev.filter(v => v.id !== videoId));
      alert('已删除');
    } catch (error: any) {
      alert('删除失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'videos') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-2xl font-black text-on-surface">我的视频</h1>
        </div>
        
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : videos.length === 0 ? (
          <div className="py-20 text-center text-slate-400">暂无上传视频</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((v, i) => (
              <div key={i} onClick={() => setActiveVideo(v.video_url)} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
                <div className="w-24 aspect-video bg-slate-900 rounded-xl overflow-hidden relative">
                  <video src={v.video_url} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play size={16} className="text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm truncate">{v.title || '我的练习记录'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{v.type}</span>
                    <p className="text-[10px] text-on-surface-variant font-medium">{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDeleteVideo(e, v.id)}
                    className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors rounded-xl"
                  >
                    <X size={18} />
                  </button>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        <AnimatePresence>
           {activeVideo && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveVideo(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
                 <video src={activeVideo} className="w-full h-full" controls autoPlay />
                 <button onClick={() => setActiveVideo(null)} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all">
                   <X size={24} />
                 </button>
               </motion.div>
             </div>
           )}
        </AnimatePresence>
      </div>
    );
  }

  if (view === 'reports') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-2xl font-black text-on-surface">我的报告</h1>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400">暂无分析报告</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((r, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-black text-primary tracking-widest uppercase">AI 深度分析报告</p>
                     <p className="text-xs text-on-surface-variant mt-1 font-medium">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full">{r.report_json?.length || 0} 个优化项</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 aspect-video bg-slate-100 rounded-xl overflow-hidden">
                    <video src={r.user_video_url} className="w-full h-full object-cover" muted />
                    <span className="absolute bottom-1 right-2 text-[8px] bg-black/40 text-white px-1 rounded font-bold">USER</span>
                  </div>
                  <div className="relative flex-1 aspect-video bg-slate-100 rounded-xl overflow-hidden">
                    <video src={r.ref_video_url} className="w-full h-full object-cover" muted />
                    <span className="absolute bottom-1 right-2 text-[8px] bg-black/40 text-white px-1 rounded font-bold">REF</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onViewHistoryReport) {
                      onViewHistoryReport(r.report_json, r.user_video_url, r.ref_video_url);
                    }
                  }} 
                  className="w-full py-3 bg-slate-50 rounded-2xl text-xs font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all"
                >
                  查看分析详情
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'pricing') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-2xl font-black text-on-surface font-headline uppercase tracking-tighter">Premium Plans</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { tag: '入门款', title: '按月计划', price: '¥38', sub: '/ 月', feat: ['无限次视频分析', 'AI 舞动对话解锁', '专属 3D 骨骼导出'], color: 'bg-slate-100 text-on-surface' },
            { tag: '最受欢迎', title: '按年计划', price: '¥298', sub: '/ 年', feat: ['所有月度功能', '离线视频本地存储', '提前体验新舞种 AI'], color: 'bg-primary text-white', pop: true },
            { tag: '高性价比', title: '半年计划', price: '¥168', sub: '/ 半年', feat: ['所有月度功能', '高清 4K 云端备份'], color: 'bg-secondary text-white' },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-[2.5rem] p-8 ${plan.color} overflow-hidden shadow-xl ${plan.pop ? 'scale-105 border-4 border-white ring-4 ring-primary/10' : ''}`}>
               {plan.pop && <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">Recommended</div>}
               <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{plan.tag}</span>
                    <h3 className="text-3xl font-black mt-1 font-headline tracking-tight">{plan.title}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-headline tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold opacity-70">{plan.sub}</span>
                  </div>
                  <div className="space-y-4 py-4">
                    {plan.feat.map((f, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white/20`}><Sparkles size={10} /></div>
                        <span className="text-sm font-medium opacity-90">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.pop ? 'bg-white text-primary' : 'bg-primary text-white'}`}>立即开通</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-2xl font-black text-on-surface">设置</h1>
        </div>
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm">
           {[
             { label: '个人资料修改', sub: '昵称、头像与个性签名' },
             { label: '账号安全', sub: '密码、手机与第三方绑定' },
             { label: '隐私设置', sub: '练习记录可见性' },
             { label: '通用设置', sub: '暗色模式、多语言' },
             { label: '关于 StreetBeat AI', sub: '版本 v2.1.0' },
           ].map((s, i) => (
             <div key={i} className="p-6 border-b border-slate-50 last:border-none hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-all">
                <div>
                   <p className="font-bold text-sm group-hover:text-primary">{s.label}</p>
                   <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-tighter">{s.sub}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (view === 'feedback') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-2xl font-black text-on-surface">意见反馈</h1>
        </div>
        <div className="space-y-6">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm space-y-6 border border-slate-50">
              <div className="space-y-4">
                 <p className="text-sm font-black uppercase tracking-widest text-primary">你是遇到了什么问题吗？</p>
                 <textarea rows={6} placeholder="请描述您遇到的问题或建议，我们会尽快处理..." className="w-full bg-slate-50 border-none rounded-3xl p-6 focus:ring-2 focus:ring-primary transition-all font-medium text-sm" />
              </div>
              <div className="space-y-4">
                 <p className="text-sm font-black uppercase tracking-widest text-primary">上传相关截图 (可选)</p>
                 <div className="grid grid-cols-4 gap-4">
                    <button className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all">
                       <Plus size={24} />
                    </button>
                 </div>
              </div>
           </div>
           <button onClick={() => { alert("感谢反馈！"); setView('menu'); }} className="w-full py-5 bg-on-surface text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">
              提交反馈
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <section className="relative space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-on-surface font-headline leading-tight uppercase">User Profile</h1>
            <p className="text-on-surface-variant font-medium tracking-tight opacity-70 italic">{session?.user?.email || 'StreetBeat Dancer'} | LV.12 进阶</p>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-primary-container border-4 border-white flex items-center justify-center shadow-xl shadow-primary/10">
            <BadgeCheck size={32} className="text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '练习时长', value: '128', unit: 'H', color: 'text-primary' },
            { label: '最高分', value: '94', unit: 'Pts', color: 'text-secondary' },
            { label: '练习视频', value: videos.length || '0', unit: '个', color: 'text-on-surface' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50">
              <p className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase mb-2 opacity-50">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black font-headline ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 group cursor-pointer" onClick={() => setView('pricing')}>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 mb-2">
               <Award size={12} className="text-yellow-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Premium Membership</span>
            </div>
            <h3 className="text-3xl font-black font-headline leading-tight">开通会员计划<br/>解锁 AI 核心分析</h3>
          </div>
          <button 
            className="bg-primary text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest w-fit active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            立即续费
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
           <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-on-surface-variant px-4 tracking-[0.2em] uppercase opacity-50 mb-4">Functional Menu</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: VideoIcon, label: '我的视频', sub: '查看所有舞动瞬间', color: 'text-primary', bg: 'bg-primary/5', value: 'videos' },
            { icon: BarChart2, label: '我的报告', sub: '历史分析深度回溯', color: 'text-secondary', bg: 'bg-secondary/5', value: 'reports' },
            { icon: Settings, label: '设置中心', sub: '个性化与隐私偏好', color: 'text-slate-500', bg: 'bg-slate-100/50', value: 'settings' },
            { icon: MessageCircle, label: '意见反馈', sub: '期待您的每一个声音', color: 'text-slate-500', bg: 'bg-slate-100/50', value: 'feedback' },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => {
                if (item.value) setView(item.value as any);
              }}
              className="group flex items-center justify-between p-6 bg-white rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all cursor-pointer active:scale-[0.98] border border-slate-50"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:bg-primary group-hover:text-white transition-all shadow-sm`}>
                  <item.icon size={28} />
                </div>
                <div>
                  <p className="font-black text-on-surface text-lg uppercase tracking-tight leading-none mb-1">{item.label}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-200 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => supabase.auth.signOut()} className="w-full py-6 text-red-500 font-extrabold text-[10px] uppercase tracking-[0.3em] hover:bg-red-50 rounded-[2rem] transition-all active:scale-95">
        Log Out Current Session
      </button>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [showReport, setShowReport] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any[]>([]);
  const [analysisVideoUrl, setAnalysisVideoUrl] = useState('');
  const [analysisRefUrl, setAnalysisRefUrl] = useState('');
  const [coachInitialMessage, setCoachInitialMessage] = useState('');

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
      return (
        <AnalysisReport 
          onBack={() => setShowReport(false)} 
          report={analysisReport} 
          videoUrl={analysisVideoUrl} 
          refVideoUrl={analysisRefUrl}
          onAskCoach={(msg) => {
            setCoachInitialMessage(msg);
            setActiveTab('coach');
            setShowReport(false);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'practice': return <PracticeLog session={session} />;
      case 'analysis': return (
        <Analysis 
          onShowReport={(rep, url, refUrl) => { 
            setAnalysisReport(rep); 
            setAnalysisVideoUrl(url); 
            setAnalysisRefUrl(refUrl || ''); 
            setShowReport(true); 
          }} 
          session={session} 
        />
      );
      case 'coach': return <AICoach session={session} initialInput={coachInitialMessage} onClearInitial={() => setCoachInitialMessage('')} />;
      case 'data': return <DanceData />;
      case 'profile': return (
        <Profile 
          session={session} 
          onViewHistoryReport={(rep, url, refUrl) => {
            setAnalysisReport(rep);
            setAnalysisVideoUrl(url);
            setAnalysisRefUrl(refUrl);
            setShowReport(true);
          }} 
        />
      );
      default: return <PracticeLog session={session} />;
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
