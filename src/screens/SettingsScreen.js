// src/screens/SettingsScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={{ color: theme.text }}>Dark Mode</Text>
        <Switch
          value={theme.dark}
          onValueChange={toggleTheme}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  }
});

export default SettingsScreen;