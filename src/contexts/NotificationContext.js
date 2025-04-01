import React, { createContext, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // Request notification permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    
    requestPermissions();
  }, []);
  
  // Schedule a reminder for a specific contest
  const scheduleReminder = async (contestId, contestName, time) => {
    try {
      // Cancel any existing reminder for this contest
      await cancelReminder(contestId);
      
      // Ensure the reminder time is in the future
      const now = new Date();
      const reminderTime = new Date(time);
      
      if (reminderTime <= now) {
        throw new Error('Reminder time must be in the future');
      }
      
      // Schedule the notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Contest Reminder',
          body: `${contestName} starts soon!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { contestId },
        },
        trigger: reminderTime,
      });
      
      // Store the reminder in AsyncStorage
      const reminder = {
        id: identifier,
        contestId,
        contestName,
        trigger: { date: reminderTime.toISOString() },
        content: {
          title: 'Contest Reminder',
          body: `${contestName} starts soon!`
        },
        createdAt: new Date().toISOString()
      };
      
      // Save reminder identifier for this contest
      await AsyncStorage.setItem(`reminder_${contestId}`, identifier);
      
      // Add to reminders list for display in ReminderScreen
      const storedReminders = await AsyncStorage.getItem('reminders');
      let reminders = [];
      
      if (storedReminders) {
        reminders = JSON.parse(storedReminders);
      }
      
      reminders.push(reminder);
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  };

  // Cancel a reminder for a specific contest
  const cancelReminder = async (contestId) => {
    try {
      // Get the notification identifier
      const identifier = await AsyncStorage.getItem(`reminder_${contestId}`);
      
      if (identifier) {
        // Cancel the scheduled notification
        await Notifications.cancelScheduledNotificationAsync(identifier);
        
        // Remove from AsyncStorage
        await AsyncStorage.removeItem(`reminder_${contestId}`);
        
        // Update reminders list
        const storedReminders = await AsyncStorage.getItem('reminders');
        
        if (storedReminders) {
          const reminders = JSON.parse(storedReminders);
          const updatedReminders = reminders.filter(
            reminder => reminder.contestId !== contestId
          );
          
          await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
        }
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
      throw error;
    }
  };

  // Get all active reminders
  const getReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      return storedReminders ? JSON.parse(storedReminders) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      scheduleReminder, 
      cancelReminder,
      getReminders
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);