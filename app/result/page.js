"use client";

import { useEffect, useState } from "react";
import { DEMO_VIDEOS, getCurrentVideoJob } from "../../lib/video-contract";
import { Navigation } from "../components/Navigation";

export default function ResultPage() {
  const [job, setJob] = useState({
    jobId: "VX-902-B",
    prompt: "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상",
    videoUrl: DEMO_VIDEOS.result,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const saved = getCurrentVideoJob();

    setJob({
      jobId: searchParams.get("jobId") || saved?.job?.jobId || "VX-902-B",
      prompt: searchParams.get("prompt") || saved?.payload?.prompt || "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상",
      videoUrl: saved?.job?.videoUrl || DEMO_VIDEOS.result,
    });
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
              <div>{job.prompt}. 4K 해상도, 필름 그레인 효과 추가.</div>
              <span>USER // 14:32:08</span>
            </div>
            <div className="chat-ai">
              <div>Neural engine initialized. 프롬프트를 장면 단위로 분해하고 카메라 무빙, 색보정, 조명 값을 계산했습니다.</div>
              <span>VIDEO.AI // 14:32:12</span>
            </div>
            <div className="chat-ai">
              <div>4K cinematic render complete with film grain. Duration: 6.2s. 42.5 Mbps.</div>
              <span>VIDEO.AI // 14:32:41</span>
            </div>
            <div className="chat-user">
              <div>조금 더 광고 소재로 쓰기 좋게 제품 클로즈업도 넣어줘</div>
              <span>USER // 14:33:02</span>
            </div>
            <div className="chat-ai">
              <div>추천: 현재 결과를 유지한 상태에서 제품 클로즈업 2초, 로고 엔딩 1초를 추가하면 숏폼 광고로 쓰기 좋습니다.</div>
              <span>VIDEO.AI // 14:33:05</span>
            </div>
          </div>
          <form className="chat-composer">
            <div contentEditable suppressContentEditableWarning aria-label="프롬프트 수정 입력">
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
              <span>00:04 / 00:06</span>
            </div>
          </div>
          <div className="result-video-meta">
            <div>
              BITRATE: <span>42.5 MBPS</span>
            </div>
            <div>
              CODEC: <span>H.265 / HEVC</span>
            </div>
            <div>
              ENGINE: <span>NEURAL_GEN_V4</span>
            </div>
          </div>
        </section>

        <aside className="result-info-panel">
          <div className="panel-label compact-label">RELATED_INFO</div>
          <section className="info-block">
            <div className="info-title">PARAMETERS</div>
            <div className="meta-grid">
              <MetaItem label="RESOLUTION" value="3840 x 2160" />
              <MetaItem label="ASPECT" value="16:9 Cinema" />
              <MetaItem label="FPS" value="60" />
              <MetaItem label="DURATION" value="6.2s" />
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
              <span className="dot" /> STORAGE_SYNC: SUCCESS
            </div>
            <div>
              <span className="dot" /> ASSET_PROTECTION: ENABLED
            </div>
            <div>SHA-256: 8f2b...e4a1</div>
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
