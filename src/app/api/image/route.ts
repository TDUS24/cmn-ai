import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = body.prompt || "random text";

    // Pollinations có vẻ bị mạng nhà mày chặn hoặc đang sập, tao đổi sang xài API Airforce siêu Vip
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://api.airforce/v1/imagine2?prompt=${encodedPrompt}&size=1:1`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({ 
        error: "Lỗi tạo ảnh: " + error.message 
    }, { status: 500 });
  }
}
