import { generateVideoWithMcp, isMcpConfigured } from "../../../lib/mcp-video-client";
import { DEMO_VIDEOS, normalizeVideoJob } from "../../../lib/video-contract";

export async function POST(request) {
  const payload = await request.json();

  if (isMcpConfigured()) {
    try {
      const mcpJob = await generateVideoWithMcp(payload);
      return Response.json(normalizeVideoJob(mcpJob));
    } catch (error) {
      return Response.json(
        {
          error: "MCP_GENERATE_FAILED",
          message: error.message,
        },
        { status: 502 }
      );
    }
  }

  const demoJob = {
    jobId: `demo-${Date.now()}`,
    status: "processing",
    videoUrl: DEMO_VIDEOS.result,
    receivedPrompt: payload.prompt,
  };

  return Response.json(normalizeVideoJob(demoJob));
}
