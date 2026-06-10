import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = body.prompt || "random text";

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    console.error("OpenAI Image Gen Error:", error);
    
    if (error.message && error.message.includes("billing")) {
        return NextResponse.json({ 
            error: "Tài khoản OpenAI của mày hết tiền hoặc chưa nạp 5$. Vào platform.openai.com nạp đạn đi!" 
        }, { status: 400 });
    }

    return NextResponse.json({ 
        error: "Lỗi DALL-E 3: " + error.message 
    }, { status: 500 });
  }
}
