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
      source: "video-demo-react",
      requestedAt: new Date().toISOString(),
    },
  };
}

// Backend/MCP 연결은 이 함수 안에서만 처리한다.
// 화면 코드는 응답을 jobId, status, videoUrl 형태로만 사용한다.
export async function requestVideoGeneration(payload) {
  window.dispatchEvent(new CustomEvent("video:generate", { detail: payload }));

  if (window.videoGenerationMcp?.generateVideo) {
    return normalizeVideoJob(await window.videoGenerationMcp.generateVideo(payload));
  }

  if (window.VIDEO_GENERATE_ENDPOINT) {
    const response = await fetch(window.VIDEO_GENERATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return normalizeVideoJob(await response.json());
  }

  return normalizeVideoJob({
    jobId: `demo-${Date.now()}`,
    status: "processing",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  });
}

function normalizeVideoJob(job) {
  return {
    jobId: job.jobId || job.id || `job-${Date.now()}`,
    status: job.status || "processing",
    videoUrl: job.videoUrl || job.outputUrl || job.url || "",
    raw: job,
  };
}
