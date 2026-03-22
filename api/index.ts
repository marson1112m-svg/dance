import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Default user for mock interactions, until full auth is implemented.
const DEFAULT_USER_ID = 'user_123'; 

// Practice Logs Endpoints
app.get('/api/practice-logs', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.json([]);

  const { data, error } = await supabase.from('practice_logs')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
    
  // Instead of failing completely when DB isn't configured, send an empty array or mock if error
  if (error) {
    console.error('Supabase fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data || []);
});

app.post('/api/practice-logs', async (req, res) => {
  const { user_id = DEFAULT_USER_ID, video_url, thumbnail_url, title, score, type, duration_seconds } = req.body;
  const { data, error } = await supabase.from('practice_logs').insert([{
    user_id, video_url, thumbnail_url, title, score, type, duration_seconds, created_at: new Date().toISOString()
  }]).select();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data && data.length > 0 ? data[0] : null);
});

// Chat Endpoints
app.get('/api/chat', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.json([]);
  
  const { data, error } = await supabase.from('chat_messages')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/chat', async (req, res) => {
  const { user_id = DEFAULT_USER_ID, message } = req.body;
  
  // 1. Save user message to Supabase
  await supabase.from('chat_messages').insert([{ 
    user_id, role: 'user', content: message, created_at: new Date().toISOString() 
  }]);

  // 2. Call Gemini API
  let aiResponse = "对不起，我暂时无法回答。";
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Build a minimal prompt with context for the AI coach
      const prompt = `你是Kiri，一个专业的AI街舞私教。用户问你: "${message}"。请给出专业的街舞动作建议，保持热情和鼓励的语气，简明扼要。`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      aiResponse = response.text || "我不太明白你的意思，请再说一遍。";
    } catch (err) {
      console.error("Gemini Error:", err);
      aiResponse = "抱歉，调用 AI 模型失败，请检查后端的 API 密钥或网络。";
    }
  } else {
    console.warn("GEMINI_API_KEY is not set in environment.");
    aiResponse = "系统未配置 GEMINI_API_KEY。";
  }

  // 3. Save AI response to Supabase
  const { data, error } = await supabase.from('chat_messages').insert([{ 
    user_id, role: 'ai', content: aiResponse, created_at: new Date().toISOString() 
  }]).select();
  
  if (error) {
    console.error('Supabase insert error in /api/chat:', error.message);
    // Ignore DB error to not break the chat experience
    return res.json({ role: 'ai', content: aiResponse, error: error.message });
  }
  
  res.json(data && data.length > 0 ? data[0] : { role: 'ai', content: aiResponse });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
