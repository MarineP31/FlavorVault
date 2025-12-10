/**
 * Recipe Detail Header Component
 * Task 3.1: Recipe Header Component
 * Task 3.3: Context-Aware Button Logic
 * Task 11.2: Context-Aware Button Visibility
 */

import React, { memo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export type NavigationSource = 'list' | 'create' | 'edit' | 'queue';

interface RecipeDetailHeaderProps {
  onEdit: () => void;
  onDelete: () => void;
  onAddToQueue?: () => void;
  onRemoveFromQueue?: () => void;
  source?: NavigationSource;
  loading?: boolean;
  testID?: string;
}

/**
 * Fixed header with context-aware action buttons
 *
 * Features:
 * - Fixed header positioning
 * - Context-aware button visibility based on navigation source
 * - Edit, Delete, Add to Queue, Remove from Queue actions
 * - Loading states for async operations
 * - Accessible button components
 * - Dark mode support
 * - Performance optimized with React.memo
 *
 * Button visibility logic:
 * - From list/create/edit: Show Edit, Delete, Add to Queue
 * - From queue: Show Edit, Delete, Remove from Queue
 *
 * @param props - Component props
 * @returns RecipeDetailHeader component
 *
 * @example
 * ```tsx
 * <RecipeDetailHeader
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onAddToQueue={handleAddToQueue}
 *   source="list"
 * />
 * ```
 */
function RecipeDetailHeaderComponent({
  onEdit,
  onDelete,
  onAddToQueue,
  onRemoveFromQueue,
  source = 'list',
  loading = false,
  testID = 'recipe-detail-header',
}: RecipeDetailHeaderProps) {
  // Task 11.2: Context-Aware Button Visibility
  // Determine which queue action to show based on navigation source
  const showAddToQueue = source !== 'queue';
  const showRemoveFromQueue = source === 'queue';

  return (
    <View
      className="absolute top-0 right-0 z-10 flex-row items-center gap-2 p-3"
      testID={testID}
    >
      {/* Edit Button - Task 9.1: Edit Button Implementation */}
      <TouchableOpacity
        onPress={onEdit}
        disabled={loading}
        className="bg-white dark:bg-[#1C1C1E] rounded-full p-2.5 shadow-md active:opacity-70"
        accessibilityRole="button"
        accessibilityLabel="Edit recipe"
        accessibilityHint="Double tap to edit this recipe"
        accessibilityState={{ disabled: loading }}
        testID={`${testID}-edit-button`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Icon
            name="pencil-outline"
            size={20}
            color="#007AFF"
          />
        )}
      </TouchableOpacity>

      {/* Delete Button - Task 9.2: Delete Button Implementation */}
      <TouchableOpacity
        onPress={onDelete}
        disabled={loading}
        className="bg-white dark:bg-[#1C1C1E] rounded-full p-2.5 shadow-md active:opacity-70"
        accessibilityRole="button"
        accessibilityLabel="Delete recipe"
        accessibilityHint="Double tap to delete this recipe"
        accessibilityState={{ disabled: loading }}
        testID={`${testID}-delete-button`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FF3B30" />
        ) : (
          <Icon
            name="trash-outline"
            size={20}
            color="#FF3B30"
          />
        )}
      </TouchableOpacity>

      {/* Add to Queue Button - Task 9.3: Add to Queue Button Implementation */}
      {showAddToQueue && onAddToQueue && (
        <TouchableOpacity
          onPress={onAddToQueue}
          disabled={loading}
          className="bg-white dark:bg-[#1C1C1E] rounded-full p-2.5 shadow-md active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Add to meal plan queue"
          accessibilityHint="Double tap to add this recipe to your meal plan"
          accessibilityState={{ disabled: loading }}
          testID={`${testID}-add-to-queue-button`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#34C759" />
          ) : (
            <Icon
              name="add-circle-outline"
              size={20}
              color="#34C759"
            />
          )}
        </TouchableOpacity>
      )}

      {/* Remove from Queue Button - Task 9.4: Remove from Queue Button Implementation */}
      {showRemoveFromQueue && onRemoveFromQueue && (
        <TouchableOpacity
          onPress={onRemoveFromQueue}
          disabled={loading}
          className="bg-white dark:bg-[#1C1C1E] rounded-full p-2.5 shadow-md active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Remove from meal plan queue"
          accessibilityHint="Double tap to remove this recipe from your meal plan"
          accessibilityState={{ disabled: loading }}
          testID={`${testID}-remove-from-queue-button`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FF9500" />
          ) : (
            <Icon
              name="remove-circle-outline"
              size={20}
              color="#FF9500"
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// Task 12: Performance optimization with React.memo
export const RecipeDetailHeader = memo(RecipeDetailHeaderComponent);
