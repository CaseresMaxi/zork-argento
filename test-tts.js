import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  try {
    const envLocalPath = join(__dirname, ".env.local");
    const envContent = readFileSync(envLocalPath, "utf-8");
    const match = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
    if (match) {
      OPENAI_API_KEY = match[1].trim();
    }
  } catch (err) {
    try {
      const envPath = join(__dirname, ".env");
      const envContent = readFileSync(envPath, "utf-8");
      const match = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
      if (match) {
        OPENAI_API_KEY = match[1].trim();
      }
    } catch (err2) {}
  }
}

if (!OPENAI_API_KEY) {
  console.error(
    "❌ Error: VITE_OPENAI_API_KEY not found in environment variables"
  );
  console.log(
    "💡 Make sure you have a .env.local or .env file with VITE_OPENAI_API_KEY=your-key-here"
  );
  process.exit(1);
}

console.log("✅ API Key found:", OPENAI_API_KEY.substring(0, 10) + "...");
console.log("🔍 Testing OpenAI TTS API connection...\n");

const testText = "Hola, esto es una prueba de texto a voz en español.";

async function testTTS() {
  try {
    console.log("📡 Sending request to OpenAI TTS...");
    const response = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: testText,
          voice: "nova",
          response_format: "mp3",
          speed: 1.0
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ API Error:", errorData);
      console.error("\n🔧 Common issues:");
      console.error("   - Invalid API key");
      console.error("   - Insufficient credits");
      console.error("   - Rate limit exceeded");
      process.exit(1);
    }

    const audioBlob = await response.blob();
    console.log("✅ SUCCESS! Audio generated successfully");
    console.log("📊 Audio size:", audioBlob.size, "bytes");
    console.log("💡 Approximate size:", Math.round(audioBlob.size / 1024), "KB");
    console.log("\n🎉 Your OpenAI TTS API key is working correctly!");
    console.log("🚀 You can now use the audio generation feature in Zork Argento");

  } catch (error) {
    console.error("❌ Connection error:", error.message);
    console.error("\n🔧 Check your internet connection and try again");
    process.exit(1);
  }
}

testTTS();
