/**
 * TagFilterModal Component
 * Task Group 3: Modal for selecting tags from complete list
 *
 * Displays all unique tags from recipes in a scrollable modal.
 * Allows immediate selection that filters recipes.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagFilterModalProps {
  visible: boolean;
  onClose: () => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  testID?: string;
}

export function TagFilterModal({
  visible,
  onClose,
  allTags,
  selectedTags,
  onToggleTag,
  testID = 'tag-filter-modal',
}: TagFilterModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isTagSelected = (tag: string) => {
    return selectedTags.includes(tag.toLowerCase());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Filter by Tags
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-close`}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? '#8E8E93' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>

        {/* Tag List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          testID={`${testID}-content`}
        >
          {allTags.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="pricetag-outline"
                size={64}
                color="#8E8E93"
              />
              <Text style={styles.emptyStateText}>No tags available</Text>
              <Text style={styles.emptyStateSubtext}>
                Add tags to your recipes to filter them here
              </Text>
            </View>
          ) : (
            allTags.map((tag) => {
              const selected = isTagSelected(tag);

              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => onToggleTag(tag)}
                  style={[
                    styles.tagItem,
                    isDark && styles.tagItemDark,
                    selected && styles.tagItemSelected,
                    selected && isDark && styles.tagItemSelectedDark,
                  ]}
                  testID={`${testID}-tag-${tag}`}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isDark && styles.tagTextDark,
                      selected && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#FF6B35"
                      testID={`${testID}-tag-${tag}-check`}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Floating Validate Button */}
        <View style={[styles.floatingButtonContainer, isDark && styles.floatingButtonContainerDark]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.validateButton}
            testID={`${testID}-validate`}
          >
            <Text style={styles.validateButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7CC',
  },
  headerDark: {
    borderBottomColor: '#3A3A3C',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    minHeight: 52,
  },
  tagItemDark: {
    backgroundColor: '#1C1C1E',
  },
  tagItemSelected: {
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  tagItemSelectedDark: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  tagText: {
    fontSize: 16,
    color: '#000000',
  },
  tagTextDark: {
    color: '#FFFFFF',
  },
  tagTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  floatingButtonContainerDark: {
    backgroundColor: '#000000',
    borderTopColor: '#3A3A3C',
  },
  validateButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
