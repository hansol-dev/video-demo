"use client";

import { useEffect, useState } from "react";
import { DEMO_VIDEOS, getCurrentVideoJob, saveCurrentVideoJob } from "../../lib/video-contract";
import { Navigation } from "../components/Navigation";

export default function ResultPage() {
  const [job, setJob] = useState({
    jobId: "VX-902-B",
    prompt: "Cinematic fashion video",
    videoUrl: DEMO_VIDEOS.result,
    status: "completed",
  });

  useEffect(() => {
    let isCancelled = false;
    const searchParams = new URLSearchParams(window.location.search);
    const saved = getCurrentVideoJob();
    const currentJobId = searchParams.get("jobId") || saved?.job?.jobId || "VX-902-B";
    const currentPrompt = searchParams.get("prompt") || saved?.payload?.prompt || "Cinematic fashion video";

    async function loadResult() {
      const baseJob = {
        jobId: currentJobId,
        prompt: currentPrompt,
        videoUrl: saved?.job?.videoUrl || DEMO_VIDEOS.result,
        status: saved?.job?.status || "completed",
      };

      setJob(baseJob);

      try {
        const response = await fetch(`/api/result/${encodeURIComponent(currentJobId)}`);

        if (!response.ok) {
          throw new Error(`result HTTP ${response.status}`);
        }

        const resultJob = await response.json();
        const nextJob = {
          ...baseJob,
          ...resultJob,
          prompt: currentPrompt,
          videoUrl: resultJob.videoUrl || baseJob.videoUrl,
        };

        if (isCancelled) return;

        setJob(nextJob);
        saveCurrentVideoJob({ payload: saved?.payload || { prompt: currentPrompt }, job: nextJob });
      } catch {
        if (!isCancelled) {
          setJob(baseJob);
        }
      }
    }

    loadResult();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <>
      <div className="glow-filter" />
      <Navigation active="Create" />

      <main className="result-layout">
        <aside className="result-chat-panel">
          <div className="panel-label">PROMPT_CHAT</div>
          <div className="chat-scroll">
            <div className="chat-user">
              <div>{job.prompt}</div>
              <span>USER // PROMPT</span>
            </div>
            <div className="chat-ai">
              <div>Generation request accepted. The result page confirmed the video URL through GET /api/result/{job.jobId}.</div>
              <span>VIDEO.AI // RESULT</span>
            </div>
            <div className="chat-ai">
              <div>Current backend mode uses MCP/mock data until the real video generation provider is connected.</div>
              <span>MCP SERVER // {job.status}</span>
            </div>
          </div>
          <form className="chat-composer">
            <div contentEditable suppressContentEditableWarning aria-label="Edit prompt">
              Edit prompt and regenerate...
            </div>
            <button className="btn-primary small" type="submit">
              Send
            </button>
          </form>
        </aside>

        <section className="result-video-panel">
          <div className="stage-header">
            <a className="back-btn" href="/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              RETURN_TO_EDITOR
            </a>
            <div className="result-system-tag">RENDER_COMPLETE // ID: {job.jobId}</div>
          </div>
          <div className="video-wrapper">
            <video className="main-video" autoPlay muted loop playsInline src={job.videoUrl} />
            <div className="video-controls-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
              <div className="play-progress">
                <div className="play-progress-bar" />
              </div>
              <span>MOCK MP4</span>
            </div>
          </div>
          <div className="result-video-meta">
            <div>
              STATUS: <span>{job.status}</span>
            </div>
            <div>
              SOURCE: <span>GET /api/result</span>
            </div>
            <div>
              ENGINE: <span>MCP_MOCK_PROVIDER</span>
            </div>
          </div>
        </section>

        <aside className="result-info-panel">
          <div className="panel-label compact-label">RELATED_INFO</div>
          <section className="info-block">
            <div className="info-title">PARAMETERS</div>
            <div className="meta-grid">
              <MetaItem label="JOB" value={job.jobId} />
              <MetaItem label="STATUS" value={job.status} />
              <MetaItem label="API" value="/api/result" />
              <MetaItem label="MODE" value="mock" />
            </div>
          </section>
          <section className="info-block">
            <div className="info-title">COLOR_GRADING</div>
            <div className="swatches">
              <span className="swatch-mint" />
              <span className="swatch-magenta" />
              <span className="swatch-black" />
            </div>
          </section>
          <section className="info-block">
            <div className="info-title">NEXT_ACTIONS</div>
            <button className="btn-primary full" type="button">
              Download MP4
            </button>
            <button className="btn-secondary full" type="button">
              Export Project
            </button>
            <button className="btn-secondary full" type="button">
              Share Link
            </button>
          </section>
          <section className="info-block terminal">
            <div>
              <span className="dot" /> RESULT_API: CALLED
            </div>
            <div>
              <span className="dot" /> MCP_MODE: MOCK_READY
            </div>
            <div>VIDEO_URL: {job.videoUrl ? "READY" : "MISSING"}</div>
          </section>
        </aside>
      </main>
    </>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <div className="meta-key">{label}</div>
      <div className="meta-val">{value}</div>
    </div>
  );
}
