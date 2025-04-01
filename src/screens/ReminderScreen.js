import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateTime } from '../utils/helpers';
import ReminderModal from '../components/ReminderModal';
import { useNotifications } from '../context/NotificationContext';

const ReminderScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const { scheduleReminder, cancelReminder } = useNotifications();
  
  // Fetch reminders on screen load
  useEffect(() => {
    loadReminders();
  }, []);
  
  // Load reminders from storage
  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setLoading(false);
    }
  };
  
  // Save reminders to storage
  const saveReminders = async (updatedReminders) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };
  
  // Delete a reminder
  const handleDeleteReminder = async (reminderId) => {
    try {
      // Find the reminder to get the contestId
      const reminderToDelete = reminders.find(reminder => reminder.id === reminderId);
      
      if (reminderToDelete) {
        // Cancel notification
        await Notifications.cancelScheduledNotificationAsync(reminderId);
        
        // Remove from contest-specific storage
        if (reminderToDelete.contestId) {
          await AsyncStorage.removeItem(`reminder_${reminderToDelete.contestId}`);
        }
        
        // Update reminders state
        const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
        setReminders(updatedReminders);
        
        // Save updated reminders
        saveReminders(updatedReminders);
        
        Alert.alert('Success', 'Reminder deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder. Please try again.');
    }
  };
  
  // Handle setting a new reminder
  const handleSetReminder = async (minutes) => {
    try {
      if (!selectedEvent) {
        Alert.alert('Error', 'No event selected');
        return;
      }
      
      const startTime = new Date(selectedEvent.startTime);
      
      // Calculate reminder time based on minutes
      let reminderTime;
      if (minutes === 5 || minutes === 15) {
        reminderTime = new Date(startTime.getTime() - minutes * 60 * 1000);
      } else if (minutes === 60) {
        reminderTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      } else if (minutes === 1440) {
        reminderTime = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Schedule the reminder
      await scheduleReminder(selectedEvent.id, selectedEvent.name, reminderTime);
      
      // Refresh reminders list
      loadReminders();
      
      Alert.alert(
        'Reminder Set',
        `You'll be notified before ${selectedEvent.name} starts.`,
        [{ text: 'OK' }]
      );
      
      // Hide the modal
      setModalVisible(false);
      
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };
  
  // Show modal to set reminder for an event
  const showAddReminderModal = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };
  
  // Render reminder item
  const renderReminderItem = ({ item }) => {
    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderContent}>
          <Text style={styles.reminderTitle}>{item.content.title}</Text>
          <Text style={styles.reminderBody}>{item.content.body}</Text>
          <Text style={styles.reminderTime}>
            Notification at: {formatDateTime(item.trigger.date)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Reminder',
              'Are you sure you want to delete this reminder?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Delete',
                  onPress: () => handleDeleteReminder(item.id),
                  style: 'destructive'
                }
              ]
            );
          }}
        >
          <Feather name="trash-2" size={20} color="#FF4D4F" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No reminders set</Text>
      <Text style={styles.emptySubText}>
        You'll see your upcoming contest and hackathon reminders here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Reminders</Text>
      </View>
      
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
      
      {/* Add Reminder Modal */}
      <ReminderModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onConfirm={handleSetReminder}
        contestName={selectedEvent ? selectedEvent.name : ""}
      />
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reminderBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reminderTime: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
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
    textAlign: 'center',
    maxWidth: '70%',
  },
});

export default ReminderScreen;