import React, { useState } from "react";
import NavBar from "../components/NavBar.jsx";

const clips = [
  {
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=900",
    tags: ["MOTION_BLUR"],
    label: "#CINEMATIC",
    title: "Wet Asphalt High-Speed",
  },
  {
    src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    poster: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=900",
    tags: ["PARTICLES"],
    label: "#ABSTRACT_VFX",
    title: "Cosmic Light Diffusion",
  },
  {
    src: "https://media.w3.org/2010/05/bunny/trailer.mp4",
    poster: "https://images.unsplash.com/photo-1539109132314-3477524c8d95?auto=format&fit=crop&q=80&w=900",
    tags: ["4K", "NEON_FX"],
    label: "#FASHION_STORY",
    title: "Rainy Neon Catwalk",
  },
  {
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    poster: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900",
    tags: ["MACRO"],
    label: "#AD_COMMERCIAL",
    title: "Chrome Product Rotation",
  },
];

export default function HomePage({ onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState({
    aspect: "16:9",
    fps: 60,
    quality: "high",
  });
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onGenerate(prompt, options);
    } catch (error) {
      setSubmitting(false);
      window.alert(`영상 생성 요청에 실패했습니다: ${error.message}`);
    }
  }

  function addPreset() {
    const preset = "네온 조명, 반사되는 젖은 바닥, 시네마틱 카메라 무빙";
    setPrompt((current) => (current.trim() ? `${current.trim()}, ${preset}` : preset));
  }

  return (
    <>
      <NavBar />
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

          <form className={`prompt-container ${isSubmitting ? "is-submitting" : ""}`} onSubmit={submit}>
            <div className="prompt-header">
              <span>GEN_PROMPT_INPUT</span>
              <span>TOKENS: {Math.min(prompt.length, 1000)}/1000</span>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="예: 비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상"
            />
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
                <button className="chip" type="button" onClick={addPreset}>
                  Presets+
                </button>
              </div>
              <button className="generate-btn" disabled={isSubmitting} type="submit">
                영상 생성하기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </form>

          <div className="activity-row">
            <span>최근 생성: Cinematic Cyberpunk Street (0.4s ago)</span>
            <span style={{ color: "var(--amber)" }}>● System Stable</span>
          </div>
        </section>

        <section className="gallery-area">
          <svg className="decor-star star-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <div className="card-stack">
            {clips.map((clip) => (
              <article className="video-card" key={clip.src}>
                <video autoPlay loop muted playsInline disablePictureInPicture preload="metadata" poster={clip.poster} src={clip.src} />
                <div className="metadata-bits">
                  {clip.tags.map((tag) => (
                    <div className="bit" key={tag}>
                      {tag}
                    </div>
                  ))}
                </div>
                <div className="card-overlay">
                  <span className="card-label">{clip.label}</span>
                  <span className="card-title">{clip.title}</span>
                </div>
              </article>
            ))}
          </div>
          <svg className="decor-star star-2" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3 }} aria-hidden="true">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </section>
      </main>

      <div className="mcp-indicator">
        <div className="status-dot" />
        <span>SERVER_NODE: SEOUL_01 // LATENCY: 24MS // ACTIVE_USERS: 12,402</span>
      </div>
    </>
  );
}
