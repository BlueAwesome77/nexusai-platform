import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateText, generateImage, generateSpeech } from "./ai-services/openai";
import { generateImageWithStability } from "./ai-services/stability";
import { generateTextWithGrok } from "./ai-services/grok";
import { generateSpeechElevenLabs, getAvailableVoices } from "./ai-services/elevenlabs";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        xai: !!process.env.XAI_API_KEY,
        stability: !!process.env.STABILITY_API_KEY,
        elevenlabs: !!process.env. creating the essential files. Let me create a simplified routes file that's easier to manage in the GitHub upload process:

**Content for** `server/routes.ts`:

```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateText, generateImage, generateSpeech } from "./ai-services/openai";
import { generateImageWithStability } from "./ai-services/stability";
import { generateTextWithGrok } from "./ai-services/grok";
import { generateSpeechElevenLabs, getAvailableVoices } from "./ai-services/elevenlabs";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        xai: !!process.env.XAI_API_KEY,
        stability: !!process.env.STABILITY_API_KEY,
        elevenlabs: !!process.env.ELEVENLABS_API_KEY
      }
    });
  });
  
  // Text generation
  app.post("/api/generate/text", async (req, res) => {
    try {
      const { prompt, model, temperature } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const generation = await storage.createGeneration({
        type: "text",
        prompt,
        model: model || "gpt-4o",
        parameters: { temperature: temperature || 0.8 },
        status: "processing",
        userId: null,
        result: null,
      });

      let result;
      
      // Try Grok first if available
      if (process.env.XAI_API_KEY) {
        try {
          result = await generateTextWithGrok(prompt, model || "grok-2-1212", temperature);
        } catch (error) {
          console.log("Grok failed, trying OpenAI...");
        }
      }

      // Fallback to OpenAI
      if (!result && process.env.OPENAI_API_KEY) {
        try {
          result = await generateText(prompt, model || "gpt-4o", temperature);
        } catch (error) {
          console.log("OpenAI failed");
        }
      }

      if (!result) {
        throw new Error("All AI services failed");
      }

      await storage.updateGeneration(generation.id, {
        status: "completed",
        result: { text: result }
      });

      res.json({
        id: generation.id,
        status: "completed",
        result: { text: result }
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image generation
  app.post("/api/generate/image", async (req, res) => {
    try {
      const { prompt, width = 1024, height = 1024 } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const generation = await storage.createGeneration({
        type: "image",
        prompt,
        model: "stable-diffusion-xl",
        parameters: { width, height },
        status: "processing",
        userId: null,
        result: null,
      });

      let result;

      // Try Stability AI first
      if (process.env.STABILITY_API_KEY) {
        try {
          result = await generateImageWithStability(prompt, width, height);
        } catch (error) {
          console.log("Stability AI failed, trying OpenAI...");
        }
      }

      // Fallback to OpenAI
      if (!result && process.env.OPENAI_API_KEY) {
        try {
          result = await generateImage(prompt, "1024x1024", "hd");
        } catch (error) {
          console.log("OpenAI failed");
        }
      }

      if (!result) {
        throw new Error("All image generation services failed");
      }

      await storage.updateGeneration(generation.id, {
        status: "completed",
        result
      });

      res.json({
        id: generation.id,
        status: "completed",
        result
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Speech generation
  app.post("/api/generate/speech", async (req, res) => {
    try {
      const { text, voice = "alloy" } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const generation = await storage.createGeneration({
        type: "speech",
        prompt: text,
        model: "elevenlabs",
        parameters: { voice },
        status: "processing",
        userId: null,
        result: null,
      });

      let audioBuffer;

      // Try ElevenLabs first
      if (process.env.ELEVENLABS_API_KEY) {
        try {
          audioBuffer = await generateSpeechElevenLabs(text, voice);
        } catch (error) {
          console.log("ElevenLabs failed, trying OpenAI...");
        }
      }

      // Fallback to OpenAI
      if (!audioBuffer && process.env.OPENAI_API_KEY) {
        try {
          audioBuffer = await generateSpeech(text, voice as any);
        } catch (error) {
          console.log("OpenAI TTS failed");
        }
      }

      if (!audioBuffer) {
        throw new Error("All speech generation services failed");
      }

      // Save audio file
      const filename = `speech_${generation.id}.mp3`;
      const filepath = path.join("uploads", filename);
      
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads", { recursive: true });
      }
      
      fs.writeFileSync(filepath, audioBuffer);

      await storage.updateGeneration(generation.id, {
        status: "completed",
        result: { url: `/uploads/${filename}` }
      });

      res.json({
        id: generation.id,
        status: "completed",
        result: { url: `/uploads/${filename}` }
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get available voices
  app.get("/api/voices", async (req, res) => {
    try {
      if (process.env.ELEVENLABS_API_KEY) {
        const voices = await getAvailableVoices();
        res.json(voices);
      } else {
        // Return default OpenAI voices
        res.json([
          { voice_id: "alloy", name: "Alloy", category: "OpenAI" },
          { voice_id: "echo", name: "Echo", category: "OpenAI" },
          { voice_id: "fable", name: "Fable", category: "OpenAI" },
          { voice_id: "onyx", name: "Onyx", category: "OpenAI" },
          { voice_id: "nova", name: "Nova", category: "OpenAI" },
          { voice_id: "shimmer", name: "Shimmer", category: "OpenAI" }
        ]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Content-Type", "audio/mpeg");
    next();
  });
  app.use("/uploads", require("express").static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
