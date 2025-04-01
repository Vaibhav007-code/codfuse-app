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
  Alert,
  Image,
  Dimensions,
  Animated,
  Platform,
  ImageBackground
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchAllContests } from '../api';
import ContestCard from '../components/ContestCard';
import PlatformFilter from '../components/PlatformFilter';
import * as Notifications from 'expo-notifications';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HomeScreen = () => {
  // Animation values
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // State variables
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Fetch all contests and hackathons with better error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      const data = await fetchAllContests();
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from API');
      }
      
      setAllItems(data);
      
      // Extract unique platforms
      const uniquePlatforms = [...new Set(data.map(item => item.platform))];
      setPlatforms(uniquePlatforms);
      
      // By default, select all platforms
      if (selectedPlatforms.length === 0) {
        setSelectedPlatforms(uniquePlatforms);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Track specific platform errors
      if (error.message && error.message.includes('LeetCode')) {
        setErrors(prev => ({ ...prev, leetcode: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Failed to fetch data. Please try again.' }));
      }
      
      // Still show data we might have from previous fetches
      if (allItems.length === 0) {
        // Only use sample data if we have nothing else
        const sampleData = getSampleData();
        setAllItems(sampleData);
        
        // Extract unique platforms from sample data
        const uniquePlatforms = [...new Set(sampleData.map(item => item.platform))];
        setPlatforms(uniquePlatforms);
        setSelectedPlatforms(uniquePlatforms);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPlatforms]);
  
  // Sample data function in case API fails
  const getSampleData = () => {
    return [
      {
        id: 'sample1',
        name: 'Weekly Contest 312',
        platform: 'LeetCode',
        type: 'contest',
        startTime: new Date(Date.now() + 86400000).getTime(), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 5400000).getTime(), // 1.5 hours after start
        url: 'https://leetcode.com/contest/',
        difficulty: 'Medium'
      },
      {
        id: 'sample2',
        name: 'April Long Challenge',
        platform: 'CodeChef',
        type: 'contest',
        startTime: new Date(Date.now() + 172800000).getTime(), // Day after tomorrow
        endTime: new Date(Date.now() + 172800000 + 864000000).getTime(), // 10 days after start
        url: 'https://www.codechef.com/contests',
        difficulty: 'Hard'
      },
      {
        id: 'sample3',
        name: 'Educational Round 145',
        platform: 'Codeforces',
        type: 'contest',
        startTime: new Date(Date.now() + 259200000).getTime(), // 3 days from now
        endTime: new Date(Date.now() + 259200000 + 7200000).getTime(), // 2 hours after start
        url: 'https://codeforces.com/contests',
        difficulty: 'Medium'
      },
      {
        id: 'sample4',
        name: 'Global Hack Week: AI',
        platform: 'MLH',
        type: 'hackathon',
        startTime: new Date(Date.now() + 432000000).getTime(), // 5 days from now
        endTime: new Date(Date.now() + 432000000 + 604800000).getTime(), // 7 days after start
        url: 'https://mlh.io/events',
        difficulty: 'All Levels'
      },
      {
        id: 'sample5',
        name: 'HackMIT 2023',
        platform: 'MIT',
        type: 'hackathon',
        startTime: new Date(Date.now() + 864000000).getTime(), // 10 days from now
        endTime: new Date(Date.now() + 864000000 + 172800000).getTime(), // 2 days after start
        url: 'https://hackmit.org',
        difficulty: 'Advanced'
      }
    ];
  };
  
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
      // Request notification permissions first
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'You need to enable notifications to set reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      
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
      <View style={styles.emptyImageContainer}>
        {activeTab === 'contests' ? (
          <Feather name="code" size={80} color="#6C63FF" />
        ) : (
          <Feather name="users" size={80} color="#6C63FF" />
        )}
      </View>
      <Text style={styles.emptyText}>
        {loading 
          ? 'Searching for events...' 
          : activeTab === 'contests' 
            ? 'No contests found' 
            : 'No hackathons found'
        }
      </Text>
      <Text style={styles.emptySubText}>
        {!loading && 'Pull down to refresh or try different filters'}
      </Text>
      {!loading && (
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
          <Feather name="refresh-cw" size={16} color="#FFFFFF" style={{marginLeft: 8}} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render error banner if there are API errors
  const renderErrorBanner = () => {
    if (Object.keys(errors).length === 0) return null;
    
    return (
      <TouchableOpacity 
        style={styles.errorBanner}
        onPress={() => setErrors({})}
      >
        <Feather name="alert-triangle" size={16} color="#FFFFFF" />
        <Text style={styles.errorText}>
          {errors.leetcode ? "LeetCode API unavailable - showing cached data" : 
           errors.general ? errors.general : "Some data sources unavailable"}
        </Text>
        <Feather name="x" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Feather name="code" size={24} color="#FFFFFF" style={styles.logoIcon} />
            <Text style={styles.headerTitle}>CodeVent</Text>
          </View>
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      {/* Error Banner */}
      {renderErrorBanner()}
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contests' && styles.activeTab]}
          onPress={() => setActiveTab('contests')}
        >
          <Feather 
            name="code" 
            size={18} 
            color={activeTab === 'contests' ? "#6C63FF" : "#757575"} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'contests' && styles.activeTabText]}>
            Contests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hackathons' && styles.activeTab]}
          onPress={() => setActiveTab('hackathons')}
        >
          <Feather 
            name="users" 
            size={18} 
            color={activeTab === 'hackathons' ? "#6C63FF" : "#757575"} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'hackathons' && styles.activeTabText]}>
            Hackathons
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Section */}
      {!loading && platforms.length > 0 && (
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
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Discovering events...</Text>
          </View>
        )}
        
        {/* Contest/Hackathon List */}
        {!loading && (
          <Animated.FlatList
            data={filteredItems}
            renderItem={({ item, index }) => (
              <Animated.View
                style={{
                  opacity: 1,
                  transform: [{ 
                    translateY: 0
                  }]
                }}
              >
                <ContestCard contest={item} onSetReminder={handleSetReminder} />
              </Animated.View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={["#6C63FF"]}
                tintColor="#6C63FF"
              />
            }
            ListEmptyComponent={renderEmptyComponent}
            ListHeaderComponent={
              filteredItems.length > 0 ? (
                <View style={styles.listHeader}>
                  <View style={styles.listHeaderTitleContainer}>
                    <Feather 
                      name={activeTab === 'contests' ? "calendar" : "award"} 
                      size={20} 
                      color="#6C63FF" 
                      style={{marginRight: 8}}
                    />
                    <Text style={styles.listHeaderTitle}>
                      {activeTab === 'contests' ? 'Upcoming Contests' : 'Upcoming Hackathons'}
                    </Text>
                  </View>
                  <View style={styles.listHeaderCountContainer}>
                    <Text style={styles.listHeaderCount}>
                      {filteredItems.length} {activeTab === 'contests' ? 'contests' : 'hackathons'} found
                    </Text>
                    <TouchableOpacity style={styles.sortButton}>
                      <Feather name="sliders" size={14} color="#6C63FF" />
                      <Text style={styles.sortButtonText}>Sort</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingTop: 10,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRightContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 5,
  },
  errorBanner: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6C63FF',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#757575',
  },
  activeTabText: {
    color: '#6C63FF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listHeader: {
    paddingBottom: 12,
    marginBottom: 8,
  },
  listHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  listHeaderCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  listHeaderCount: {
    fontSize: 14,
    color: '#757575',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 5,
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 16,
    padding: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HomeScreen;