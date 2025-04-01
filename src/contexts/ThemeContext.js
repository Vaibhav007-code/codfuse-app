// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const lightTheme = {
  background: '#f9f9f9',
  card: '#ffffff',
  text: '#333333',
  secondaryText: '#666666',
  accent: '#5B5FFF',
  border: '#eeeeee',
  statusBar: 'dark-content',
};

const darkTheme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  secondaryText: '#aaaaaa',
  accent: '#6c70ff',
  border: '#333333',
  statusBar: 'light-content',
};

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? darkTheme : lightTheme);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    
    loadTheme();
  }, []);

  // Update theme when themeMode or device theme changes
  useEffect(() => {
    let newTheme;
    
    if (themeMode === 'system') {
      newTheme = deviceTheme === 'dark' ? darkTheme : lightTheme;
    } else {
      newTheme = themeMode === 'dark' ? darkTheme : lightTheme;
    }
    
    setTheme(newTheme);
  }, [themeMode, deviceTheme]);

  // Save theme preference
  const setThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};