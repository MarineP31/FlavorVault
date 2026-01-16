// Mock React Native - must be complete without requireActual
jest.mock('react-native', () => {
  const React = require('react');

  const mockComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    Pressable: mockComponent('Pressable'),
    ScrollView: mockComponent('ScrollView'),
    ActivityIndicator: mockComponent('ActivityIndicator'),
    Image: mockComponent('Image'),
    Modal: mockComponent('Modal'),
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios || obj.default,
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 667 }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    BackHandler: {
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
    useColorScheme: jest.fn(() => 'light'),
  };
});

// Mock expo-sqlite for testing
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(() => Promise.resolve()),
      runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
      getAllAsync: jest.fn(() => Promise.resolve([])),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      closeAsync: jest.fn(() => Promise.resolve()),
    })
  ),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const mockComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };
  return {
    GestureHandlerRootView: mockComponent('GestureHandlerRootView'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })),
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const mockIcon = (props) => React.createElement('Text', props, props.name);
  return {
    MaterialIcons: mockIcon,
    Ionicons: mockIcon,
  };
});

// Mock @expo/vector-icons/MaterialIcons specifically
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  return (props) => React.createElement('Text', props, props.name);
});

// Mock @expo/vector-icons/Ionicons specifically
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  return (props) => React.createElement('Text', props, props.name);
});

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      const { children, ...otherProps } = props;
      // Expose methods on the ref for testing
      React.useImperativeHandle(ref, () => ({
        expand: jest.fn(),
        close: jest.fn(),
        snapToIndex: jest.fn(),
      }));
      return React.createElement('BottomSheet', { ...otherProps, testID: 'bottom-sheet' }, children);
    }),
    BottomSheetBackdrop: (props) => {
      const React = require('react');
      return React.createElement('BottomSheetBackdrop', { ...props, testID: 'bottom-sheet-backdrop' });
    },
    BottomSheetModalProvider: ({ children }) => children,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  return {
    default: {
      createAnimatedComponent: (Component) => Component,
    },
    createAnimatedComponent: (Component) => Component,
    useSharedValue: (value) => ({ value }),
    useAnimatedStyle: (fn) => fn(),
    withSpring: (value) => value,
    withTiming: (value) => value,
    runOnJS: (fn) => fn,
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props) => React.createElement('Text', props, props.name);
});
