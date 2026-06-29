import { isMcpConfigured, listMcpTools } from "../../../../lib/mcp-video-client";

export async function GET() {
  if (!isMcpConfigured()) {
    return Response.json(
      {
        configured: false,
        message: "MCP_SERVER_URL and MCP_GENERATE_TOOL must be set first.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await listMcpTools();
    return Response.json({
      configured: true,
      tools: result.tools || [],
    });
  } catch (error) {
    return Response.json(
      {
        configured: true,
        error: "MCP_TOOLS_FAILED",
        message: error.message,
      },
      { status: 502 }
    );
  }
}
