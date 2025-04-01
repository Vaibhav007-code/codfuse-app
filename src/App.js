import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReminderScreen from './src/screens/ReminderScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Contexts
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          headerShown: true,
          title: 'Settings',
          headerBackTitle: 'Back'
        }}
      />
    </HomeStack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                
                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Reminders') {
                  iconName = 'bell';
                }
                
                return <Feather name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#5B5FFF',
              tabBarInactiveTintColor: '#999',
              headerShown: false,
              tabBarStyle: {
                height: 60,
                paddingTop: 6,
                paddingBottom: 8,
                borderTopColor: '#eee',
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Reminders" component={ReminderScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </NotificationProvider>
    </ThemeProvider>
  );
}