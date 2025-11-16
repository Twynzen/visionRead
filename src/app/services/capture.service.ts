import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {

  /**
   * Captures screen using browser's Screen Capture API
   * Returns base64 encoded image
   */
  async captureScreen(): Promise<string> {
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(video, 0, 0);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const base64Image = canvas.toDataURL('image/png');

      return base64Image;
    } catch (error) {
      console.error('Error capturing screen:', error);
      throw new Error('Failed to capture screen. Please ensure you granted permission.');
    }
  }

  /**
   * Extracts base64 data from data URL
   */
  extractBase64(dataUrl: string): string {
    return dataUrl.split(',')[1];
  }

  /**
   * Converts a File object to base64 data URL
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Handles clipboard paste events
   * Returns base64 image if clipboard contains an image
   */
  async handleClipboardPaste(event: ClipboardEvent): Promise<string | null> {
    const items = event.clipboardData?.items;

    if (!items) {
      return null;
    }

    // Look for image in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          return await this.fileToBase64(file);
        }
      }
    }

    return null;
  }
}
