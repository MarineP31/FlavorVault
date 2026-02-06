/**
 * Task 3.1: Unit Tests for TagFilterModal Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagFilterModal } from '@/components/recipes/TagFilterModal';

describe('TagFilterModal', () => {
  const mockAllTags = ['asian', 'comfort', 'dinner', 'easy', 'healthy', 'italian', 'lunch'];
  const mockOnClose = jest.fn();
  const mockOnToggleTag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible prop is true', () => {
    const { getByTestId } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={mockAllTags}
        selectedTags={[]}
        onToggleTag={mockOnToggleTag}
      />
    );

    expect(getByTestId('tag-filter-modal')).toBeTruthy();
  });

  it('should display all unique tags (not just top 10)', () => {
    const { getByText } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={mockAllTags}
        selectedTags={[]}
        onToggleTag={mockOnToggleTag}
      />
    );

    mockAllTags.forEach((tag) => {
      expect(getByText(tag)).toBeTruthy();
    });
  });

  it('should toggle selectedTags correctly when tag is pressed', () => {
    const { getByTestId } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={mockAllTags}
        selectedTags={[]}
        onToggleTag={mockOnToggleTag}
      />
    );

    const tagItem = getByTestId('tag-filter-modal-tag-italian');
    fireEvent.press(tagItem);

    expect(mockOnToggleTag).toHaveBeenCalledWith('italian');
  });

  it('should dismiss modal when close button is pressed', () => {
    const { getByTestId } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={mockAllTags}
        selectedTags={[]}
        onToggleTag={mockOnToggleTag}
      />
    );

    const closeButton = getByTestId('tag-filter-modal-close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show visual indicator for selected tags', () => {
    const { getByTestId } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={mockAllTags}
        selectedTags={['italian', 'easy']}
        onToggleTag={mockOnToggleTag}
      />
    );

    const selectedTag = getByTestId('tag-filter-modal-tag-italian-check');
    expect(selectedTag).toBeTruthy();
  });

  it('should handle empty tags list', () => {
    const { getByText } = render(
      <TagFilterModal
        visible={true}
        onClose={mockOnClose}
        allTags={[]}
        selectedTags={[]}
        onToggleTag={mockOnToggleTag}
      />
    );

    expect(getByText('No tags available')).toBeTruthy();
  });
});
