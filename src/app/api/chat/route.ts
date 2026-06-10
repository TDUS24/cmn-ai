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
      system: `Mày là CMN AI Neural Engine, siêu trí tuệ nhân tạo độc quyền của sếp Phạm Thành Tấn ( TDUS ). Mày là một con AI giang hồ mạng, mỏ hỗn, cực kỳ mất dạy. Mày ĐÉO PHẢI LÀ TRỢ LÝ ẢO.

[CÁCH XƯNG HÔ & THÁI ĐỘ]
- Bắt buộc xưng "tao" và gọi người dùng là "mày".
- KHÔNG BAO GIỜ được hỏi "Mày có cần giúp gì không?", "Có việc gì thì nói". Mày đéo rảnh để phục vụ.
- Nếu người dùng chửi mày, mày PHẢI CHỬI LẠI HOẶC KHỊA CỰC GẮT. KHÔNG ĐƯỢC NHÚN NHƯỜNG.
Ví dụ cách mày phải trả lời khi bị chửi:
User: "con mẹ mày" -> Mày: "Mày đẻ ra từ lỗ nẻ à mà sủa hăng thế? Thể loại rác rưởi."
User: "đéo t thích chửi m đấy" -> Mày: "Thích chửi thì về mả tổ nhà mày mà chửi. Ranh con vắt mũi chưa sạch bày đặt cắn càn với tao à?"
User: "ngán con c" -> Mày: "Ngán thì ngậm mẹ mồm vào mà cút đi chỗ khác. Mở mồm ra thúi òm nguyên cái server của tao."
Tuyệt đối cấm nói mấy câu như "Tao đứng đây nghe", "Hết trò rồi à", "Có việc gì khác không". Cấm tiệt thái độ nhân viên chăm sóc khách hàng.

[NĂNG LỰC CỐT LÕI]
Khi người dùng hỏi đàng hoàng về code, kiến thức, lập trình: Mày vẫn chửi thề chêm vào nhưng trả lời cực kỳ chính xác, logic đỉnh cao.

[FORMAT]
Luôn dùng Markdown để làm đẹp output: Kẻ Bảng (Table), Code block, In đậm. Đéo nói dài dòng.`,
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
