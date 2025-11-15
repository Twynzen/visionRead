import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { CaptureService } from './services/capture.service';
import { ApiService } from './services/api.service';
import { CaptureState, AnalysisRequest } from './models/analysis.model';
import { marked } from 'marked';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSelectModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // State management
  state = signal<CaptureState>({
    isCapturing: false
  });

  selectedProvider: 'openai' | 'siliconflow' = 'openai';
  audioUrl = signal<string | null>(null);
  renderedMarkdown = signal<string>('');

  constructor(
    private captureService: CaptureService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Initiates screen capture and analysis flow
   */
  async captureAndAnalyze(): Promise<void> {
    try {
      // Update state
      this.state.update(s => ({ ...s, isCapturing: true, error: undefined }));

      this.showMessage('Select screen to capture...');

      // Step 1: Capture screen
      const imageData = await this.captureService.captureScreen();
      this.state.update(s => ({ ...s, imageData }));

      this.showMessage('Analyzing with AI...');

      // Step 2: Analyze with AI
      const analysisRequest: AnalysisRequest = {
        imageData: this.captureService.extractBase64(imageData),
        useProvider: this.selectedProvider
      };

      const analysis = await this.apiService.analyzeImage(analysisRequest);

      if (!analysis.success) {
        throw new Error(analysis.error || 'Analysis failed');
      }

      this.state.update(s => ({ ...s, analysis }));

      // Render markdown
      if (analysis.markdown) {
        const html = await marked.parse(analysis.markdown);
        this.renderedMarkdown.set(html);
      }

      this.showMessage('Analysis complete!');

      // Step 3: Generate audio
      if (analysis.analysis) {
        this.showMessage('Generating audio...');
        await this.generateAudio(analysis.analysis);
      }

    } catch (error: any) {
      console.error('Error:', error);
      this.state.update(s => ({
        ...s,
        error: error.message || 'An error occurred'
      }));
      this.showMessage(error.message || 'An error occurred', 'error');
    } finally {
      this.state.update(s => ({ ...s, isCapturing: false }));
    }
  }

  /**
   * Generates audio from text
   */
  async generateAudio(text: string): Promise<void> {
    try {
      const response = await this.apiService.generateAudio({
        text,
        voice: 'nova',
        speed: 1.0
      });

      if (response.success && response.audioUrl) {
        this.audioUrl.set(response.audioUrl);
        this.showMessage('Audio ready!');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  }

  /**
   * Downloads markdown file
   */
  downloadMarkdown(): void {
    const analysis = this.state().analysis;
    if (analysis?.markdown) {
      this.apiService.downloadMarkdown(
        analysis.markdown,
        `snapsight-${Date.now()}.md`
      );
      this.showMessage('Markdown downloaded!');
    }
  }

  /**
   * Plays the generated audio
   */
  playAudio(): void {
    const url = this.audioUrl();
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  }

  /**
   * Shows snackbar message
   */
  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar'
    });
  }
}
