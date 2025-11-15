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
}
