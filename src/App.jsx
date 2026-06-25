import React, { useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import LoadingPage from "./pages/LoadingPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import { createVideoGenerationPayload, requestVideoGeneration } from "./api/videoGeneration.js";

const defaultPrompt = "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [request, setRequest] = useState(null);

  async function handleGenerate(prompt, options) {
    const finalPrompt = prompt.trim() || defaultPrompt;
    const payload = createVideoGenerationPayload(finalPrompt, options);
    const job = await requestVideoGeneration(payload);

    setRequest({ payload, job });
    setScreen("loading");
  }

  function handleLoadingComplete() {
    setScreen("result");
  }

  function handleBackToEditor() {
    setScreen("home");
  }

  return (
    <>
      <div className="glow-filter" />
      {screen === "home" && <HomePage onGenerate={handleGenerate} />}
      {screen === "loading" && <LoadingPage request={request} onComplete={handleLoadingComplete} onCancel={handleBackToEditor} />}
      {screen === "result" && <ResultPage request={request} onBack={handleBackToEditor} />}
    </>
  );
}
