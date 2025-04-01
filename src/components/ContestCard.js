// src/components/ContestCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import { getPlatformColor, formatDateTime, formatDuration } from '../utils/helpers';
import * as Notifications from 'expo-notifications';

const ContestCard = ({ contest, onSetReminder }) => {
  // Get platform color for styling
  const platformColor = getPlatformColor(contest.platform);
  
  // Handle register button press
  const handleRegister = async () => {
    try {
      await Linking.openURL(contest.url);
    } catch (error) {
      Alert.alert('Error', 'Could not open the URL. Please try again later.');
    }
  };
  
  // Handle set reminder button press
  const handleSetReminder = () => {
    onSetReminder(contest);
  };
  
  // Format the time until contest
  const getTimeUntil = () => {
    try {
      return formatDistanceToNow(new Date(contest.startTime), { addSuffix: true });
    } catch (error) {
      return 'Soon';
    }
  };

  return (
    <View style={styles.container}>
      {/* Platform indicator */}
      <View style={[styles.platformIndicator, { backgroundColor: platformColor }]} />
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.platform}>{contest.platform}</Text>
          <Text style={styles.duration}>
            <MaterialIcons name="timer" size={14} color="#666" />
            {' '}{formatDuration(contest.duration)}
          </Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{contest.name}</Text>
        
        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <MaterialIcons name="event" size={16} color="#555" />
            <Text style={styles.timeText}>
              {formatDateTime(contest.startTime)}
            </Text>
          </View>
          
          <View style={styles.countdownContainer}>
            <CountdownTimer targetTime={contest.startTime} />
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.reminderButton]} 
            onPress={handleSetReminder}
          >
            <Feather name="bell" size={16} color="#fff" />
            <Text style={styles.buttonText}>Reminder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.registerButton, { backgroundColor: platformColor }]} 
            onPress={handleRegister}
          >
            <Feather name="external-link" size={16} color="#fff" />
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  platformIndicator: {
    width: 6,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platform: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  timeContainer: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#444',
  },
  countdownContainer: {
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  reminderButton: {
    backgroundColor: '#5B5FFF',
    marginRight: 8,
  },
  registerButton: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default ContestCard;