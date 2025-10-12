import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  // Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Adventure, AdventureDocument } from '../types';

const ADVENTURES_COLLECTION = 'adventures';

export class AdventureService {
  static async saveAdventure(adventure: Adventure, userId: string): Promise<string> {
    try {
      const adventureData: Record<string, any> = {
        ...adventure,
        userId,
        updatedAt: new Date().toISOString()
      };
      
      const cleanedData = Object.keys(adventureData).reduce((acc, key) => {
        if (adventureData[key] !== undefined) {
          acc[key] = adventureData[key];
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('💾 [saveAdventure] Creating new adventure in Firebase:', {
        userId,
        title: adventure.title,
        stepsCount: adventure.steps?.length,
        hasConversationId: !!adventure.conversationId,
        hasThreadId: !!adventure.threadId
      });

      const docRef = await addDoc(collection(db, 'users', userId, ADVENTURES_COLLECTION), cleanedData);
      
      console.log('✅ [saveAdventure] Adventure created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving adventure:', error);
      throw new Error('Failed to save adventure');
    }
  }

  static async updateAdventure(adventureId: string, adventure: Partial<Adventure>, userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, ADVENTURES_COLLECTION, adventureId);
      const updateData: Record<string, any> = {
        ...adventure,
        updatedAt: new Date().toISOString()
      };
      
      const cleanedData = Object.keys(updateData).reduce((acc, key) => {
        if (updateData[key] !== undefined) {
          acc[key] = updateData[key];
        }
        return acc;
      }, {} as Record<string, any>);
      
      console.log('📤 [updateAdventure] Sending to Firebase:', {
        adventureId,
        fields: Object.keys(cleanedData),
        data: cleanedData
      });
      
      await updateDoc(docRef, cleanedData);
    } catch (error) {
      console.error('Error updating adventure:', error);
      throw new Error('Failed to update adventure');
    }
  }

  static async getAdventure(adventureId: string, userId: string): Promise<AdventureDocument | null> {
    try {
      const docRef = doc(db, 'users', userId, ADVENTURES_COLLECTION, adventureId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as AdventureDocument;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting adventure:', error);
      throw new Error('Failed to get adventure');
    }
  }

  static async getUserAdventures(userId: string, limitCount: number = 10): Promise<AdventureDocument[]> {
    try {
      const subcollectionQuery = query(
        collection(db, 'users', userId, ADVENTURES_COLLECTION),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );

      const subcollectionSnapshot = await getDocs(subcollectionQuery);
      const adventuresFromSubcollection: AdventureDocument[] = [];

      subcollectionSnapshot.forEach((doc) => {
        adventuresFromSubcollection.push({
          id: doc.id,
          ...doc.data()
        } as AdventureDocument);
      });

      if (adventuresFromSubcollection.length > 0) {
        return adventuresFromSubcollection;
      }

      const rootQuery = query(
        collection(db, ADVENTURES_COLLECTION),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );

      const rootSnapshot = await getDocs(rootQuery);
      const adventuresFromRoot: AdventureDocument[] = [];

      rootSnapshot.forEach((doc) => {
        adventuresFromRoot.push({
          id: doc.id,
          ...doc.data()
        } as AdventureDocument);
      });

      return adventuresFromRoot;
    } catch (error) {
      console.error('Error getting user adventures:', error);
      throw new Error('Failed to get user adventures');
    }
  }

  static async deleteAdventure(adventureId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, ADVENTURES_COLLECTION, adventureId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting adventure:', error);
      throw new Error('Failed to delete adventure');
    }
  }

  static async saveAdventureStep(
    adventureId: string, 
    adventure: Adventure, 
    userId: string,
    conversationId?: string | null,
    threadId?: string | null
  ): Promise<void> {
    try {
      const updatePayload: Partial<Adventure> = {
        steps: adventure.steps,
        state: adventure.state
      };
      
      const finalConversationId = conversationId || adventure.conversationId;
      const finalThreadId = threadId || adventure.threadId;
      
      if (finalConversationId) {
        updatePayload.conversationId = finalConversationId;
      }
      
      if (finalThreadId) {
        updatePayload.threadId = finalThreadId;
      }
      
      console.log('💾 [saveAdventureStep] Preparing update:', {
        adventureId,
        stepsCount: adventure.steps.length,
        hasConversationId: !!finalConversationId,
        hasThreadId: !!finalThreadId,
        conversationId: finalConversationId,
        threadId: finalThreadId
      });
      
      await this.updateAdventure(adventureId, updatePayload, userId);
    } catch (error) {
      console.error('Error saving adventure step:', error);
      throw new Error('Failed to save adventure step');
    }
  }
}
