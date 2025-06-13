import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

export async function generateText(prompt: string, model: string = "gpt-4o", temperature: number = 0.8): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });

  return response.choices[0].message.content || "";
}

export async function generateImage(prompt: string, size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024", quality: "standard" | "hd" = "hd"): Promise<{ url: string }> {
  const enhancedPrompt = `${prompt}, ultra high quality, 8K resolution, professional photography, crisp details, sharp focus, vibrant colors, masterpiece quality`;
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size,
    quality,
    style: "vivid",
  });

  return { url: response.data?.[0]?.url || "" };
}

export async function analyzeImage(base64Image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image in detail and describe its key elements, context, and any notable aspects."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<{ text: string }> {
  const file = new File([audioBuffer], "audio.wav", { type: "audio/wav" });
  
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return { text: transcription.text };
}

export async function generateSpeech(text: string, voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice,
    input: text,
  });

  return Buffer.from(await response.arrayBuffer());
}
