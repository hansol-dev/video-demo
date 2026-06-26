"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_VIDEOS, getCurrentVideoJob, saveCurrentVideoJob } from "../../lib/video-contract";
import { Navigation } from "../components/Navigation";

export default function LoadingPage() {
  const [progress, setProgress] = useState(12);
  const [prompt, setPrompt] = useState("시네마틱 영상");
  const [jobId, setJobId] = useState("demo-job");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const saved = getCurrentVideoJob();
    const currentPrompt = searchParams.get("prompt") || saved?.payload?.prompt || "시네마틱 영상";
    const currentJobId = searchParams.get("jobId") || saved?.job?.jobId || "demo-job";

    setPrompt(currentPrompt);
    setJobId(currentJobId);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.ceil(Math.random() * 9), 94));
    }, 420);

    const finishTimer = window.setTimeout(() => {
      window.clearInterval(timer);
      setProgress(100);

      const saved = getCurrentVideoJob();
      const nextJob = {
        ...(saved?.job || {}),
        jobId,
        status: "completed",
        videoUrl: saved?.job?.videoUrl || DEMO_VIDEOS.result,
      };

      saveCurrentVideoJob({ payload: saved?.payload || { prompt }, job: nextJob });

      window.setTimeout(() => {
        window.location.href = `/result?jobId=${encodeURIComponent(jobId)}&prompt=${encodeURIComponent(prompt)}`;
      }, 550);
    }, 3600);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finishTimer);
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
              <div className="current-task">{progress >= 100 ? "영상 생성이 완료되었습니다." : `${prompt.slice(0, 28)} 렌더링 중...`}</div>
              <div className="log-terminal">
                <div className="log-line">
                  <span>[14:22:01]</span>
                  <span>Initializing Diffusion Model V.4.02</span>
                </div>
                <div className="log-line">
                  <span>[14:22:04]</span>
                  <span>Encoding prompt semantics: DONE</span>
                </div>
                <div className="log-line">
                  <span>[14:22:08]</span>
                  <span>Generating noise seeds: [0x44F...82A]</span>
                </div>
                <div className="log-line">
                  <span>[14:22:12]</span>
                  <span className="active-text">{progress >= 100 ? `Output ready: ${jobId}` : `Sampling frame ${frame}/64 (Inference step: ${Math.max(1, Math.round(progress / 4))})`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="action-bar">
          <a className="btn-outline" href="/">
            작업 취소 (ESC)
          </a>
          <button className="btn-outline" type="button">
            백그라운드에서 실행
          </button>
          <button className="btn-outline notify-btn" type="button">
            완료 시 알림받기
          </button>
        </div>
      </main>
      <div className="mcp-indicator">
        <div className="status-dot" />
        <span>RENDER_CORE: GPU_CLUSTER_A // LOAD: 82% // EST_TIME: 14S</span>
      </div>
    </>
  );
}
