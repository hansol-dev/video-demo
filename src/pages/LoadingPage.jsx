import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar.jsx";

export default function LoadingPage({ request, onComplete, onCancel }) {
  const prompt = request?.payload.prompt || "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상";
  const jobId = request?.job.jobId || "demo-job";
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.ceil(Math.random() * 9), 94));
    }, 420);

    const completeTimer = window.setTimeout(() => {
      window.clearInterval(timer);
      setProgress(100);

      window.setTimeout(onComplete, 550);
    }, 3600);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const frame = Math.max(1, Math.round((progress / 100) * 64));
  const dashOffset = 314 - (314 * progress) / 100;

  return (
    <>
      <NavBar userLabel="ID: USER_7721" />
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
                <div className="log-line"><span>[14:22:01]</span><span>Initializing Diffusion Model V.4.02</span></div>
                <div className="log-line"><span>[14:22:04]</span><span>Encoding prompt semantics: DONE</span></div>
                <div className="log-line"><span>[14:22:08]</span><span>Generating noise seeds: [0x44F...82A]</span></div>
                <div className="log-line"><span>[14:22:12]</span><span className="active-text">{progress >= 100 ? `Output ready: ${jobId}` : `Sampling frame ${frame}/64 (Inference step: ${Math.max(1, Math.round(progress / 4))})`}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-bar">
          <button className="btn-outline" type="button" onClick={onCancel}>작업 취소 (ESC)</button>
          <button className="btn-outline" type="button">백그라운드에서 실행</button>
          <button className="btn-outline notify-btn" type="button">완료 시 알림받기</button>
        </div>
      </main>

      <div className="mcp-indicator">
        <div className="status-dot" />
        <span>RENDER_CORE: GPU_CLUSTER_A // LOAD: 82% // EST_TIME: 14S</span>
      </div>
    </>
  );
}
