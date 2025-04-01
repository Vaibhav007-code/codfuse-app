import React from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Modal, Portal, Text, Button, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

const ReminderModal = ({ visible, onDismiss, onConfirm, contestName }) => {
  // Use react-native-paper's built-in theme instead of custom context
  const theme = usePaperTheme();
  
  // Fallback theme values if needed
  const defaultThemeColors = {
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#757575',
    primary: '#6200ee',
  };

  // Safely access theme colors using fallback for missing values
  const getThemeColor = (key) => {
    if (theme && theme.colors && theme.colors[key]) {
      return theme.colors[key];
    }
    return defaultThemeColors[key] || defaultThemeColors.primary;
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss}
        dismissable={true} // Ensure the modal can be dismissed by tapping outside
        contentContainerStyle={[styles.modalContainer]}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modal, { backgroundColor: getThemeColor('surface') }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: getThemeColor('text') }]}>
                    Set Reminder
                  </Text>
                  
                  {/* Prominent close button */}
                  <TouchableOpacity 
                    onPress={onDismiss} 
                    style={styles.closeButton}
                    accessibilityLabel="Close dialog"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x-circle" size={28} color={getThemeColor('text')} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.modalText, { color: getThemeColor('textSecondary') }]}>
                  Get notified before {contestName || "the event"} starts
                </Text>
                
                <Divider style={styles.divider} />
                
                {[5, 15, 60, 1440].map((minutes) => (
                  <Button
                    key={minutes}
                    mode="outlined"
                    style={styles.reminderOption}
                    onPress={() => onConfirm(minutes)}
                  >
                    {minutes < 60 
                      ? `${minutes} minutes before` 
                      : minutes === 60 
                        ? '1 hour before' 
                        : '1 day before'}
                  </Button>
                ))}
                
                <Button 
                  mode="text" 
                  onPress={onDismiss}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    flex: 1,
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  reminderOption: {
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default ReminderModal;