import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);

  const unlockAchievement = async (achievementId) => {
    if (!achievements.includes(achievementId)) {
      const newAchievements = [...achievements, achievementId];
      setAchievements(newAchievements);
      await AsyncStorage.setItem('achievements', JSON.stringify(newAchievements));
    }
  };

  const loadAchievements = async () => {
    const stored = await AsyncStorage.getItem('achievements');
    if (stored) {
      setAchievements(JSON.parse(stored));
    }
  };

  return (
    <AchievementContext.Provider value={{ achievements, unlockAchievement, loadAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementContext);