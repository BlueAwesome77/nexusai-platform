interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface ElevenLabsResponse {
  audio: ArrayBuffer;
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function generateSpeechElevenLabs(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<Buffer> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.5,
        use_speaker_boost: true,
      },
      output_format: "mp3_highest_quality",
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voices || [];
}

export async function cloneVoice(name: string, audioFiles: Buffer[]): Promise<string> {
  const formData = new FormData();
  formData.append("name", name);
  
  audioFiles.forEach((buffer, index) => {
    const blob = new Blob([buffer], { type: "audio/wav" });
    formData.append("files", blob, `sample${index}.wav`);
  });

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs voice cloning error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voice_id;
}
