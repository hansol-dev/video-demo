import { DEMO_VIDEOS, normalizeVideoJob } from "../../../../lib/video-contract";

export async function GET(_request, { params }) {
  const { jobId } = await params;

  return Response.json(
    normalizeVideoJob({
      jobId,
      status: "completed",
      videoUrl: DEMO_VIDEOS.result,
    })
  );
}
