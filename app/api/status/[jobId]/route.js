import { getVideoStatusWithMcp, isMcpConfigured } from "../../../../lib/mcp-video-client";
import { normalizeVideoJob } from "../../../../lib/video-contract";

export async function GET(_request, { params }) {
  const { jobId } = await params;

  if (isMcpConfigured() && process.env.MCP_STATUS_TOOL) {
    try {
      const mcpJob = await getVideoStatusWithMcp(jobId);
      return Response.json(normalizeVideoJob({ jobId, ...mcpJob }));
    } catch (error) {
      return Response.json(
        {
          error: "MCP_STATUS_FAILED",
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
      progress: 100,
    })
  );
}
