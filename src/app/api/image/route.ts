import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "random text";

    if (!process.env.HF_TOKEN) {
      return NextResponse.json({ error: "HF_TOKEN is missing in .env.local" }, { status: 400 });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Hugging Face API Error: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({ 
        error: "Lỗi tạo ảnh: " + error.message 
    }, { status: 500 });
  }
}
