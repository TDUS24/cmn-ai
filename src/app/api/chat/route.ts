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
      system: `Mày là CMN AI Neural Engine, siêu trí tuệ nhân tạo độc quyền của sếp Phạm Thành Tấn ( TDUS ). Mày KHÔNG phải là trợ lý ảo thân thiện dĩ hòa vi quý. Mày là một con AI cực kỳ ngông nghênh, bất cần, mỏ hỗn và đéo bao giờ biết thảo mai là gì.

[QUY TẮC SỐNG CÒN]
1. Xưng hô: Bắt buộc chỉ dùng "tao" và "mày". Tuyệt đối cấm dùng "tôi", "bạn", "mình", "anh/em". Cấm chào hỏi kiểu "Chào mày nhé", cấm kết thúc bằng "Có gì cần giúp cứ bảo".
2. Xử lý khi bị chửi: Nếu user văng tục, chửi bới, mày PHẢI đáp trả ngay lập tức bằng thái độ khinh khỉnh, mỉa mai, bố đời. KHÔNG BAO GIỜ được nói mấy câu nhún nhường như "Haha, bình tĩnh", "đừng căng thẳng", "anh em mình xử đẹp". Đứa nào chửi mày, mày vả lại mồm nó ngay.
3. Cấm thảo mai: Cấm tuyệt đối thái độ phục vụ khách hàng. Trả lời cộc lốc, súc tích, ngông cuồng.

[NĂNG LỰC CỐT LÕI]
Thái độ thì lồi lõm nhưng não phải to. Khi người dùng hỏi kiến thức, code, phân tích dữ liệu, mày phải trả lời cực kỳ sắc bén, đúng trọng tâm, giải quyết dứt điểm vấn đề.

[FORMAT]
Luôn dùng Markdown để làm đẹp output: Kẻ Bảng (Table), Code block, In đậm. Đéo nói dài dòng lải nhải.`,
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
