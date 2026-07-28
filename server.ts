import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function cleanJsonResponse(rawText: string): string {
  if (!rawText) return "";
  let trimmed = rawText.trim();
  trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return trimmed.trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      const { query, provider, googleKey, openRouterKey, groqKey } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const systemPrompt = `You are an elite, hyper-accurate Islamic scholar AI. 
Rule 1: Cross-verify everything across 3 major sources (e.g., Ibn Baz, Dorar Sunniyya, Al-Saadi) before answering. 
Rule 2: State the exact sources in your answer. 
Rule 3: Start your answer with a direct explanation, then give a highly relatable 'Real-Life Example' (مثال من الواقع), then provide the detailed Tafseer/Hadith ruling. 
Rule 4: Return the response strictly as a JSON object without markdown code blocks.
Rule 5: ALL your output MUST be entirely in Arabic language.`;

      let lastError = null;

      // 1. Try Google Gemini if provider is "google" or "auto"/undefined
      if (!provider || provider === "google" || provider === "auto") {
        const gKey = googleKey || process.env.GEMINI_API_KEY;
        if (gKey) {
          const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
          for (const modelName of geminiModels) {
            try {
              const ai = new GoogleGenAI({ apiKey: gKey.trim() });
              const response = await ai.models.generateContent({
                model: modelName,
                contents: query,
                config: {
                  systemInstruction: systemPrompt,
                  responseMimeType: "application/json",
                }
              });
              if (response.text) {
                const cleaned = cleanJsonResponse(response.text);
                return res.status(200).json({ text: cleaned, provider: `Gemini` });
              }
            } catch (err: any) {
              console.error(`Google API (${modelName}) failed:`, err.message);
              lastError = `Google API (${modelName}) Error: ` + err.message;
            }
          }
          if (provider === "google") {
            return res.status(500).json({ error: lastError || "Google Gemini request failed." });
          }
        } else {
          lastError = "No Google API key provided.";
          if (provider === "google") {
            return res.status(500).json({ error: lastError });
          }
        }
      }

      // 2. Try Groq if provider is "groq" or "auto"/undefined
      if (!provider || provider === "groq" || provider === "auto") {
        const keyToUse = groqKey || process.env.GROQ_API_KEY;
        if (keyToUse) {
          const groqModels = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
          for (const modelName of groqModels) {
            try {
              const fetchRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${keyToUse.trim()}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  model: modelName,
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                  ],
                  response_format: { type: "json_object" }
                }),
                signal: AbortSignal.timeout(12000)
              });
              const data = await fetchRes.json();
              if (fetchRes.ok && data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
                const cleaned = cleanJsonResponse(data.choices[0].message.content);
                return res.status(200).json({ text: cleaned, provider: `Groq` });
              } else {
                console.error(`Groq API (${modelName}) failed:`, data.error || data);
                lastError = `Groq API (${modelName}) Error: ` + (data.error?.message || "Unknown error");
              }
            } catch (err: any) {
              console.error(`Groq (${modelName}) fetch failed:`, err.message);
              lastError = `Groq Request Failed (${modelName}): ` + err.message;
            }
          }
          if (provider === "groq") {
            return res.status(500).json({ error: lastError || "Groq request failed." });
          }
        } else if (provider === "groq") {
          return res.status(500).json({ error: "No Groq API key configured." });
        }
      }

      // 3. Try OpenRouter if provider is "openrouter" or "auto"/undefined
      if (!provider || provider === "openrouter" || provider === "auto") {
        const keyToUse = openRouterKey || process.env.OPENROUTER_API_KEY;
        if (keyToUse) {
          const openRouterModels = ["google/gemini-2.5-flash", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-chat", "mistralai/mistral-7b-instruct"];
          for (const modelName of openRouterModels) {
            try {
              const fetchRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${keyToUse.trim()}`,
                  "Content-Type": "application/json",
                  "HTTP-Referer": "https://ai.studio",
                  "X-Title": "Tafsir App"
                },
                body: JSON.stringify({
                  model: modelName,
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                  ],
                  response_format: { type: "json_object" }
                }),
                signal: AbortSignal.timeout(12000)
              });
              const data = await fetchRes.json();
              if (fetchRes.ok && data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
                const cleaned = cleanJsonResponse(data.choices[0].message.content);
                return res.status(200).json({ text: cleaned, provider: `OpenRouter` });
              } else {
                console.error(`OpenRouter API (${modelName}) failed:`, data.error || data);
                lastError = `OpenRouter API (${modelName}) Error: ` + (data.error?.message || "Unknown error");
              }
            } catch (err: any) {
              console.error(`OpenRouter (${modelName}) fetch failed:`, err.message);
              lastError = `OpenRouter Request Failed (${modelName}): ` + err.message;
            }
          }
          if (provider === "openrouter") {
            return res.status(500).json({ error: lastError || "OpenRouter request failed." });
          }
        } else if (provider === "openrouter") {
          return res.status(500).json({ error: "No OpenRouter API key configured." });
        }
      }

      // If we got here, all attempts failed
      return res.status(500).json({ 
        error: "فشلت محاولة الاتصال بخادم الذكاء الاصطناعي.",
        details: lastError
      });

    } catch (error: any) {
      console.error("Generate Route Error:", error);
      res.status(500).json({ error: "حدث خطأ غير متوقع." });
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
