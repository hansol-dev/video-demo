import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const DEFAULT_TIMEOUT_MS = 60_000;

export function isMcpConfigured() {
  return Boolean(process.env.MCP_SERVER_URL && process.env.MCP_GENERATE_TOOL);
}

export async function listMcpTools() {
  return withMcpClient(async (client) => client.listTools());
}

export async function generateVideoWithMcp(payload) {
  const result = await callMcpTool(process.env.MCP_GENERATE_TOOL, payload);
  return normalizeMcpToolOutput(result);
}

export async function getVideoStatusWithMcp(jobId) {
  if (!process.env.MCP_STATUS_TOOL) return null;

  const result = await callMcpTool(process.env.MCP_STATUS_TOOL, { jobId });
  return normalizeMcpToolOutput(result);
}

export async function getVideoResultWithMcp(jobId) {
  if (!process.env.MCP_RESULT_TOOL) return null;

  const result = await callMcpTool(process.env.MCP_RESULT_TOOL, { jobId });
  return normalizeMcpToolOutput(result);
}

async function callMcpTool(name, argumentsPayload) {
  if (!name) {
    throw new Error("MCP tool name is missing.");
  }

  return withMcpClient((client) =>
    client.callTool(
      {
        name,
        arguments: argumentsPayload,
      },
      undefined,
      {
        timeout: Number(process.env.MCP_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
      }
    )
  );
}

async function withMcpClient(callback) {
  const serverUrl = process.env.MCP_SERVER_URL;

  if (!serverUrl) {
    throw new Error("MCP_SERVER_URL is missing.");
  }

  const transport = createMcpTransport(serverUrl);
  const client = new Client(
    {
      name: "video-demo-next-client",
      version: "0.1.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    return await callback(client);
  } finally {
    await client.close().catch(() => {});
  }
}

function createMcpTransport(serverUrl) {
  const headers = createAuthHeaders();
  const url = new URL(serverUrl);
  const transport = (process.env.MCP_TRANSPORT || "streamable-http").toLowerCase();

  if (transport === "sse") {
    return new SSEClientTransport(url, {
      eventSourceInit: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...(init?.headers || {}),
              ...headers,
            },
          }),
      },
      requestInit: {
        headers,
      },
    });
  }

  return new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers,
    },
  });
}

function createAuthHeaders() {
  if (!process.env.MCP_AUTH_TOKEN) return {};

  return {
    Authorization: `Bearer ${process.env.MCP_AUTH_TOKEN}`,
  };
}

function normalizeMcpToolOutput(result) {
  if (!result) return {};

  if ("structuredContent" in result && result.structuredContent) {
    return result.structuredContent;
  }

  if ("toolResult" in result) {
    return result.toolResult;
  }

  const textContent = result.content?.find((item) => item.type === "text")?.text;

  if (!textContent) {
    return result;
  }

  try {
    return JSON.parse(textContent);
  } catch {
    return {
      message: textContent,
      raw: result,
    };
  }
}
