// src/hooks/useContests.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAllContests } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useContests = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // Get all available platforms
  const allPlatforms = [...new Set(allItems.map(item => item.platform))];
  
  // Filter platforms based on active tab
  const availablePlatforms = allPlatforms.filter(platform => {
    return allItems.some(item => 
      item.platform === platform && 
      (activeTab === 'contests' ? item.type === 'contest' : item.type === 'hackathon')
    );
  });

  // Fetch all contests and hackathons
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get cached data first
      const cachedData = await AsyncStorage.getItem('contestsData');
      const cachedTime = await AsyncStorage.getItem('contestsDataTimestamp');
      
      // If we have cached data that's less than 15 minutes old, use it
      if (cachedData && cachedTime) {
        const timestamp = parseInt(cachedTime, 10);
        const now = Date.now();
        
        if (now - timestamp < 15 * 60 * 1000) { // 15 minutes
          const parsedData = JSON.parse(cachedData);
          setAllItems(parsedData);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise fetch fresh data
      const data = await fetchAllContests();
      
      // Cache the data
      await AsyncStorage.setItem('contestsData', JSON.stringify(data));
      await AsyncStorage.setItem('contestsDataTimestamp', Date.now().toString());
      
      setAllItems(data);
      
      // Set initial platforms if none selected
      if (selectedPlatforms.length === 0) {
        const platforms = [...new Set(data.map(item => item.platform))];
        setSelectedPlatforms(platforms);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to fetch contests. Please try again.');
      setLoading(false);
    }
  }, [selectedPlatforms]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    if (allItems.length > 0) {
      const filtered = allItems.filter(item => 
        (activeTab === 'contests' ? item.type === 'contest' : item.type === 'hackathon') && 
        selectedPlatforms.includes(item.platform)
      );
      
      // Sort by start time
      filtered.sort((a, b) => a.startTime - b.startTime);
      
      setFilteredItems(filtered);
    }
  }, [allItems, activeTab, selectedPlatforms]);

  // Toggle a platform filter
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        // Remove platform if already selected
        return prev.filter(p => p !== platform);
      } else {
        // Add platform if not selected
        return [...prev, platform];
      }
    });
  };

  // Select all platforms
  const selectAllPlatforms = () => {
    setSelectedPlatforms(availablePlatforms);
  };

  // Clear all platform selections
  const clearPlatformSelection = () => {
    setSelectedPlatforms([]);
  };

  return {
    allItems,
    filteredItems,
    loading,
    error,
    activeTab,
    selectedPlatforms,
    availablePlatforms,
    setActiveTab,
    togglePlatform,
    selectAllPlatforms,
    clearPlatformSelection,
    refreshData: fetchData,
  };
};

export default useContests;