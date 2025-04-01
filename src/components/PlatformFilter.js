// src/components/PlatformFilter.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getPlatformColor } from '../utils/helpers';

const PlatformFilter = ({ platforms, selectedPlatforms, onTogglePlatform }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {platforms.map(platform => {
          const isSelected = selectedPlatforms.includes(platform);
          const platformColor = getPlatformColor(platform);
          
          return (
            <TouchableOpacity
              key={platform}
              style={[
                styles.filterButton,
                isSelected && { backgroundColor: platformColor + '20', borderColor: platformColor }
              ]}
              onPress={() => onTogglePlatform(platform)}
            >
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: platformColor }
                ]} 
              />
              <Text style={[
                styles.filterText,
                isSelected && { color: platformColor, fontWeight: '600' }
              ]}>
                {platform}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
});

export default PlatformFilter;