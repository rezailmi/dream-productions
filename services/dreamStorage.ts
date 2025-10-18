import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream } from '../constants/Types';

const DREAMS_STORAGE_KEY = '@dreams';
const WHOOP_TOKEN_KEY = '@whoop_access_token';

export class DreamStorage {
  // Dreams
  async saveDream(dream: Dream): Promise<void> {
    try {
      const dreams = await this.getDreams();
      const existingIndex = dreams.findIndex((d) => d.id === dream.id);

      if (existingIndex >= 0) {
        dreams[existingIndex] = dream;
      } else {
        dreams.unshift(dream); // Add to beginning
      }

      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));
    } catch (error) {
      console.error('Error saving dream:', error);
      throw error;
    }
  }

  async getDreams(): Promise<Dream[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);
      return dreamsJson ? JSON.parse(dreamsJson) : [];
    } catch (error) {
      console.error('Error loading dreams:', error);
      return [];
    }
  }

  async getDreamById(id: string): Promise<Dream | null> {
    try {
      const dreams = await this.getDreams();
      return dreams.find((d) => d.id === id) || null;
    } catch (error) {
      console.error('Error finding dream:', error);
      return null;
    }
  }

  async deleteDream(id: string): Promise<void> {
    try {
      const dreams = await this.getDreams();
      const filtered = dreams.filter((d) => d.id !== id);
      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting dream:', error);
      throw error;
    }
  }

  async clearAllDreams(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DREAMS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing dreams:', error);
      throw error;
    }
  }

  // WHOOP Token
  async saveWhoopToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(WHOOP_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving WHOOP token:', error);
      throw error;
    }
  }

  async getWhoopToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(WHOOP_TOKEN_KEY);
    } catch (error) {
      console.error('Error loading WHOOP token:', error);
      return null;
    }
  }

  async clearWhoopToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WHOOP_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing WHOOP token:', error);
      throw error;
    }
  }

  // Clear all app data
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(DREAMS_STORAGE_KEY),
        AsyncStorage.removeItem(WHOOP_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export default new DreamStorage();
