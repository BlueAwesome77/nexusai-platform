import OpenAI from "openai";

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || ""
});

export async function generateTextWithGrok(prompt: string, model: string = "grok-2-1212", temperature: number = 0.8): Promise<string> {
  const response = await grok.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });

  return response.choices[0].message.content || "";
}

export async function analyzeImageWithGrok(base64Image: string): Promise<string> {
  const response = await grok.chat.completions.create({
    model: "grok-2-vision-1212",
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
