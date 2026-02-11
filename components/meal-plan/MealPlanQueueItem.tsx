import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

export interface MealPlanQueueItemProps {
  item: MealPlanWithRecipe;
  onRemove: (recipeId: string) => void;
  onPress: () => void;
}

export function MealPlanQueueItem({ item, onRemove, onPress }: MealPlanQueueItemProps) {
  const totalCookingTime = (item.recipePrepTime || 0) + (item.recipeCookTime || 0);
  const hasCookingTime = totalCookingTime > 0;
  const categoryLabel = item.mealType.toUpperCase();

  const handleRemove = () => {
    onRemove(item.recipeId);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.contentPressable}
        onPress={onPress}
        testID="queue-item-pressable"
        accessibilityRole="button"
        accessibilityLabel={`View recipe ${item.recipeTitle}`}
      >
        {item.recipeImageUri ? (
          <Image
            source={{ uri: item.recipeImageUri }}
            style={styles.thumbnail}
            accessibilityLabel={`${item.recipeTitle} image`}
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="restaurant-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.recipeTitle}
          </Text>
          <Text style={styles.metadata}>
            {categoryLabel}
            {hasCookingTime && ` • ${totalCookingTime} MINS`}
          </Text>
        </View>
      </Pressable>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        activeOpacity={0.7}
        testID="remove-recipe-button"
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.recipeTitle} from meal plan`}
      >
        <Ionicons name="trash-outline" size={24} color="#FF6B35" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contentPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  placeholderThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 8,
  },
});
