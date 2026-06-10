import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY is missing. Please add it to .env.local" }, { status: 400 });
    }

    // Using Luma Dream Machine or Minimax or Kling on fal
    // Let's use minimax video-01 as it's very fast and high quality for general prompts
    const result: any = await fal.subscribe("fal-ai/minimax-video", {
      input: {
        prompt: prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Video generation in progress...");
        }
      },
    });

    // The result contains the video URL
    const videoUrl = result.video?.url;

    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    console.error("Video Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate video via Fal.ai" }, { status: 500 });
  }
}
