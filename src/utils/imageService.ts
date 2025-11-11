import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = '/openai/v1/images/generations';

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured');
    return null;
  }

  try {
    const enhancedPrompt = `${prompt}. Fantasy illustration, cinematic, high detail, atmospheric, dramatic lighting, digital art style.`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DALL-E API error:', errorData);
      return null;
    }

    const data: ImageGenerationResponse = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].b64_json) {
      return data.data[0].b64_json;
    }

    console.error('No image data received from DALL-E');
    return null;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    return null;
  }
};

export const uploadImageToStorage = async (
  imageBase64: string,
  userId: string,
  adventureId: string,
  stepId: number
): Promise<string | null> => {
  try {
    const imagePath = `adventures/${userId}/${adventureId}/step-${stepId}-${Date.now()}.png`;
    const storageRef = ref(storage, imagePath);
    
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Image uploaded to Firebase Storage:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    return null;
  }
};

export const uploadCoverImageToStorage = async (
  imageBase64: string,
  userId: string,
  adventureId: string
): Promise<string | null> => {
  try {
    const imagePath = `adventures/${userId}/${adventureId}/cover-${Date.now()}.png`;
    const storageRef = ref(storage, imagePath);
    
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Cover image uploaded to Firebase Storage:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading cover image to Firebase Storage:', error);
    return null;
  }
};

export const generateImageForStep = async (
  narrative: string, 
  imagePrompt?: string
): Promise<string | null> => {
  const promptToUse = imagePrompt || extractSceneFromNarrative(narrative);
  return generateImageFromPrompt(promptToUse);
};

const extractSceneFromNarrative = (narrative: string): string => {
  const sentences = narrative.split('.').filter(s => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || narrative;
  
  return firstSentence.length > 200 
    ? firstSentence.substring(0, 200) 
    : firstSentence;
};


