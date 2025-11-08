# OpenAI DALL-E Configuration Guide

This project uses OpenAI's DALL-E 3 API to generate ambient images for each chat response.

## Setup Instructions

### 1. Get your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

### 2. Add to Environment Variables

Add the following variable to your `.env` file (create it if it doesn't exist):

```
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Complete .env File Template

Your `.env` file should contain all these variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here

# Zork API
ZORK_API_KEY=your_zork_api_key_here

# OpenAI API for image generation
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## How it Works

1. Each time the chat receives a response, the system automatically generates an ambient image
2. The image is based on the `imagePrompt` field in the response or extracted from the narrative
3. Images are generated using DALL-E 3 with the following settings:
   - Model: `dall-e-3`
   - Size: `256x256`
   - Quality: `standard`
   - Response format: `b64_json` (base64 encoded)
4. The base64 image is stored directly in Firebase Firestore as part of the adventure step
5. Images are displayed in the chat interface above the narrative text

## Cost Considerations

- DALL-E 3 costs approximately $0.04 per image for standard quality (1024x1024)
- Each chat response will generate one image
- Monitor your OpenAI usage in the [OpenAI Dashboard](https://platform.openai.com/usage)

## Troubleshooting

If images are not generating:

1. Check that `VITE_OPENAI_API_KEY` is correctly set in your `.env` file
2. Verify your OpenAI account has credits available
3. Check the browser console for error messages
4. Look for these console messages:
   - `🎨 Generating image for step...` - Image generation started
   - `✅ Image generated successfully` - Image generated successfully
   - `⚠️ Image generation failed or returned null` - Generation failed

## Disabling Image Generation

If you want to disable image generation temporarily:

1. Remove or comment out the `VITE_OPENAI_API_KEY` from your `.env` file
2. The chat will continue to work normally, just without images



