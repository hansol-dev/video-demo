const params = new URLSearchParams(window.location.search);
const page = document.body.dataset.page;
const defaultPrompt = "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상";
const jobStorageKey = "video.currentVideoJob";

document.querySelectorAll("video").forEach((video) => {
  video.play().catch(() => {
    video.controls = true;
  });
});

if (page === "home") setupHomePage();
if (page === "loading") setupLoadingPage();
if (page === "result") setupResultPage();

function setupHomePage() {
  const promptForm = document.querySelector("#promptForm");
  const promptInput = document.querySelector("#promptInput");
  const tokenCount = document.querySelector("#tokenCount");
  const options = { aspect: "16:9", fps: 60, quality: "high" };

  promptInput.addEventListener("input", () => {
    tokenCount.textContent = `TOKENS: ${Math.min(promptInput.value.length, 1000)}/1000`;
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.dataset.aspect) options.aspect = chip.dataset.aspect;
      if (chip.dataset.fps) options.fps = Number(chip.dataset.fps);
      if (chip.dataset.quality) options.quality = chip.dataset.quality;
      if (chip.dataset.prompt) {
        promptInput.value = promptInput.value.trim() ? `${promptInput.value.trim()}, ${chip.dataset.prompt}` : chip.dataset.prompt;
        promptInput.dispatchEvent(new Event("input"));
        promptInput.focus();
      }
    });
  });

  promptForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const prompt = promptInput.value.trim() || promptInput.getAttribute("placeholder") || defaultPrompt;
    const payload = createVideoGenerationPayload(prompt, options);

    try {
      const job = await requestVideoGeneration(payload);
      saveCurrentVideoJob({ payload, job });
      window.location.href = `./loading.html?jobId=${encodeURIComponent(job.jobId)}&prompt=${encodeURIComponent(prompt)}`;
    } catch (error) {
      window.alert(`영상 생성 요청에 실패했습니다: ${error.message}`);
    }
  });
}

function setupLoadingPage() {
  const saved = getCurrentVideoJob();
  const prompt = params.get("prompt") || saved?.payload?.prompt || defaultPrompt;
  const jobId = params.get("jobId") || saved?.job?.jobId || "demo-job";
  const progressBar = document.querySelector("#progressBar");
  const progressPercent = document.querySelector("#progressPercent");
  const renderStage = document.querySelector("#renderStage");
  const renderTask = document.querySelector("#renderTask");
  const activeLog = document.querySelector("#activeLog");
  let progress = 12;

  renderTask.textContent = `${prompt.slice(0, 28)} 렌더링 중...`;
  setProgress(progress, progressBar, progressPercent);

  const timer = window.setInterval(() => {
    progress = Math.min(progress + Math.ceil(Math.random() * 9), 94);
    setProgress(progress, progressBar, progressPercent);
    const frame = Math.max(1, Math.round((progress / 100) * 64));
    activeLog.textContent = `Sampling frame ${frame}/64 (Inference step: ${Math.max(1, Math.round(progress / 4))})`;
  }, 420);

  window.setTimeout(() => {
    window.clearInterval(timer);
    setProgress(100, progressBar, progressPercent);
    renderStage.textContent = "Render Complete";
    renderTask.textContent = "영상 생성이 완료되었습니다.";
    activeLog.textContent = `Output ready: ${jobId}`;

    window.setTimeout(() => {
      window.location.href = `./result.html?jobId=${encodeURIComponent(jobId)}&prompt=${encodeURIComponent(prompt)}`;
    }, 550);
  }, 3600);
}

function setupResultPage() {
  const saved = getCurrentVideoJob();
  const prompt = params.get("prompt") || saved?.payload?.prompt || defaultPrompt;
  const jobId = params.get("jobId") || saved?.job?.jobId || "VX-902-B";
  const videoUrl = saved?.job?.videoUrl;
  const promptText = document.querySelector("#resultPromptText");
  const jobLabel = document.querySelector("#resultJobId");
  const mainVideo = document.querySelector(".main-video");

  promptText.textContent = `${prompt}. 4K 해상도, 필름 그레인 효과 추가.`;
  jobLabel.textContent = `RENDER_COMPLETE // ID: ${jobId}`;

  if (videoUrl && mainVideo) {
    mainVideo.src = videoUrl;
    mainVideo.play().catch(() => {
      mainVideo.controls = true;
    });
  }
}

function createVideoGenerationPayload(prompt, options) {
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

// Backend/MCP 연결은 이 함수 안에서만 처리한다.
// 화면 코드는 응답을 jobId, status, videoUrl 형태로만 사용한다.
async function requestVideoGeneration(payload) {
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

function saveCurrentVideoJob(value) {
  sessionStorage.setItem(jobStorageKey, JSON.stringify(value));
}

function getCurrentVideoJob() {
  try {
    return JSON.parse(sessionStorage.getItem(jobStorageKey));
  } catch {
    return null;
  }
}

function setProgress(value, progressBar, progressPercent) {
  const safeValue = Math.max(0, Math.min(100, value));
  progressBar.style.strokeDashoffset = String(314 - (314 * safeValue) / 100);
  progressPercent.textContent = `${safeValue}%`;
}
