import { SupabaseError } from '../client';

const mockGetCurrentUserId = jest.fn();
const mockStorageUpload = jest.fn();
const mockStorageRemove = jest.fn();
const mockStorageGetPublicUrl = jest.fn();
const mockOptimizeImage = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockDeleteAsync = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
        getPublicUrl: mockStorageGetPublicUrl,
      })),
    },
  },
  getCurrentUserId: () => mockGetCurrentUserId(),
  SupabaseError: class MockSupabaseError extends Error {
    public readonly code: string;
    public readonly originalError?: unknown;
    constructor(code: string, message: string, originalError?: unknown) {
      super(message);
      this.name = 'SupabaseError';
      this.code = code;
      this.originalError = originalError;
    }
  },
}));

jest.mock('@/lib/utils/image-processor', () => ({
  optimizeImage: (...args: unknown[]) => mockOptimizeImage(...args),
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: (...args: unknown[]) => mockReadAsStringAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
  documentDirectory: 'file:///data/user/0/com.app/files/',
  cacheDirectory: 'file:///data/user/0/com.app/cache/',
  EncodingType: { Base64: 'base64' },
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn((base64: string) => new ArrayBuffer(base64.length)),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

import {
  isLocalFileUri,
  isSupabaseStorageUrl,
  uploadRecipeImage,
  deleteRecipeImage,
  uploadImageIfLocal,
} from '../image-storage';

describe('image-storage', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue(mockUserId);
  });

  describe('isLocalFileUri', () => {
    it('should return true for file:// URIs', () => {
      expect(isLocalFileUri('file:///path/to/image.jpg')).toBe(true);
    });

    it('should return true for absolute paths', () => {
      expect(isLocalFileUri('/var/mobile/image.jpg')).toBe(true);
    });

    it('should return true for document directory paths', () => {
      expect(isLocalFileUri('file:///data/user/0/com.app/files/image.jpg')).toBe(true);
    });

    it('should return true for cache directory paths', () => {
      expect(isLocalFileUri('file:///data/user/0/com.app/cache/image.jpg')).toBe(true);
    });

    it('should return false for http URLs', () => {
      expect(isLocalFileUri('https://example.com/image.jpg')).toBe(false);
    });

    it('should return false for Supabase storage URLs', () => {
      expect(isLocalFileUri('https://abc.supabase.co/storage/v1/object/public/recipe-images/user-123/img.jpg')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLocalFileUri(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isLocalFileUri(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isLocalFileUri('')).toBe(false);
    });
  });

  describe('isSupabaseStorageUrl', () => {
    it('should return true for Supabase storage URLs', () => {
      expect(isSupabaseStorageUrl('https://abc.supabase.co/storage/v1/object/public/recipe-images/user/img.jpg')).toBe(true);
    });

    it('should return false for local file URIs', () => {
      expect(isSupabaseStorageUrl('file:///path/to/image.jpg')).toBe(false);
    });

    it('should return false for other URLs', () => {
      expect(isSupabaseStorageUrl('https://example.com/image.jpg')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isSupabaseStorageUrl(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSupabaseStorageUrl(undefined)).toBe(false);
    });
  });

  describe('uploadRecipeImage', () => {
    const localUri = 'file:///path/to/local/image.jpg';
    const optimizedUri = 'file:///path/to/optimized/image.jpg';
    const publicUrl = 'https://abc.supabase.co/storage/v1/object/public/recipe-images/user-123/mock-uuid-1234.jpg';

    beforeEach(() => {
      mockOptimizeImage.mockResolvedValue(optimizedUri);
      mockReadAsStringAsync.mockResolvedValue('base64encodedimage');
      mockStorageUpload.mockResolvedValue({ error: null });
      mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl } });
      mockDeleteAsync.mockResolvedValue(undefined);
    });

    it('should optimize image before uploading', async () => {
      await uploadRecipeImage(localUri);

      expect(mockOptimizeImage).toHaveBeenCalledWith(localUri, {
        maxWidth: 1200,
        quality: 0.8,
        format: 'jpeg',
      });
    });

    it('should read optimized image as base64', async () => {
      await uploadRecipeImage(localUri);

      expect(mockReadAsStringAsync).toHaveBeenCalledWith(optimizedUri, {
        encoding: 'base64',
      });
    });

    it('should upload to Supabase storage with correct path', async () => {
      await uploadRecipeImage(localUri);

      expect(mockStorageUpload).toHaveBeenCalledWith(
        `${mockUserId}/mock-uuid-1234.jpg`,
        expect.any(ArrayBuffer),
        { contentType: 'image/jpeg', upsert: false }
      );
    });

    it('should return public URL on success', async () => {
      const result = await uploadRecipeImage(localUri);

      expect(result).toBe(publicUrl);
    });

    it('should clean up temporary optimized file', async () => {
      await uploadRecipeImage(localUri);

      expect(mockDeleteAsync).toHaveBeenCalledWith(optimizedUri, { idempotent: true });
    });

    it('should not delete original if optimized URI is same', async () => {
      mockOptimizeImage.mockResolvedValue(localUri);

      await uploadRecipeImage(localUri);

      expect(mockDeleteAsync).not.toHaveBeenCalled();
    });

    it('should throw SupabaseError on upload failure', async () => {
      mockStorageUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

      await expect(uploadRecipeImage(localUri)).rejects.toThrow('Failed to upload image');
    });

    it('should throw SupabaseError when not authenticated', async () => {
      mockGetCurrentUserId.mockRejectedValue(new Error('Not authenticated'));

      await expect(uploadRecipeImage(localUri)).rejects.toThrow();
    });
  });

  describe('deleteRecipeImage', () => {
    const imageUrl = 'https://abc.supabase.co/storage/v1/object/public/recipe-images/user-123/image.jpg';

    beforeEach(() => {
      mockStorageRemove.mockResolvedValue({ error: null });
    });

    it('should extract path and delete from storage', async () => {
      await deleteRecipeImage(imageUrl);

      expect(mockStorageRemove).toHaveBeenCalledWith(['user-123/image.jpg']);
    });

    it('should do nothing for non-Supabase URLs', async () => {
      await deleteRecipeImage('https://example.com/image.jpg');

      expect(mockStorageRemove).not.toHaveBeenCalled();
    });

    it('should do nothing for local file URIs', async () => {
      await deleteRecipeImage('file:///path/to/image.jpg');

      expect(mockStorageRemove).not.toHaveBeenCalled();
    });

    it('should throw SupabaseError on delete failure', async () => {
      mockStorageRemove.mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(deleteRecipeImage(imageUrl)).rejects.toThrow('Failed to delete image');
    });

    it('should handle URL-encoded paths', async () => {
      const encodedUrl = 'https://abc.supabase.co/storage/v1/object/public/recipe-images/user-123/my%20image.jpg';

      await deleteRecipeImage(encodedUrl);

      expect(mockStorageRemove).toHaveBeenCalledWith(['user-123/my image.jpg']);
    });
  });

  describe('uploadImageIfLocal', () => {
    const localUri = 'file:///path/to/image.jpg';
    const optimizedUri = 'file:///path/to/optimized.jpg';
    const publicUrl = 'https://abc.supabase.co/storage/v1/object/public/recipe-images/user-123/mock-uuid-1234.jpg';
    const existingUrl = 'https://abc.supabase.co/storage/v1/object/public/recipe-images/existing.jpg';

    beforeEach(() => {
      mockOptimizeImage.mockResolvedValue(optimizedUri);
      mockReadAsStringAsync.mockResolvedValue('base64');
      mockStorageUpload.mockResolvedValue({ error: null });
      mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl } });
      mockDeleteAsync.mockResolvedValue(undefined);
    });

    it('should upload local file and return public URL', async () => {
      const result = await uploadImageIfLocal(localUri);

      expect(result).toBe(publicUrl);
      expect(mockStorageUpload).toHaveBeenCalled();
    });

    it('should return existing URL unchanged', async () => {
      const result = await uploadImageIfLocal(existingUrl);

      expect(result).toBe(existingUrl);
      expect(mockStorageUpload).not.toHaveBeenCalled();
    });

    it('should return null for null input', async () => {
      const result = await uploadImageIfLocal(null);

      expect(result).toBeNull();
      expect(mockStorageUpload).not.toHaveBeenCalled();
    });

    it('should return null for undefined input', async () => {
      const result = await uploadImageIfLocal(undefined);

      expect(result).toBeNull();
      expect(mockStorageUpload).not.toHaveBeenCalled();
    });
  });
});
