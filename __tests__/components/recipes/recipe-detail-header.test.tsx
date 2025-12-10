/**
 * Task 14.1: Unit Tests - Header Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeDetailHeader, NavigationSource } from '@/components/recipes/recipe-detail-header';

describe('RecipeDetailHeader', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddToQueue = jest.fn();
  const mockOnRemoveFromQueue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Rendering', () => {
    it('should render edit and delete buttons always', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          source="list"
        />
      );

      expect(getByTestId('recipe-detail-header-edit-button')).toBeTruthy();
      expect(getByTestId('recipe-detail-header-delete-button')).toBeTruthy();
    });

    it('should render add to queue button for list source', () => {
      const { getByTestId, queryByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="list"
        />
      );

      expect(getByTestId('recipe-detail-header-add-to-queue-button')).toBeTruthy();
      expect(queryByTestId('recipe-detail-header-remove-from-queue-button')).toBeNull();
    });

    it('should render add to queue button for create source', () => {
      const { getByTestId, queryByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="create"
        />
      );

      expect(getByTestId('recipe-detail-header-add-to-queue-button')).toBeTruthy();
      expect(queryByTestId('recipe-detail-header-remove-from-queue-button')).toBeNull();
    });

    it('should render add to queue button for edit source', () => {
      const { getByTestId, queryByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="edit"
        />
      );

      expect(getByTestId('recipe-detail-header-add-to-queue-button')).toBeTruthy();
      expect(queryByTestId('recipe-detail-header-remove-from-queue-button')).toBeNull();
    });

    it('should render remove from queue button for queue source', () => {
      const { getByTestId, queryByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRemoveFromQueue={mockOnRemoveFromQueue}
          source="queue"
        />
      );

      expect(getByTestId('recipe-detail-header-remove-from-queue-button')).toBeTruthy();
      expect(queryByTestId('recipe-detail-header-add-to-queue-button')).toBeNull();
    });
  });

  describe('Button Actions', () => {
    it('should call onEdit when edit button is pressed', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          source="list"
        />
      );

      fireEvent.press(getByTestId('recipe-detail-header-edit-button'));
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is pressed', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          source="list"
        />
      );

      fireEvent.press(getByTestId('recipe-detail-header-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onAddToQueue when add to queue button is pressed', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="list"
        />
      );

      fireEvent.press(getByTestId('recipe-detail-header-add-to-queue-button'));
      expect(mockOnAddToQueue).toHaveBeenCalledTimes(1);
    });

    it('should call onRemoveFromQueue when remove from queue button is pressed', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onRemoveFromQueue={mockOnRemoveFromQueue}
          source="queue"
        />
      );

      fireEvent.press(getByTestId('recipe-detail-header-remove-from-queue-button'));
      expect(mockOnRemoveFromQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="list"
          loading={true}
        />
      );

      const editButton = getByTestId('recipe-detail-header-edit-button');
      const deleteButton = getByTestId('recipe-detail-header-delete-button');
      const addToQueueButton = getByTestId('recipe-detail-header-add-to-queue-button');

      // Buttons should be disabled
      fireEvent.press(editButton);
      fireEvent.press(deleteButton);
      fireEvent.press(addToQueueButton);

      // None of the handlers should be called when disabled
      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(mockOnAddToQueue).not.toHaveBeenCalled();
    });
  });

  describe('Context-Aware Behavior', () => {
    const sources: NavigationSource[] = ['list', 'create', 'edit', 'queue'];

    sources.forEach((source) => {
      it(`should render correctly for ${source} source`, () => {
        const { queryByTestId } = render(
          <RecipeDetailHeader
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onAddToQueue={mockOnAddToQueue}
            onRemoveFromQueue={mockOnRemoveFromQueue}
            source={source}
          />
        );

        // Edit and delete should always be present
        expect(queryByTestId('recipe-detail-header-edit-button')).toBeTruthy();
        expect(queryByTestId('recipe-detail-header-delete-button')).toBeTruthy();

        // Queue buttons should be mutually exclusive
        if (source === 'queue') {
          expect(queryByTestId('recipe-detail-header-remove-from-queue-button')).toBeTruthy();
          expect(queryByTestId('recipe-detail-header-add-to-queue-button')).toBeNull();
        } else {
          expect(queryByTestId('recipe-detail-header-add-to-queue-button')).toBeTruthy();
          expect(queryByTestId('recipe-detail-header-remove-from-queue-button')).toBeNull();
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="list"
        />
      );

      expect(getByLabelText('Edit recipe')).toBeTruthy();
      expect(getByLabelText('Delete recipe')).toBeTruthy();
      expect(getByLabelText('Add to meal plan queue')).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      const { getByTestId } = render(
        <RecipeDetailHeader
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddToQueue={mockOnAddToQueue}
          source="list"
        />
      );

      const editButton = getByTestId('recipe-detail-header-edit-button');
      expect(editButton.props.accessibilityHint).toBe('Double tap to edit this recipe');
    });
  });
});
