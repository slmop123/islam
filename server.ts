import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/gemini", async (req, res) => {
    try {
      const { query, userApiKey } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Use the user's API key if provided, otherwise fallback to the server's key
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(401).json({ error: "No API key provided. Please provide one or configure the server environment." });
      }

      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      
      const systemPrompt = `You are an elite, hyper-accurate Islamic scholar AI. 
Rule 1: Cross-verify everything across 3 major sources (e.g., Ibn Baz, Dorar Sunniyya, Al-Saadi) before answering. 
Rule 2: State the exact sources in your answer. 
Rule 3: Start your answer with a direct explanation, then give a highly relatable 'Real-Life Example' (مثال من الواقع), then provide the detailed Tafseer/Hadith ruling. 
Rule 4: Return the response strictly as a JSON object with keys: { "explanation": "...", "real_life_example": "...", "sources": "...", "quiz_question": "...", "quiz_answer": "..." }
Rule 5: ALL your output MUST be entirely in Arabic language.
Respond purely in JSON format without markdown blocks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        // Just forward the raw JSON response
        res.status(200).json({ text: response.text });
      } else {
        res.status(500).json({ error: "No response generated." });
      }

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      // Determine if it's a 403 or other known error
      let status = 500;
      let message = error.message || "حدث خطأ أثناء الاتصال بالمحرك.";
      
      if (error.status === 403 || message.includes("PERMISSION_DENIED") || message.includes("403")) {
        status = 403;
        message = "مفتاح API غير صالح أو لا يملك صلاحية. تأكد من صحة المفتاح.";
      }

      res.status(status).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
