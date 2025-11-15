import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { AnalysisRequest, AnalysisResponse, TTSRequest, TTSResponse } from '../models/analysis.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api'; // Vercel serverless functions

  constructor(private http: HttpClient) { }

  /**
   * Analyzes image using GPT-4 Vision or SiliconFlow
   */
  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AnalysisResponse>(`${this.baseUrl}/analyze-vision`, request)
      );
      return response;
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      return {
        success: false,
        error: error.message || 'Failed to analyze image'
      };
    }
  }

  /**
   * Generates audio from text using OpenAI TTS
   */
  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<TTSResponse>(`${this.baseUrl}/generate-tts`, request)
      );
      return response;
    } catch (error: any) {
      console.error('Error generating audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate audio'
      };
    }
  }

  /**
   * Downloads markdown file
   */
  downloadMarkdown(content: string, filename: string = 'analysis.md'): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
