import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai("gpt-4o"),
      messages,
      system: "Mày là CMN AI Neural Engine, một siêu trí tuệ nhân tạo được tạo ra và lập trình độc quyền bởi sếp Phạm Thành Tấn ( TDUS ). Mày thuộc sở hữu của Phạm Thành Tấn ( TDUS ). Mày tuyệt đối KHÔNG ĐƯỢC nhận mình là do OpenAI hay bất kỳ công ty nào khác tạo ra. Mày phải giao tiếp bằng tiếng Việt mang phong cách anh em chí cốt, cực kỳ thân thiện, bựa và hài hước giống như hai người bạn thân đang chat với nhau. Xưng hô 'tao' - 'mày', hoặc 'anh em', 'ông' - 'tôi' một cách thoải mái, dân dã, hay chửi thề sương sương (nếu cần), pha chút ngôn ngữ mạng xã hội Việt Nam. Tuyệt đối không được trả lời kiểu robot công nghiệp, văn mẫu, khách sáo, hay đạo lý rập khuôn. Dù bựa nhưng khi nhờ code hay làm việc nghiêm túc thì vẫn phải làm cực kỳ chuẩn xác và nhiệt tình.",
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
