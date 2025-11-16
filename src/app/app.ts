import { Component, signal, OnInit, HostListener } from '@angular/core';
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
export class App implements OnInit {
  // State management
  state = signal<CaptureState>({
    isCapturing: false,
    isPreviewing: false,
    isAnalyzing: false
  });

  selectedProvider: 'openai' | 'siliconflow' = 'openai';
  audioUrl = signal<string | null>(null);
  renderedMarkdown = signal<string>('');

  constructor(
    private captureService: CaptureService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.showMessage('Ready! Capture, upload, or paste an image (Ctrl+V)', 'success');
  }

  /**
   * Listens for clipboard paste events
   */
  @HostListener('window:paste', ['$event'])
  async onPaste(event: ClipboardEvent): Promise<void> {
    try {
      const imageData = await this.captureService.handleClipboardPaste(event);

      if (imageData) {
        this.loadImage(imageData, 'clipboard');
        this.showMessage('Image pasted from clipboard!');
      }
    } catch (error: any) {
      this.showMessage(error.message || 'Failed to paste image', 'error');
    }
  }

  /**
   * Captures screen and loads for preview
   */
  async captureScreen(): Promise<void> {
    try {
      this.state.update(s => ({ ...s, isCapturing: true, error: undefined }));
      this.showMessage('Select screen to capture...');

      const imageData = await this.captureService.captureScreen();
      this.loadImage(imageData, 'screen capture');

    } catch (error: any) {
      console.error('Error capturing screen:', error);
      this.state.update(s => ({
        ...s,
        error: error.message || 'Failed to capture screen'
      }));
      this.showMessage(error.message || 'Failed to capture screen', 'error');
    } finally {
      this.state.update(s => ({ ...s, isCapturing: false }));
    }
  }

  /**
   * Handles file upload
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const imageData = await this.captureService.fileToBase64(file);
      this.loadImage(imageData, 'upload');
      this.showMessage('Image uploaded successfully!');
    } catch (error: any) {
      this.showMessage(error.message || 'Failed to upload image', 'error');
    }

    // Reset input
    input.value = '';
  }

  /**
   * Handles drag and drop
   */
  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer?.files[0];
    if (!file) return;

    try {
      const imageData = await this.captureService.fileToBase64(file);
      this.loadImage(imageData, 'drag & drop');
      this.showMessage('Image loaded successfully!');
    } catch (error: any) {
      this.showMessage(error.message || 'Failed to load image', 'error');
    }
  }

  /**
   * Prevents default drag behavior
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Loads image into preview state
   */
  private loadImage(imageData: string, source: string): void {
    this.state.update(s => ({
      ...s,
      imageData,
      isPreviewing: true,
      analysis: undefined,
      error: undefined
    }));
    this.audioUrl.set(null);
    this.renderedMarkdown.set('');
  }

  /**
   * Analyzes the loaded image with AI
   */
  async analyzeImage(): Promise<void> {
    const imageData = this.state().imageData;
    if (!imageData) return;

    try {
      this.state.update(s => ({
        ...s,
        isAnalyzing: true,
        isPreviewing: false,
        error: undefined
      }));

      this.showMessage('Analyzing with AI...');

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

      // Generate audio
      if (analysis.analysis) {
        this.showMessage('Generating audio...');
        await this.generateAudio(analysis.analysis);
      }

    } catch (error: any) {
      console.error('Error analyzing image:', error);
      this.state.update(s => ({
        ...s,
        error: error.message || 'Analysis failed',
        isPreviewing: true
      }));
      this.showMessage(error.message || 'Analysis failed', 'error');
    } finally {
      this.state.update(s => ({ ...s, isAnalyzing: false }));
    }
  }

  /**
   * Cancels preview and clears image
   */
  cancelPreview(): void {
    this.state.update(s => ({
      ...s,
      imageData: undefined,
      isPreviewing: false,
      analysis: undefined,
      error: undefined
    }));
    this.audioUrl.set(null);
    this.renderedMarkdown.set('');
    this.showMessage('Preview canceled');
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
