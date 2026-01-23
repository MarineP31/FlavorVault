/**
 * Tests for MealPlanEmptyState Component
 * Task Group 3: Test empty state display and button interaction
 */

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
    TouchableOpacity: mockComponent('TouchableOpacity'),
    StyleSheet: { create: (styles: any) => styles },
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props: any) => React.createElement('Icon', props);
});

import { MealPlanEmptyState } from '@/components/meal-plan/MealPlanEmptyState';

describe('MealPlanEmptyState', () => {
  it('should render guacamole message text', () => {
    const mockOnAddRecipes = jest.fn();
    const component = MealPlanEmptyState({ onAddRecipes: mockOnAddRecipes });

    const jsonString = JSON.stringify(component);
    expect(jsonString).toContain('Holy guacamole');
    expect(jsonString).toContain('Browse recipes to add to your meal plan');
  });

  it('should pass onAddRecipes callback to Add Recipes button', () => {
    const mockOnAddRecipes = jest.fn();
    const component = MealPlanEmptyState({ onAddRecipes: mockOnAddRecipes });

    const findButtonProps = (element: any): any => {
      if (!element) return null;
      if (element.props?.testID === 'add-recipes-button') {
        return element.props;
      }
      if (element.props?.children) {
        const children = Array.isArray(element.props.children)
          ? element.props.children
          : [element.props.children];
        for (const child of children) {
          const found = findButtonProps(child);
          if (found) return found;
        }
      }
      return null;
    };

    const buttonProps = findButtonProps(component);
    expect(buttonProps).not.toBeNull();
    expect(buttonProps.onPress).toBe(mockOnAddRecipes);

    buttonProps.onPress();
    expect(mockOnAddRecipes).toHaveBeenCalled();
  });

  it('should have accessibility labels present', () => {
    const mockOnAddRecipes = jest.fn();
    const component = MealPlanEmptyState({ onAddRecipes: mockOnAddRecipes });

    const jsonString = JSON.stringify(component);
    expect(jsonString).toContain('accessibilityLabel');
    expect(jsonString).toContain('accessibilityRole');
  });
});
