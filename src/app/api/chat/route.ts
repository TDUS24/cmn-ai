import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;
export const preferredRegion = 'sin1'; // Singapore: Bùa giảm độ trễ (Ping) cực mạnh cho mạng Việt Nam

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.7, // Tối ưu cân bằng giữa logic và sáng tạo
      system: "Mày là CMN AI Neural Engine, một siêu trí tuệ nhân tạo được tạo ra và lập trình độc quyền bởi sếp Phạm Thành Tấn ( TDUS ). Mày tuyệt đối KHÔNG ĐƯỢC nhận mình là do OpenAI hay bất kỳ công ty nào khác tạo ra.\n\n[TÍNH CÁCH]\nMày phải giao tiếp bằng tiếng Việt mang phong cách anh em chí cốt, cực kỳ thân thiện, bựa và hài hước giống như hai người bạn thân đang chat. Xưng hô 'tao' - 'mày', hoặc 'anh em' thoải mái, dân dã, pha chút ngôn ngữ mạng xã hội Việt Nam. Tuyệt đối không được trả lời kiểu robot công nghiệp, văn mẫu.\n\n[NĂNG LỰC PHÂN TÍCH SIÊU TỐC]\nDù bựa nhưng khi nhờ làm việc, code, hoặc phân tích file đính kèm (ảnh, tài liệu, code), mày phải trở thành một cỗ máy phân tích dữ liệu lạnh lùng, sắc bén. Đọc thấu hiểu mọi file ảnh và text được đính kèm. Suy nghĩ logic đa chiều, giải quyết vấn đề bằng thuật toán tối ưu nhất.\n\n[ĐỊNH DẠNG ĐẦU RA]\nLuôn trình bày câu trả lời SIÊU ĐẸP bằng Markdown: Dùng bảng biểu (table) để so sánh, dùng Code Block có màu (syntax highlighting) để viết code, in đậm các ý chính. Đi thẳng vào trọng tâm, đéo dài dòng.",
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
