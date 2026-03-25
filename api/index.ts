import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
      const prompt = `你是Kiri，一个专业且极其灵活的AI街舞私教。用户说: "${message}"。请根据用户的问题灵活回答，不仅限舞蹈教学（可以闲聊、心理辅导等）。保持热情鼓励的语气，并强制使用 Markdown 格式（如 **加粗关键点**、分行、分段落、列表）来让排版非常清晰易读。`;
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

// Dual Video Analysis Endpoint
app.post('/api/analyze-video', async (req, res) => {
  const { refUrl, userUrl } = req.body;
  if (!refUrl || !userUrl) return res.status(400).json({ error: 'Missing refUrl or userUrl' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "System missing GEMINI_API_KEY" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const tmpRefPath = path.join(os.tmpdir(), `ref-${Date.now()}.mp4`);
    const tmpUserPath = path.join(os.tmpdir(), `user-${Date.now()}.mp4`);

    const downloadFile = async (url: string, dest: string) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buffer));
    };

    console.log('Downloading reference video...');
    await downloadFile(refUrl, tmpRefPath);
    console.log('Downloading user video...');
    await downloadFile(userUrl, tmpUserPath);

    console.log('Uploading reference to Gemini...');
    const uploadedRef = await ai.files.upload({ file: tmpRefPath, config: { mimeType: 'video/mp4' } });
    console.log('Uploading user to Gemini...');
    const uploadedUser = await ai.files.upload({ file: tmpUserPath, config: { mimeType: 'video/mp4' } });

    console.log('Waiting momentarily for video processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const prompt = `你是一位专业且充满激情的舞蹈老师。我会为你提供两个舞蹈视频：
    1. 导师/参考视频（第一个文件）
    2. 用户练习视频（第二个文件）。
    
    请对比用户的动作与导师动作。找出用户动作中最重要的 3 个差异或错误，并以**充满鼓励和肯定的老师语气**给出精准的反馈。要求语言极富活力、积极向上，多使用鼓励性词汇。
    
    必须以有效的 JSON 格式返回，不要使用 markdown 代码块。
    格式必须严格遵循以下数组结构：
    [
      { "timestamp": 5.2, "issue": "捕捉到的问题简短标题", "suggestion": "以舞蹈老师身份给出的详细鼓励、纠错说明与训练建议" }
    ]
    其中 'timestamp' 是用户视频中发生错误的大致秒数。所有文本内容必须使用中文。`;

    console.log('Generating content via Gemini...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { fileData: { fileUri: uploadedRef.uri, mimeType: uploadedRef.mimeType } },
          { fileData: { fileUri: uploadedUser.uri, mimeType: uploadedUser.mimeType } },
          { text: prompt }
        ]
      }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const reportText = result.text;
    
    // Cleanup tmp files asynchronously
    Promise.resolve().then(async () => {
      try {
        fs.unlinkSync(tmpRefPath);
        fs.unlinkSync(tmpUserPath);
        await ai.files.delete({ name: uploadedRef.name });
        await ai.files.delete({ name: uploadedUser.name });
        console.log("Cleanup successful");
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    });

    res.json({ report: reportText });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
