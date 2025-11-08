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
console.log("🔍 Testing OpenAI DALL-E 3 API connection...\n");

const testPrompt =
  "A mystical forest at dawn, fantasy illustration, cinematic lighting";

async function testDallE() {
  try {
    console.log("📡 Sending request to OpenAI...");
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: testPrompt,
          n: 1,
          size: "256x256",
          quality: "standard",
          response_format: "b64_json",
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

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].b64_json) {
      console.log("✅ SUCCESS! Image generated successfully");
      console.log(
        "📊 Image size (base64):",
        data.data[0].b64_json.length,
        "characters"
      );
      console.log(
        "💡 Approximate size:",
        Math.round(data.data[0].b64_json.length / 1024),
        "KB"
      );
      console.log("\n🎉 Your OpenAI API key is working correctly!");
      console.log(
        "🚀 You can now use the image generation feature in Zork Argento"
      );
    } else {
      console.error("❌ No image data received");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    console.error("\n🔧 Check your internet connection and try again");
    process.exit(1);
  }
}

testDallE();
