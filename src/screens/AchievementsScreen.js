import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';
import { ACHIEVEMENTS } from '../utils/constants';

const AchievementsScreen = ({ route }) => {
  const { achievements } = route.params;
  const { theme } = useTheme();

  const renderItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <Title style={{ color: theme.colors.text }}>
          {item.name} {achievements.includes(item.id) ? '✓' : '🔒'}
        </Title>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={ACHIEVEMENTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  card: {
    marginBottom: 16,
    borderRadius: 12
  },
  cardContent: {
    alignItems: 'center',
    padding: 20
  },
  listContent: {
    paddingBottom: 20
  }
});

export default AchievementsScreen;