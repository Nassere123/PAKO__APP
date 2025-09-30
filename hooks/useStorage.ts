import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseStorageResult<T> {
  value: T;
  setValue: (newValue: T) => Promise<void>;
  loading: boolean;
}

const useStorage = <T>(key: string, initialValue: T): UseStorageResult<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async (): Promise<void> => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item) as T);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveValue = async (newValue: T): Promise<void> => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return { value, setValue: saveValue, loading };
};

export default useStorage;
