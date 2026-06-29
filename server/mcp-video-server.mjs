#!/usr/bin/env node

import http from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import OpenAI from "openai";
import * as z from "zod/v4";

const PORT = Number(process.env.VIDEO_MCP_PORT || 8787);
const HOST = process.env.VIDEO_MCP_HOST || "127.0.0.1";
const DEFAULT_VIDEO_URL =
  process.env.VIDEO_MCP_DEMO_VIDEO_URL ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

const jobs = new Map();
const transports = new Map();

function createVideoMcpServer() {
  const server = new McpServer(
    {
      name: "video-demo-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        logging: {},
      },
    }
  );

  server.registerTool(
    "generate_video",
    {
      title: "Generate Video",
      description:
        "Create a video generation job from a prompt. Until a real video model is connected, this returns a completed demo video job.",
      inputSchema: {
        prompt: z.string().min(1).describe("Prompt describing the video to generate"),
        aspect: z.string().optional().describe("Aspect ratio such as 16:9 or 9:16"),
        fps: z.number().optional().describe("Frames per second"),
        quality: z.string().optional().describe("Requested quality"),
        duration: z.number().optional().describe("Duration in seconds"),
        output: z
          .object({
            format: z.string().optional(),
            resolution: z.string().optional(),
          })
          .optional(),
        client: z.record(z.string(), z.unknown()).optional(),
      },
      outputSchema: videoJobSchema(),
    },
    async (payload) => {
      const job = await createVideoJob(payload);
      jobs.set(job.jobId, job);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(job, null, 2),
          },
        ],
        structuredContent: job,
      };
    }
  );

  server.registerTool(
    "get_video_status",
    {
      title: "Get Video Status",
      description: "Get the current status for a video generation job.",
      inputSchema: {
        jobId: z.string().min(1).describe("Video job id"),
      },
      outputSchema: videoJobSchema(),
    },
    async ({ jobId }) => {
      const job = findJob(jobId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(job, null, 2),
          },
        ],
        structuredContent: job,
      };
    }
  );

  server.registerTool(
    "get_video_result",
    {
      title: "Get Video Result",
      description: "Get the final video result URL for a video generation job.",
      inputSchema: {
        jobId: z.string().min(1).describe("Video job id"),
      },
      outputSchema: videoJobSchema(),
    },
    async ({ jobId }) => {
      const job = findJob(jobId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(job, null, 2),
          },
        ],
        structuredContent: job,
      };
    }
  );

  return server;
}

function videoJobSchema() {
  return {
    jobId: z.string(),
    status: z.enum(["queued", "processing", "completed", "failed"]),
    progress: z.number().min(0).max(100),
    videoUrl: z.string(),
    provider: z.string(),
    model: z.string(),
    receivedPrompt: z.string(),
    createdAt: z.string(),
    completedAt: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  };
}

async function createVideoJob(payload) {
  const jobId = `video-${randomUUID()}`;
  const now = new Date().toISOString();
  const promptPlan = await createPromptPlan(payload);

  return {
    jobId,
    status: "completed",
    progress: 100,
    videoUrl: DEFAULT_VIDEO_URL,
    provider: process.env.OPENAI_API_KEY ? "openai-gpt-planner" : "mock",
    model: process.env.OPENAI_API_KEY ? OPENAI_MODEL : "mock-video-provider",
    receivedPrompt: payload.prompt,
    createdAt: now,
    completedAt: new Date().toISOString(),
    metadata: {
      note:
        "This MCP server is wired correctly, but no real video generation model is connected yet. It returns a demo MP4 URL.",
      promptPlan,
      request: payload,
    },
  };
}

async function createPromptPlan(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: "mock",
      summary: "OPENAI_API_KEY is not set, so the server skipped GPT prompt planning.",
    };
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a video production planner. Return concise JSON only. Do not claim a video file was actually rendered.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Create a concise video generation plan from this payload.",
          payload,
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "video_prompt_plan",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            concept: { type: "string" },
            camera: { type: "string" },
            lighting: { type: "string" },
            motion: { type: "string" },
            style_tags: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["concept", "camera", "lighting", "motion", "style_tags"],
        },
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text);
}

function findJob(jobId) {
  const job = jobs.get(jobId);

  if (job) return job;

  return {
    jobId,
    status: "failed",
    progress: 0,
    videoUrl: "",
    provider: "memory",
    model: "none",
    receivedPrompt: "",
    createdAt: new Date().toISOString(),
    metadata: {
      error: "JOB_NOT_FOUND",
    },
  };
}

function sendJson(res, statusCode, value) {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function handleMcpRequest(req, res) {
  try {
    const sessionId = req.headers["mcp-session-id"];
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
        },
      });

      const mcpServer = createVideoMcpServer();
      await mcpServer.connect(transport);

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
        mcpServer.close().catch(() => {});
      };
    }

    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
}

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      name: "video-demo-mcp-server",
      transport: "streamable-http",
      mcpEndpoint: "/mcp",
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      tools: ["generate_video", "get_video_status", "get_video_result"],
    });
    return;
  }

  if (url.pathname !== "/mcp") {
    sendJson(res, 404, {
      error: "NOT_FOUND",
    });
    return;
  }

  if (req.method === "POST") {
    await handleMcpRequest(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "DELETE") {
    sendJson(res, 405, {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
    return;
  }

  sendJson(res, 405, {
    error: "METHOD_NOT_ALLOWED",
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Video MCP server listening at http://${HOST}:${PORT}/mcp`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("Shutting down video MCP server...");
  for (const transport of transports.values()) {
    transport.close().catch(() => {});
  }
  httpServer.close(() => process.exit(0));
}
