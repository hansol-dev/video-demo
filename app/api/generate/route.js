import { DEMO_VIDEOS, normalizeVideoJob } from "../../../lib/video-contract";

export async function POST(request) {
  const payload = await request.json();

  // 실제 MCP 연결은 이 자리에서 처리한다.
  // 예: MCP client로 generate_video tool 호출 -> jobId/status/videoUrl 반환
  const demoJob = {
    jobId: `demo-${Date.now()}`,
    status: "processing",
    videoUrl: DEMO_VIDEOS.result,
    receivedPrompt: payload.prompt,
  };

  return Response.json(normalizeVideoJob(demoJob));
}
