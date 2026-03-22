import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  BarChart3, 
  Users, 
  Video, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Activity,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const mockActivityData = [
  { name: 'Mon', users: 120, videos: 40 },
  { name: 'Tue', users: 150, videos: 45 },
  { name: 'Wed', users: 180, videos: 60 },
  { name: 'Thu', users: 170, videos: 55 },
  { name: 'Fri', users: 210, videos: 80 },
  { name: 'Sat', users: 250, videos: 110 },
  { name: 'Sun', users: 230, videos: 90 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [practiceLogs, setPracticeLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: chats } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false });
      const { data: practices } = await supabase.from('practice_logs').select('*').order('created_at', { ascending: false });
      
      if (chats) setChatLogs(chats);
      if (practices) setPracticeLogs(practices);
    }
    fetchData();
  }, []);

  const uniqueUsers = Array.from(new Set([...chatLogs.map(c => c.user_id), ...practiceLogs.map(p => p.user_id)])).filter(Boolean);

  const tabs = [
    { id: 'overview', label: '数据总览', icon: BarChart3 },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'videos', label: '练习内容', icon: Video },
    { id: 'chat', label: 'AI 监控', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-background font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col z-20 shadow-sm relative">
        <div className="p-6 pb-2 text-primary font-black text-2xl tracking-tighter flex items-center justify-between">
          <span>StreetBeat <span className="text-secondary">Admin</span></span>
        </div>
        <p className="px-6 text-xs text-slate-400 font-medium mb-8">Management Portal</p>
        
        <nav className="flex-1 px-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-on-surface-variant hover:bg-surface-container active:scale-95'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-2xl transition-all font-bold">
            <Settings size={20} /> 系统设置
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold mt-1">
            <LogOut size={20} /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold font-headline">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="搜索全局..." 
                className="w-64 bg-surface-container-low pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                AD
              </div>
              <div className="text-sm font-bold text-on-surface">Admin User</div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gradient-to-br from-background to-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Conditional Rendering (To be expanded) */}
            {activeTab === 'overview' && (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: '活跃独立用户', value: uniqueUsers.length, trend: 'Top', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: '练习日志数', value: practiceLogs.length, trend: 'Global', icon: Video, color: 'text-secondary', bg: 'bg-secondary/20' },
                    { label: 'AI 交互次数', value: chatLogs.length, trend: 'Active', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                        <stat.icon size={100} />
                      </div>
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-on-surface-variant font-bold">{stat.label}</span>
                      </div>
                      <div className="flex items-end gap-3 relative z-10">
                        <span className="text-4xl font-black text-on-surface">{stat.value}</span>
                        <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-primary" /> 本周活跃用户趋势
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockActivityData}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6b38d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6b38d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                          <Area type="monotone" dataKey="users" stroke="#6b38d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Award size={20} className="text-secondary" /> 新增视频上传量
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockActivityData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                          <Bar dataKey="videos" fill="#ffb800" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold">AI 交互记录</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">时间</th>
                        <th className="px-6 py-4">用户 ID</th>
                        <th className="px-6 py-4">角色</th>
                        <th className="px-6 py-4">内容</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {chatLogs.map((chat, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(chat.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-xs">{chat.user_id.slice(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${chat.role === 'ai' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                              {chat.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-md truncate" title={chat.content}>{chat.content}</td>
                        </tr>
                      ))}
                      {chatLogs.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-slate-400">暂无互动记录</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold">练习记录</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">时间</th>
                        <th className="px-6 py-4">用户 ID</th>
                        <th className="px-6 py-4">标题</th>
                        <th className="px-6 py-4">类型</th>
                        <th className="px-6 py-4">得分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {practiceLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-xs">{log.user_id.slice(0, 8)}...</td>
                          <td className="px-6 py-4 font-bold">{log.title}</td>
                          <td className="px-6 py-4">{log.type}</td>
                          <td className="px-6 py-4 text-emerald-500 font-bold">{log.score}</td>
                        </tr>
                      ))}
                      {practiceLogs.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-400">暂无练习记录</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 min-h-[500px] flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">平台共计发现 {uniqueUsers.length} 位独立交互用户</p>
                  <p className="text-xs mt-2">（详细权限控制单单请至 Supabase Authentication 控制台查看）</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
