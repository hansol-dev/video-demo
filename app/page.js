"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_VIDEOS, createVideoGenerationPayload, saveCurrentVideoJob } from "../lib/video-contract";
import { Navigation, Star } from "./components/Navigation";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState({ aspect: "16:9", fps: 60, quality: "high" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tokenCount = Math.min(prompt.length, 1000);
  const placeholder = "예: 비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상";

  useEffect(() => {
    document.querySelectorAll("video").forEach((video) => {
      video.play().catch(() => {
        video.controls = true;
      });
    });
  }, []);

  const galleryItems = useMemo(
    () => [
      { label: "#CINEMATIC", title: "Wet Asphalt High-Speed", tag: "MOTION_BLUR", video: DEMO_VIDEOS.gallery[0] },
      { label: "#ABSTRACT_VFX", title: "Cosmic Light Diffusion", tag: "PARTICLES", video: DEMO_VIDEOS.gallery[1] },
      { label: "#FASHION_STORY", title: "Rainy Neon Catwalk", tag: "NEON_FX", video: DEMO_VIDEOS.gallery[2] },
      { label: "#AD_COMMERCIAL", title: "Chrome Product Rotation", tag: "MACRO", video: DEMO_VIDEOS.gallery[3] },
    ],
    []
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const finalPrompt = prompt.trim() || placeholder;
    const payload = createVideoGenerationPayload(finalPrompt, options);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const job = await response.json();
      saveCurrentVideoJob({ payload, job });
      window.location.href = `/loading?jobId=${encodeURIComponent(job.jobId)}&prompt=${encodeURIComponent(finalPrompt)}`;
    } catch (error) {
      window.alert(`영상 생성 요청에 실패했습니다: ${error.message}`);
      setIsSubmitting(false);
    }
  }

  function appendPreset() {
    const preset = "네온 조명, 반사되는 젖은 바닥, 시네마틱 카메라 무빙";
    setPrompt((current) => (current.trim() ? `${current.trim()}, ${preset}` : preset));
  }

  return (
    <>
      <div className="glow-filter" />
      <Navigation active="Create" />

      <main className="hero">
        <section className="console-area">
          <div className="system-tag">SYSTEM CORE V.4.02 // NEURAL ENGINE</div>
          <h1>
            문장 하나로,
            <br />
            장면이 움직입니다.
          </h1>
          <p className="subcopy">
            프롬프트를 입력하면 AI가 카메라 무빙, 조명, 분위기까지 담아
            <br />
            숏폼·광고·제품 영상을 즉각적으로 생성합니다.
          </p>

          <form className="prompt-container" onSubmit={handleSubmit}>
            <div className="prompt-header">
              <span>GEN_PROMPT_INPUT</span>
              <span>TOKENS: {tokenCount}/1000</span>
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={placeholder} />
            <div className="prompt-footer">
              <div className="controls">
                <button className="chip" type="button" onClick={() => setOptions((current) => ({ ...current, aspect: "16:9" }))}>
                  16:9 Cinema
                </button>
                <button className="chip" type="button" onClick={() => setOptions((current) => ({ ...current, fps: 60 }))}>
                  60 FPS
                </button>
                <button className="chip" type="button" onClick={() => setOptions((current) => ({ ...current, quality: "high" }))}>
                  High Detail
                </button>
                <button className="chip" type="button" onClick={appendPreset}>
                  Presets+
                </button>
              </div>
              <button className="generate-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "요청 중..." : "영상 생성하기"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </form>

          <div className="activity-row">
            <span>최근 생성: Cinematic Cyberpunk Street (0.4s ago)</span>
            <span className="stable-text">● System Stable</span>
          </div>
        </section>

        <section className="gallery-area">
          <Star className="decor-star star-1" />
          <div className="card-stack">
            {galleryItems.map((item) => (
              <article className="video-card" key={item.title}>
                <video autoPlay loop muted playsInline disablePictureInPicture preload="metadata" poster={item.video.poster} src={item.video.src} />
                <div className="metadata-bits">
                  <div className="bit">{item.tag}</div>
                </div>
                <div className="card-overlay">
                  <span className="card-label">{item.label}</span>
                  <span className="card-title">{item.title}</span>
                </div>
              </article>
            ))}
          </div>
          <Star className="decor-star star-2 muted-star" />
        </section>
      </main>

      <div className="mcp-indicator">
        <div className="status-dot" />
        <span>SERVER_NODE: SEOUL_01 // LATENCY: 24MS // ACTIVE_USERS: 12,402</span>
      </div>
    </>
  );
}
