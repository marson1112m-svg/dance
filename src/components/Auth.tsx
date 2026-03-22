import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('注册成功！请直接使用该账号登录。');
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage(error.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 z-[200] overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-container/50 rounded-full blur-[100px] opacity-60"></div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl relative z-10 border border-white/50">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-12">
            <Zap size={40} className="fill-white" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">StreetBeat AI</h1>
          <p className="text-sm font-medium text-slate-400">登入你的专属舞动空间</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={20} className="text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="邮箱账号"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 text-on-surface text-sm rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary block pl-12 p-4 transition-all"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="密码 (不少于6位)"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 text-on-surface text-sm rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary block pl-12 p-4 transition-all"
              />
            </div>
          </div>

          {message && (
            <p className={`text-xs font-bold text-center py-2 rounded-xl ${message.includes('成功') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-2xl px-5 py-4 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
            className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-all"
          >
            {isLogin ? '没有账号？立即注册 ✨' : '已有账号？直接登录！'}
          </button>
        </div>
      </div>
    </div>
  );
}
