/**
 * Instructions List Component
 * Task 8.1: Instructions List Component
 * Task 8.2: Instruction Step Component
 * Task 8.3: Instructions Display Logic
 *
 * Displays auto-numbered recipe instructions
 */

import React from 'react';
import { View, Text } from 'react-native';
import { formatInstructionStep } from '@/lib/utils/recipe-formatter';

export interface InstructionsListProps {
  instructions: string[];
  testID?: string;
}

/**
 * Instructions List Component
 *
 * Displays recipe instructions as automatically numbered steps.
 * Uses formatInstructionStep utility for consistent numbering.
 *
 * Features:
 * - Automatic step numbering
 * - Clean vertical list layout
 * - Dark mode support
 * - Accessibility labels
 * - Empty state handling
 * - Validation and error handling
 *
 * @param props - Component props
 * @returns InstructionsList component
 *
 * @example
 * ```tsx
 * <InstructionsList
 *   instructions={[
 *     'Preheat oven to 350°F',
 *     'Mix dry ingredients',
 *     'Add wet ingredients and stir',
 *   ]}
 * />
 * ```
 */
export function InstructionsList({
  instructions,
  testID = 'instructions-list',
}: InstructionsListProps) {
  // Validate and filter instructions
  const validInstructions = React.useMemo(() => {
    if (!instructions || !Array.isArray(instructions)) {
      return [];
    }
    return instructions.filter(
      (step) => step && typeof step === 'string' && step.trim().length > 0
    );
  }, [instructions]);

  // Handle empty instructions
  if (validInstructions.length === 0) {
    return (
      <View className="px-4 py-6" testID={`${testID}-empty`}>
        <Text className="text-lg font-bold text-black dark:text-white mb-3">
          Instructions
        </Text>
        <Text className="text-sm text-[#8E8E93] italic">
          No instructions provided for this recipe.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 py-6" testID={testID}>
      {/* Section Title */}
      <Text
        className="text-lg font-bold text-black dark:text-white mb-4"
        accessibilityRole="header"
      >
        Instructions
      </Text>

      {/* Instructions List */}
      <View
        className="gap-4"
        accessibilityLabel={`${validInstructions.length} steps`}
      >
        {validInstructions.map((step, index) => (
          <InstructionStep
            key={`instruction-${index}`}
            step={step}
            index={index}
            testID={`${testID}-step-${index}`}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Instruction Step Component
 *
 * Displays a single instruction step with number badge.
 *
 * Features:
 * - Numbered badge (rounded circle)
 * - Step text formatting
 * - Proper spacing between steps
 * - Dark mode support
 * - Accessibility
 *
 * @param props - Component props
 * @returns InstructionStep component
 */
interface InstructionStepProps {
  step: string;
  index: number;
  testID?: string;
}

function InstructionStep({ step, index, testID }: InstructionStepProps) {
  const formattedStep = formatInstructionStep(step, index);

  return (
    <View
      className="flex-row gap-3"
      testID={testID}
      accessibilityLabel={`Step ${formattedStep.number}: ${formattedStep.text}`}
      accessibilityRole="text"
    >
      {/* Step Number Badge */}
      <View className="items-center justify-center w-8 h-8 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] mt-0.5">
        <Text className="text-sm font-bold text-white">
          {formattedStep.number}
        </Text>
      </View>

      {/* Step Text */}
      <Text className="flex-1 text-base text-black dark:text-white leading-relaxed pt-1">
        {formattedStep.text}
      </Text>
    </View>
  );
}
