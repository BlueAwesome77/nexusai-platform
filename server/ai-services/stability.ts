interface StabilityResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

export async function generateImageWithStability(
  prompt: string, 
  width: number = 1024, 
  height: number = 1024
): Promise<{ url: string }> {
  const apiKey = process.env.STABILITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("Stability AI API key not configured");
  }

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        width,
        height,
        steps: 30,
        samples: 1,
        style_preset: "enhance"
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability AI API error: ${response.status} ${errorText}`);
  }

  const data: StabilityResponse = await response.json();
  
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error("No image generated from Stability AI");
  }

  const base64Image = data.artifacts[0].base64;
  const dataUrl = `data:image/png;base64,${base64Image}`;
  
  return { url: dataUrl };
}
