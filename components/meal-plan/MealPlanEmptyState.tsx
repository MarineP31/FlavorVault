import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface MealPlanEmptyStateProps {
  onAddRecipes: () => void;
}

export function MealPlanEmptyState({ onAddRecipes }: MealPlanEmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Empty meal plan message"
    >
      <View style={styles.iconContainer}>
        <Icon name="restaurant-outline" size={64} color="#9CA3AF" />
      </View>

      <Text style={styles.title}>No Recipes Yet</Text>

      <Text style={styles.message}>
        Holy guacamole! There are no recipes selected. Browse recipes to add to your meal plan
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onAddRecipes}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add recipes to meal plan"
        testID="add-recipes-button"
      >
        <Icon name="add-circle-outline" size={20} color="#FF6B35" />
        <Text style={styles.buttonText}>Add Recipes</Text>
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
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
