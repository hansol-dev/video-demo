export const DEMO_VIDEOS = {
  result: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  gallery: [
    {
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=900",
    },
    {
      src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      poster: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=900",
    },
    {
      src: "https://media.w3.org/2010/05/bunny/trailer.mp4",
      poster: "https://images.unsplash.com/photo-1539109132314-3477524c8d95?auto=format&fit=crop&q=80&w=900",
    },
    {
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
      poster: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900",
    },
  ],
};

export function createVideoGenerationPayload(prompt, options) {
  return {
    type: "video.generate",
    prompt,
    model: "neural-video-engine-v4",
    aspect: options.aspect,
    fps: options.fps,
    quality: options.quality,
    duration: 8,
    output: {
      format: "mp4",
      resolution: options.aspect === "16:9" ? "1920x1080" : "1080x1920",
    },
    client: {
      source: "video-demo",
      requestedAt: new Date().toISOString(),
    },
  };
}

export function normalizeVideoJob(job) {
  return {
    jobId: job.jobId || job.id || `job-${Date.now()}`,
    status: job.status || "processing",
    progress: job.progress ?? 0,
    videoUrl: job.videoUrl || job.outputUrl || job.url || "",
    raw: job,
  };
}

export function saveCurrentVideoJob(value) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("video.currentVideoJob", JSON.stringify(value));
}

export function getCurrentVideoJob() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(window.sessionStorage.getItem("video.currentVideoJob"));
  } catch {
    return null;
  }
}
