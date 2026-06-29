"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_VIDEOS, getCurrentVideoJob, saveCurrentVideoJob } from "../../lib/video-contract";
import { Navigation } from "../components/Navigation";

const MIN_LOADING_MS = 1800;
const STATUS_POLL_MS = 900;

export default function LoadingPage() {
  const [progress, setProgress] = useState(12);
  const [prompt, setPrompt] = useState("Cinematic video");
  const [jobId, setJobId] = useState("demo-job");
  const [statusText, setStatusText] = useState("Preparing render job");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const saved = getCurrentVideoJob();
    const currentPrompt = searchParams.get("prompt") || saved?.payload?.prompt || "Cinematic video";
    const currentJobId = searchParams.get("jobId") || saved?.job?.jobId || "demo-job";

    setPrompt(currentPrompt);
    setJobId(currentJobId);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let pollTimer;
    const startedAt = Date.now();

    async function waitForMinimumLoadingTime() {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= MIN_LOADING_MS) return;

      await new Promise((resolve) => {
        window.setTimeout(resolve, MIN_LOADING_MS - elapsed);
      });
    }

    async function fetchJobResult(statusJob) {
      setStatusText("Fetching final video URL");

      const response = await fetch(`/api/result/${encodeURIComponent(jobId)}`);

      if (!response.ok) {
        throw new Error(`result HTTP ${response.status}`);
      }

      const resultJob = await response.json();

      return {
        ...statusJob,
        ...resultJob,
        jobId,
        status: resultJob.status || statusJob.status || "completed",
        progress: resultJob.progress ?? statusJob.progress ?? 100,
        videoUrl: resultJob.videoUrl || statusJob.videoUrl || DEMO_VIDEOS.result,
      };
    }

    async function finish(statusJob) {
      await waitForMinimumLoadingTime();
      if (isCancelled) return;

      const finalJob = await fetchJobResult(statusJob);
      if (isCancelled) return;

      setProgress(100);
      setStatusText("Render complete");

      const saved = getCurrentVideoJob();
      saveCurrentVideoJob({ payload: saved?.payload || { prompt }, job: finalJob });

      window.setTimeout(() => {
        if (!isCancelled) {
          window.location.href = `/result?jobId=${encodeURIComponent(jobId)}&prompt=${encodeURIComponent(prompt)}`;
        }
      }, 550);
    }

    async function pollStatus() {
      try {
        setStatusText("Checking render status");

        const response = await fetch(`/api/status/${encodeURIComponent(jobId)}`);

        if (!response.ok) {
          throw new Error(`status HTTP ${response.status}`);
        }

        const statusJob = await response.json();
        const nextProgress = statusJob.progress ?? 0;

        setProgress((current) => Math.max(current, Math.min(nextProgress, 99)));

        if (statusJob.status === "completed") {
          await finish(statusJob);
          return;
        }

        if (statusJob.status === "failed") {
          throw new Error("Video job failed");
        }

        pollTimer = window.setTimeout(pollStatus, STATUS_POLL_MS);
      } catch (error) {
        if (isCancelled) return;

        const saved = getCurrentVideoJob();
        const fallbackJob = {
          ...(saved?.job || {}),
          jobId,
          status: "completed",
          progress: 100,
          videoUrl: saved?.job?.videoUrl || DEMO_VIDEOS.result,
          raw: {
            fallbackReason: error.message,
          },
        };

        await finish(fallbackJob);
      }
    }

    pollStatus();

    return () => {
      isCancelled = true;
      window.clearTimeout(pollTimer);
    };
  }, [jobId, prompt]);

  const frame = useMemo(() => Math.max(1, Math.round((progress / 100) * 64)), [progress]);
  const dashOffset = 314 - (314 * progress) / 100;

  return (
    <>
      <div className="glow-filter" />
      <Navigation />
      <main className="processing-container">
        <div className="video-canvas-wrapper">
          <div className="preview-noise" />
          <div className="neural-grid" />
          <div className="scanning-line" />
          <div className="loading-overlay">
            <div className="progress-circle">
              <svg className="progress-svg" width="120" height="120">
                <circle className="progress-bg" cx="60" cy="60" r="50" />
                <circle className="progress-bar" cx="60" cy="60" r="50" style={{ strokeDashoffset: dashOffset }} />
              </svg>
              <div className="percentage">{progress}%</div>
            </div>
            <div className="status-info">
              <div className="status-title">{progress >= 100 ? "Render Complete" : "Computing Latent Frames"}</div>
              <div className="current-task">{progress >= 100 ? "Video result is ready." : `${prompt.slice(0, 28)} rendering...`}</div>
              <div className="log-terminal">
                <div className="log-line">
                  <span>[API]</span>
                  <span>POST /api/generate accepted job {jobId}</span>
                </div>
                <div className="log-line">
                  <span>[POLL]</span>
                  <span>GET /api/status/{jobId}</span>
                </div>
                <div className="log-line">
                  <span>[RESULT]</span>
                  <span>{progress >= 100 ? "GET /api/result completed" : statusText}</span>
                </div>
                <div className="log-line">
                  <span>[FRAME]</span>
                  <span className="active-text">{progress >= 100 ? `Output ready: ${jobId}` : `Sampling frame ${frame}/64`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="action-bar">
          <a className="btn-outline" href="/">
            Cancel job
          </a>
          <button className="btn-outline" type="button">
            Run in background
          </button>
          <button className="btn-outline notify-btn" type="button">
            Notify when done
          </button>
        </div>
      </main>
      <div className="mcp-indicator">
        <div className="status-dot" />
        <span>RENDER_CORE: MCP_MOCK // POLLING: /api/status // RESULT: /api/result</span>
      </div>
    </>
  );
}
