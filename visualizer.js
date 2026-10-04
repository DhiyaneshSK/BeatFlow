/**
 * BeatFlow Visualizer (HTML5 Canvas Equalizer)
 * Animates glowing DAW equalizer frequency bars at 60 FPS in sync with the audio state.
 * Built with a CORS-immune mock renderer to bypass cross-origin browser media blocks.
 */

class BeatFlowVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.audioElement = null;
    this.animationId = null;
    this.isActive = false;

    // Handle high DPI screens and initial size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resizes the canvas to match its client bounding rect scaled for high-DPI displays.
   */
  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
  }

  /**
   * Connects the visualizer to the audio element.
   * Runs natively without AudioContext to guarantee CORS safety for all CDN files.
   * @param {HTMLAudioElement} audioElement 
   */
  connect(audioElement) {
    this.audioElement = audioElement;
    this.resume();
  }

  /**
   * Continuous requestAnimationFrame loop running at ~60 FPS.
   */
  drawLoop() {
    if (!this.isActive) return;

    this.animationId = requestAnimationFrame(() => this.drawLoop());

    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas frame
    this.ctx.clearRect(0, 0, width, height);

    const isAudioPlaying = this.audioElement && !this.audioElement.paused && !this.audioElement.ended;

    const bufferLength = 16; // 16 frequency bands
    const barSpacing = 4 * (window.devicePixelRatio || 1);
    const totalSpacing = barSpacing * (bufferLength - 1);
    const barWidth = (width - totalSpacing) / bufferLength;
    
    // Draw neon DAW gradient
    const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#7c3aed');   // Deep Purple
    gradient.addColorStop(0.5, '#c084fc'); // Bright Purple
    gradient.addColorStop(1, '#00ffd2');   // Neon Cyan

    const time = Date.now() * 0.003;

    for (let i = 0; i < bufferLength; i++) {
      let barHeight = 3; // Keep a small visible floor bar for an aesthetic DAW visualizer grid

      if (isAudioPlaying) {
        // Generate an organic, moving waveform using double sine waves + noise, scaled by the player volume
        const wave1 = Math.sin(i * 0.4 + time) * 0.5 + 0.5;
        const wave2 = Math.cos(i * 0.7 - time * 1.5) * 0.3 + 0.5;
        const noise = Math.random() * 0.2;
        const volumeFactor = this.audioElement.muted ? 0 : this.audioElement.volume;

        barHeight = (wave1 + wave2 + noise) * height * 0.45 * volumeFactor;
        
        if (barHeight < 3) {
          barHeight = 3;
        }
        if (barHeight > height) {
          barHeight = height;
        }
      }

      const x = i * (barWidth + barSpacing);
      const y = height - barHeight;

      this.ctx.fillStyle = gradient;
      
      // Draw smooth rounded rectangles for the EQ bars
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(x, y, barWidth, barHeight, 2 * (window.devicePixelRatio || 1));
      } else {
        this.ctx.rect(x, y, barWidth, barHeight);
      }
      this.ctx.fill();
    }
  }

  /**
   * Resumes visualizer animation loop.
   */
  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.drawLoop();
    }
  }

  /**
   * Suspends drawing computations.
   */
  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Export visualizer globally
window.BeatFlowVisualizer = BeatFlowVisualizer;
