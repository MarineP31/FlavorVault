/**
 * Category Section Component
 * Displays a category with its tags and management actions
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagChip } from './TagChip';

interface CategorySectionProps {
  name: string;
  isCustom: boolean;
  tags: string[];
  customCount: number;
  maxCustomTags: number;
  onAddTag?: (tagValue: string) => void;
  onEditTag?: (oldValue: string, newValue: string) => void;
  onDeleteTag?: (tagValue: string) => void;
  onEditCategory?: () => void;
  onDeleteCategory?: () => void;
  testID?: string;
}

/**
 * Category section with tags display and management
 */
export function CategorySection({
  name,
  isCustom,
  tags,
  customCount,
  maxCustomTags,
  onAddTag,
  onEditTag,
  onDeleteTag,
  onEditCategory,
  onDeleteCategory,
  testID,
}: CategorySectionProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');

  const handleAddTag = () => {
    if (newTagValue.trim() && onAddTag) {
      onAddTag(newTagValue.trim());
      setNewTagValue('');
      setIsAddingTag(false);
    }
  };

  const handleStartEdit = (tagValue: string) => {
    setEditingTag(tagValue);
    setEditTagValue(tagValue);
  };

  const handleSaveEdit = () => {
    if (editTagValue.trim() && editingTag && onEditTag) {
      onEditTag(editingTag, editTagValue.trim());
      setEditingTag(null);
      setEditTagValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagValue('');
  };

  const canAddMoreTags = customCount < maxCustomTags;

  return (
    <View
      style={{
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
      testID={testID}
    >
      {/* Category Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#F2F2F7',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#000000',
            }}
          >
            {name}
          </Text>
          {!isCustom && (
            <View
              style={{
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#FF6B35',
                }}
              >
                Default
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {customCount > 0 && (
            <Text style={{ fontSize: 12, color: '#8E8E93' }}>
              {customCount}/{maxCustomTags}
            </Text>
          )}
          {isCustom && (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {onEditCategory && (
                <TouchableOpacity
                  onPress={onEditCategory}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#F2F2F7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  testID={`${testID}-edit`}
                >
                  <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
              {onDeleteCategory && (
                <TouchableOpacity
                  onPress={onDeleteCategory}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  testID={`${testID}-delete`}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={{ padding: 12 }}>
        {/* Tags Display */}
        {tags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tags.map((tag) => (
              <React.Fragment key={tag}>
                {editingTag === tag ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#F2F2F7',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <TextInput
                      value={editTagValue}
                      onChangeText={setEditTagValue}
                      placeholder="Tag name"
                      placeholderTextColor="#8E8E93"
                      style={{
                        fontSize: 14,
                        color: '#000000',
                        minWidth: 80,
                      }}
                      autoFocus
                      testID={`${testID}-edit-input-${tag}`}
                    />
                    <View style={{ flexDirection: 'row', marginLeft: 8, gap: 4 }}>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        style={{ padding: 4 }}
                        testID={`${testID}-save-${tag}`}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        style={{ padding: 4 }}
                        testID={`${testID}-cancel-${tag}`}
                      >
                        <Ionicons name="close-circle" size={20} color="#8E8E93" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TagChip
                    value={tag}
                    onEdit={() => handleStartEdit(tag)}
                    onDelete={() => onDeleteTag?.(tag)}
                    editable={onEditTag !== undefined || onDeleteTag !== undefined}
                    testID={`${testID}-tag-${tag}`}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontSize: 14,
              color: '#8E8E93',
              fontStyle: 'italic',
            }}
          >
            No tags yet
          </Text>
        )}

        {/* Add Tag Input */}
        {isAddingTag ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
            }}
          >
            <TextInput
              value={newTagValue}
              onChangeText={setNewTagValue}
              placeholder="Enter tag name"
              placeholderTextColor="#8E8E93"
              style={{
                flex: 1,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: '#F2F2F7',
                borderRadius: 10,
                fontSize: 15,
                color: '#000000',
              }}
              autoFocus
              maxLength={30}
              testID={`${testID}-add-input`}
            />
            <TouchableOpacity
              onPress={handleAddTag}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#FF6B35',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              testID={`${testID}-save-new`}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsAddingTag(false);
                setNewTagValue('');
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              testID={`${testID}-cancel-new`}
            >
              <Ionicons name="close" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAddingTag(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              marginTop: tags.length > 0 ? 8 : 0,
              opacity: canAddMoreTags && onAddTag ? 1 : 0.5,
            }}
            disabled={!canAddMoreTags || !onAddTag}
            testID={`${testID}-add-button`}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={canAddMoreTags && onAddTag ? '#FF6B35' : '#8E8E93'}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 14,
                fontWeight: '500',
                color: canAddMoreTags && onAddTag ? '#FF6B35' : '#8E8E93',
              }}
            >
              {canAddMoreTags ? 'Add Tag' : `Max ${maxCustomTags} tags`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
