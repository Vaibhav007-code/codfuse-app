import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AchievementProvider } from './src/contexts/AchievementContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AchievementProvider>
        <NotificationProvider>
          <PaperProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </NotificationProvider>
      </AchievementProvider>
    </ThemeProvider>
  );
}