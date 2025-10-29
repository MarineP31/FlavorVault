import * as Crypto from 'expo-crypto';

// Polyfill for crypto.getRandomValues() which is required by uuid library in React Native
if (typeof global.crypto !== 'object') {
  global.crypto = {} as any;
}

if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = ((array: Uint8Array) => {
    // expo-crypto returns a hex string, we need to convert it to bytes
    const randomBytes = Crypto.getRandomBytes(array.length);
    array.set(randomBytes);
    return array;
  }) as any;
}
