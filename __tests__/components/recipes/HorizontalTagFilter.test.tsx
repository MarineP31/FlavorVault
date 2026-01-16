/**
 * Task 2.1: Unit Tests for HorizontalTagFilter Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HorizontalTagFilter } from '@/components/recipes/HorizontalTagFilter';

describe('HorizontalTagFilter', () => {
  const mockTopTags = ['dinner', 'easy', 'italian', 'healthy', 'asian'];
  const mockToggleTag = jest.fn();
  const mockOnPresetChange = jest.fn();
  const mockOnFilterPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render "All" chip first and clear selections on press', () => {
    const { getByTestId } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={['dinner']}
        onToggleTag={mockToggleTag}
        presetFilter="quick"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    const allChip = getByTestId('horizontal-tag-filter-all');
    expect(allChip).toBeTruthy();

    fireEvent.press(allChip);
    expect(mockOnPresetChange).toHaveBeenCalledWith('all');
  });

  it('should render "Quick" chip second with correct toggle behavior', () => {
    const { getByTestId } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={[]}
        onToggleTag={mockToggleTag}
        presetFilter="all"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    const quickChip = getByTestId('horizontal-tag-filter-quick');
    expect(quickChip).toBeTruthy();

    fireEvent.press(quickChip);
    expect(mockOnPresetChange).toHaveBeenCalledWith('quick');
  });

  it('should render top 10 tags in correct order', () => {
    const { getByTestId, getByText } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={[]}
        onToggleTag={mockToggleTag}
        presetFilter="all"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    mockTopTags.forEach((tag) => {
      expect(getByTestId(`horizontal-tag-filter-tag-${tag}`)).toBeTruthy();
      expect(getByText(tag)).toBeTruthy();
    });
  });

  it('should render filter button at end of scroll', () => {
    const { getByTestId } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={[]}
        onToggleTag={mockToggleTag}
        presetFilter="all"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    const filterButton = getByTestId('horizontal-tag-filter-button');
    expect(filterButton).toBeTruthy();

    fireEvent.press(filterButton);
    expect(mockOnFilterPress).toHaveBeenCalled();
  });

  it('should apply selected state styling to selected tags', () => {
    const { getByTestId } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={['dinner', 'easy']}
        onToggleTag={mockToggleTag}
        presetFilter="all"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    const selectedChip = getByTestId('horizontal-tag-filter-tag-dinner');
    const unselectedChip = getByTestId('horizontal-tag-filter-tag-italian');

    expect(selectedChip).toBeTruthy();
    expect(unselectedChip).toBeTruthy();
  });

  it('should call onToggleTag when a tag chip is pressed', () => {
    const { getByTestId } = render(
      <HorizontalTagFilter
        topTags={mockTopTags}
        selectedTags={[]}
        onToggleTag={mockToggleTag}
        presetFilter="all"
        onPresetChange={mockOnPresetChange}
        onFilterPress={mockOnFilterPress}
      />
    );

    const tagChip = getByTestId('horizontal-tag-filter-tag-dinner');
    fireEvent.press(tagChip);

    expect(mockToggleTag).toHaveBeenCalledWith('dinner');
  });
});
