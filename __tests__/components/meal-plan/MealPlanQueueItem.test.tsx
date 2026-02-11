/**
 * Tests for MealPlanQueueItem Component
 * Task Group 2: Test queue item rendering and interactions
 */

import { MealType } from '@/constants/enums';
import type { MealPlanWithRecipe } from '@/lib/db/schema/meal-plan';

jest.mock('react-native', () => {
  const React = require('react');
  const mockComponent = (name: string) => {
    const Component = (props: any) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    Image: mockComponent('Image'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    Pressable: mockComponent('Pressable'),
    StyleSheet: { create: (styles: any) => styles },
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});

import { MealPlanQueueItem } from '@/components/meal-plan/MealPlanQueueItem';

describe('MealPlanQueueItem', () => {
  const mockItem: MealPlanWithRecipe = {
    id: 'mp-1',
    recipeId: 'recipe-1',
    date: '2025-01-22',
    mealType: MealType.DINNER,
    createdAt: '2025-01-01T00:00:00.000Z',
    recipeTitle: 'Honey Garlic Chicken',
    recipeImageUri: 'https://example.com/chicken.jpg',
    recipeServings: 4,
    recipePrepTime: 10,
    recipeCookTime: 15,
  };

  const mockOnRemove = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render recipe thumbnail, title, category, and cooking time', () => {
    const component = MealPlanQueueItem({
      item: mockItem,
      onRemove: mockOnRemove,
      onPress: mockOnPress,
    });

    const jsonString = JSON.stringify(component);

    expect(jsonString).toContain('Honey Garlic Chicken');
    expect(jsonString).toContain('DINNER');
    expect(jsonString).toContain('25 MINS');
    expect(jsonString).toContain('https://example.com/chicken.jpg');
  });

  it('should call onRemove callback with recipeId when trash icon is tapped', () => {
    const component = MealPlanQueueItem({
      item: mockItem,
      onRemove: mockOnRemove,
      onPress: mockOnPress,
    });

    const findTrashButton = (element: any): any => {
      if (!element) return null;
      if (element.props?.testID === 'remove-recipe-button') {
        return element.props;
      }
      if (element.props?.children) {
        const children = Array.isArray(element.props.children)
          ? element.props.children
          : [element.props.children];
        for (const child of children) {
          const found = findTrashButton(child);
          if (found) return found;
        }
      }
      return null;
    };

    const trashButtonProps = findTrashButton(component);
    expect(trashButtonProps).not.toBeNull();
    trashButtonProps.onPress();
    expect(mockOnRemove).toHaveBeenCalledWith('recipe-1');
  });

  it('should call onPress callback when item is tapped for navigation', () => {
    const component = MealPlanQueueItem({
      item: mockItem,
      onRemove: mockOnRemove,
      onPress: mockOnPress,
    });

    const findItemPressable = (element: any): any => {
      if (!element) return null;
      if (element.props?.testID === 'queue-item-pressable') {
        return element.props;
      }
      if (element.props?.children) {
        const children = Array.isArray(element.props.children)
          ? element.props.children
          : [element.props.children];
        for (const child of children) {
          const found = findItemPressable(child);
          if (found) return found;
        }
      }
      return null;
    };

    const itemProps = findItemPressable(component);
    expect(itemProps).not.toBeNull();
    itemProps.onPress();
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should handle missing image gracefully with placeholder', () => {
    const itemWithoutImage: MealPlanWithRecipe = {
      ...mockItem,
      recipeImageUri: null,
    };

    const component = MealPlanQueueItem({
      item: itemWithoutImage,
      onRemove: mockOnRemove,
      onPress: mockOnPress,
    });

    const jsonString = JSON.stringify(component);

    expect(jsonString).toContain('Honey Garlic Chicken');
    expect(jsonString).toContain('restaurant-outline');
  });

  it('should handle missing cooking time gracefully', () => {
    const itemWithoutTime: MealPlanWithRecipe = {
      ...mockItem,
      recipePrepTime: null,
      recipeCookTime: null,
    };

    const component = MealPlanQueueItem({
      item: itemWithoutTime,
      onRemove: mockOnRemove,
      onPress: mockOnPress,
    });

    const jsonString = JSON.stringify(component);

    expect(jsonString).toContain('Honey Garlic Chicken');
    expect(jsonString).toContain('DINNER');
  });
});
