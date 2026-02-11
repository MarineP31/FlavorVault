import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MealPlanEmptyStateProps {
  onAddRecipes: () => void;
}

export function MealPlanEmptyState({ onAddRecipes }: MealPlanEmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Empty meal plan message"
    >
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Ionicons name="restaurant-outline" size={40} color={isDark ? '#8E8E93' : '#9CA3AF'} />
      </View>

      <Text style={[styles.title, isDark && styles.titleDark]}>No Recipes Yet</Text>

      <Text style={[styles.message, isDark && styles.messageDark]}>
        Browse your recipe collection to add dishes to your meal plan
      </Text>

      <TouchableOpacity
        style={[styles.button, isDark && styles.buttonDark]}
        onPress={onAddRecipes}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add recipes to meal plan"
        testID="add-recipes-button"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
        <Text style={styles.buttonText}>Browse Recipes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  messageDark: {
    color: '#8E8E93',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  buttonDark: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
