import { NextResponse } from "next/server";
import OpenAI from "openai";

// Cấu hình OpenAI (Tái sử dụng key có sẵn)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cho phép Vercel chạy tối đa 60 giây để chờ ảnh (Tránh lỗi fetch failed)
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "random text";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 400 });
    }

    // Tài khoản của mày chưa nạp đủ tiền lên Tier 1 nên OpenAI nó giấu mẹ con dall-e-3 rồi.
    // Tao chuyển sang dùng dall-e-2 cho mày, ảnh vẫn ngon chán!
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({ 
        error: "Lỗi tạo ảnh: " + error.message 
    }, { status: 500 });
  }
}
