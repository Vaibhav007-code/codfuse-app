// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchAllContests } from '../api';
import ContestCard from '../components/ContestCard';
import PlatformFilter from '../components/PlatformFilter';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  
  // Fetch all contests and hackathons
  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAllContests();
      setAllItems(data);
      
      // Extract unique platforms
      const uniquePlatforms = [...new Set(data.map(item => item.platform))];
      setPlatforms(uniquePlatforms);
      
      // By default, select all platforms
      if (selectedPlatforms.length === 0) {
        setSelectedPlatforms(uniquePlatforms);
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to fetch contests and hackathons. Please try again.');
    }
  }, [selectedPlatforms]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Filter data when tab or selected platforms change
  useEffect(() => {
    if (allItems.length > 0) {
      const filtered = allItems.filter(item => 
        (activeTab === 'contests' ? item.type === 'contest' : item.type === 'hackathon') && 
        selectedPlatforms.includes(item.platform)
      );
      setFilteredItems(filtered);
    }
  }, [allItems, activeTab, selectedPlatforms]);
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);
  
  // Toggle platform selection
  const handleTogglePlatform = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };
  
  // Set reminder for a contest/hackathon
  const handleSetReminder = async (item) => {
    try {
      // Show reminder options dialog
      Alert.alert(
        'Set Reminder',
        `When would you like to be reminded about "${item.name}"?`,
        [
          {
            text: '10 minutes before',
            onPress: () => scheduleReminder(item, 10)
          },
          {
            text: '30 minutes before',
            onPress: () => scheduleReminder(item, 30)
          },
          {
            text: '1 hour before',
            onPress: () => scheduleReminder(item, 60)
          },
          {
            text: '1 day before',
            onPress: () => scheduleReminder(item, 24 * 60)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not set reminder. Please try again.');
    }
  };
  
  // Schedule notification
  const scheduleReminder = async (item, minutesBefore) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${item.platform} - ${item.name}`,
          body: `The ${item.type} is starting in ${minutesBefore} minute${minutesBefore > 1 ? 's' : ''}!`,
          data: { url: item.url },
        },
        trigger: {
          date: new Date(item.startTime - minutesBefore * 60 * 1000),
        },
      });
      
      Alert.alert(
        'Reminder Set',
        `You'll be reminded ${minutesBefore} minute${minutesBefore > 1 ? 's' : ''} before "${item.name}" starts.`
      );
      
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };
  
  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={60} color="#ccc" />
      <Text style={styles.emptyText}>
        {loading 
          ? 'Loading items...' 
          : activeTab === 'contests' 
            ? 'No contests found' 
            : 'No hackathons found'
        }
      </Text>
      <Text style={styles.emptySubText}>
        {!loading && 'Pull down to refresh or try different filters'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Code Events</Text>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contests' && styles.activeTab]}
          onPress={() => setActiveTab('contests')}
        >
          <Text style={[styles.tabText, activeTab === 'contests' && styles.activeTabText]}>
            Contests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hackathons' && styles.activeTab]}
          onPress={() => setActiveTab('hackathons')}
        >
          <Text style={[styles.tabText, activeTab === 'hackathons' && styles.activeTabText]}>
            Hackathons
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Section */}
      {!loading && (
        <PlatformFilter
          platforms={platforms.filter(platform => {
            const itemsOfType = allItems.filter(item => 
              (activeTab === 'contests' ? item.type === 'contest' : item.type === 'hackathon')
            );
            return itemsOfType.some(item => item.platform === platform);
          })}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
        />
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B5FFF" />
        </View>
      )}
      
      {/* Contest/Hackathon List */}
      {!loading && (
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <ContestCard contest={item} onSetReminder={handleSetReminder} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#5B5FFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#5B5FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
});

export default HomeScreen;