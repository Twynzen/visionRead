/**
 * Analysis Models for SnapSight AI
 */

export interface AnalysisRequest {
  imageData: string; // Base64 encoded image
  prompt?: string; // Optional custom prompt
  useProvider?: 'openai' | 'siliconflow'; // API provider selection
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: string;
  markdown?: string;
  audioUrl?: string;
  error?: string;
  timestamp?: Date;
  provider?: string;
}

export interface TTSRequest {
  text: string;
  voice?: 'nova' | 'alloy' | 'echo' | 'shimmer';
  speed?: number; // 0.25 to 4.0
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export interface CaptureState {
  isCapturing: boolean;
  imageData?: string;
  analysis?: AnalysisResponse;
  error?: string;
}
