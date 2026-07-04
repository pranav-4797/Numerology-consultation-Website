/**
 * Image utility for converting files to Base64 data URLs.
 * This approach stores images directly in Firestore documents,
 * avoiding the need for Firebase Storage (which requires Blaze plan).
 *
 * Limitations:
 * - Firestore documents have a 1MB size limit
 * - Images are compressed/resized to stay under this limit
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const QUALITY = 0.7;

/**
 * Compresses and converts a File to a Base64 data URL string.
 * Images are resized to max 1200x800 and compressed to ~70% quality.
 */
export function compressAndConvertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if necessary
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for better compression
        const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
