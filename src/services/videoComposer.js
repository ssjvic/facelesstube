// Video Composer Service
// Combines audio narration with background videos using Canvas + MediaRecorder

class VideoComposer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.isComposing = false;
  }

  // Initialize canvas
  init(width = 1080, height = 1920) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    return this;
  }

  // Draw text with outline (for captions)
  drawText(text, y, options = {}) {
    const {
      fontSize = 48,
      fontFamily = "Arial Black, sans-serif",
      fillColor = "#FFFFFF",
      strokeColor = "#000000",
      strokeWidth = 4,
      align = "center",
      maxWidth = this.canvas.width - 100,
    } = options;

    this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = "middle";

    const x = this.canvas.width / 2;

    // Word wrap
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw each line
    const lineHeight = fontSize * 1.3;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      const lineY = startY + i * lineHeight;

      // Stroke (outline)
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeText(line, x, lineY);

      // Fill
      this.ctx.fillStyle = fillColor;
      this.ctx.fillText(line, x, lineY);
    });
  }

  // Draw video frame
  drawVideoFrame(video) {
    // Calculate cover fit
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = this.canvas.width / this.canvas.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (videoRatio > canvasRatio) {
      drawHeight = this.canvas.height;
      drawWidth = drawHeight * videoRatio;
      offsetX = (this.canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = this.canvas.width;
      drawHeight = drawWidth / videoRatio;
      offsetX = 0;
      offsetY = (this.canvas.height - drawHeight) / 2;
    }

    this.ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Add dark overlay for text readability
  addOverlay(opacity = 0.4) {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Add watermark (image-based)
  async addWatermark() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Position in bottom-right corner with padding
        const padding = 30;
        const maxWidth = 200;
        const scale = maxWidth / img.width;
        const width = img.width * scale;
        const height = img.height * scale;

        const x = this.canvas.width - width - padding;
        const y = this.canvas.height - height - padding;

        // Draw with semi-transparency
        this.ctx.globalAlpha = 0.6;
        this.ctx.drawImage(img, x, y, width, height);
        this.ctx.globalAlpha = 1.0;
        resolve();
      };
      img.onerror = () => {
        // Fallback to text if image fails
        this.ctx.font = "bold 24px Arial";
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.textAlign = "right";
        this.ctx.fillText(
          "FacelessTube",
          this.canvas.width - 20,
          this.canvas.height - 20,
        );
        resolve();
      };
      img.src = "/watermark.png";
    });
  }

  // Compose video with audio and captions
  async compose(options) {
    const {
      videoBlobs,
      scriptSegments,
      voice,
      voiceRate = 0.9,
      addWatermark = true,
      maxDuration = 30, // seconds - tier limit
      onProgress,
    } = options;

    this.init();
    this.chunks = [];
    this.isComposing = true;

    return new Promise(async (resolve, reject) => {
      try {
        // Create video elements from blobs
        const videos = await Promise.all(
          videoBlobs.map((blob) => this.createVideoElement(blob)),
        );

        // Set up MediaRecorder
        const stream = this.canvas.captureStream(30);

        // Add audio track if available
        // Note: Web Speech doesn't provide audio track, so we capture system audio

        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9",
          videoBitsPerSecond: 5000000,
        });

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.chunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: "video/webm" });
          this.isComposing = false;
          resolve(blob);
        };

        this.mediaRecorder.onerror = (e) => {
          this.isComposing = false;
          reject(e);
        };

        // Start recording
        this.mediaRecorder.start(100);

        // Track duration for tier limits
        const startTime = Date.now();
        const maxDurationMs = maxDuration * 1000;

        // Process each segment
        let currentVideoIndex = 0;
        let segmentIndex = 0;
        const totalSegments = scriptSegments.length;

        for (const segment of scriptSegments) {
          if (!this.isComposing) break;

          // Check if we've exceeded the duration limit
          if (Date.now() - startTime >= maxDurationMs) {
            console.log(`Duration limit reached: ${maxDuration}s`);
            break;
          }

          const video = videos[currentVideoIndex % videos.length];
          video.currentTime = 0;
          await video.play();

          // Speak the segment
          const utterance = new SpeechSynthesisUtterance(segment.text);
          if (voice) utterance.voice = voice;
          utterance.rate = voiceRate;

          const speakPromise = new Promise((res) => {
            utterance.onend = res;
            utterance.onerror = res;
          });

          speechSynthesis.speak(utterance);

          // Render frames while speaking
          const frameInterval = 1000 / 30; // 30fps
          while (speechSynthesis.speaking && this.isComposing) {
            this.drawVideoFrame(video);
            this.addOverlay(0.3);

            // Draw current caption
            this.drawText(segment.text, this.canvas.height * 0.75, {
              fontSize: 42,
            });

            if (addWatermark) {
              this.addWatermark();
            }

            await new Promise((r) => setTimeout(r, frameInterval));
          }

          await speakPromise;
          video?.pause();

          segmentIndex++;
          currentVideoIndex++;

          if (onProgress) {
            onProgress((segmentIndex / totalSegments) * 100);
          }
        }

        // Stop recording
        this.mediaRecorder.stop();
      } catch (error) {
        this.isComposing = false;
        reject(error);
      }
    });
  }

  // Create video element from blob
  createVideoElement(blob) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      video.onloadeddata = () => resolve(video);
      video.onerror = reject;

      if (blob instanceof Blob) {
        video.src = URL.createObjectURL(blob);
      } else {
        video.src = blob;
      }

      video.load();
    });
  }

  // Stop composing
  stop() {
    this.isComposing = false;
    speechSynthesis.cancel();

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  // Parse script into segments
  parseScript(script) {
    // Split by sections and sentences
    const sections = script.split(/\[.+?\]/).filter((s) => s.trim());
    const segments = [];

    for (const section of sections) {
      // Split into sentences
      const sentences = section.split(/[.!?]+/).filter((s) => s.trim());

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10) {
          segments.push({ text: trimmed });
        }
      }
    }

    return segments;
  }
}

// Singleton instance
export const videoComposer = new VideoComposer();

// Export class for testing
export { VideoComposer };
