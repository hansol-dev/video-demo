import { getVideoResultWithMcp, isMcpConfigured } from "../../../../lib/mcp-video-client";
import { DEMO_VIDEOS, normalizeVideoJob } from "../../../../lib/video-contract";

export async function GET(_request, { params }) {
  const { jobId } = await params;

  if (isMcpConfigured() && process.env.MCP_RESULT_TOOL) {
    try {
      const mcpJob = await getVideoResultWithMcp(jobId);
      return Response.json(normalizeVideoJob({ jobId, ...mcpJob }));
    } catch (error) {
      return Response.json(
        {
          error: "MCP_RESULT_FAILED",
          message: error.message,
        },
        { status: 502 }
      );
    }
  }

  return Response.json(
    normalizeVideoJob({
      jobId,
      status: "completed",
      videoUrl: DEMO_VIDEOS.result,
    })
  );
}
