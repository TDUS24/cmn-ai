import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = body.prompt || "random text";

    // Dùng con AI Pollinations siêu tốc, không giới hạn, không cần key
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({ 
        error: "Lỗi tạo ảnh: " + error.message 
    }, { status: 500 });
  }
}
