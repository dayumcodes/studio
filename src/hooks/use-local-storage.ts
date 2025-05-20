
"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      setIsInitialized(true); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes, not initialValue

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, isInitialized]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue(value);
    },
    [] 
  );

  return [storedValue, setValue, isInitialized];
}

export default useLocalStorage;
