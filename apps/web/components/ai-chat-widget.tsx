import { FormEvent, useEffect, useRef, useState } from "react";
import { AppIcon } from "./icons";

type ChatMessage = {
  id: number;
  sender: "agent" | "user";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "agent",
    content: "Xin chào! Tôi là trợ lý AI kế toán. Bạn muốn tra cứu báo cáo, chứng từ hay công nợ?"
  }
];

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isReplying, setIsReplying] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isReplying]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();

    if (!content || isReplying) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", content }
    ]);
    setInput("");
    setIsReplying(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "agent",
          content: "Tính năng kết nối AI Agent đang được hoàn thiện. Câu hỏi của bạn đã được ghi nhận để xử lý ở bước tích hợp tiếp theo."
        }
      ]);
      setIsReplying(false);
    }, 700);
  }

  return (
    <div className={`ai-chat ${isOpen ? "is-open" : ""}`}>
      {isOpen ? (
        <section className="ai-chat-panel" aria-label="Trợ lý AI kế toán">
          <header className="ai-chat-header">
            <div className="ai-chat-agent">
              <span className="ai-chat-agent-icon"><AppIcon name="Bot" size={20} /></span>
              <span>
                <strong>AI Agent kế toán</strong>
                <small><i /> Sẵn sàng hỗ trợ</small>
              </span>
            </div>
            <button className="ai-chat-icon-button" type="button" onClick={() => setIsOpen(false)} aria-label="Thu nhỏ cửa sổ chat">
              <AppIcon name="Minus" size={18} />
            </button>
          </header>

          <div className="ai-chat-context">
            <AppIcon name="ShieldCheck" size={14} />
            AI chỉ tư vấn và tra cứu, không tự động ghi sổ.
          </div>

          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`ai-chat-message ${message.sender}`}>
                {message.sender === "agent" ? <span className="ai-message-avatar"><AppIcon name="Bot" size={15} /></span> : null}
                <p>{message.content}</p>
              </div>
            ))}
            {isReplying ? (
              <div className="ai-chat-message agent">
                <span className="ai-message-avatar"><AppIcon name="Bot" size={15} /></span>
                <span className="ai-typing" aria-label="AI đang trả lời"><i /><i /><i /></span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form className="ai-chat-composer" onSubmit={submitMessage}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hỏi AI về dữ liệu kế toán..."
              aria-label="Nội dung câu hỏi"
            />
            <button type="submit" disabled={!input.trim() || isReplying} aria-label="Gửi câu hỏi">
              <AppIcon name="Send" size={17} />
            </button>
          </form>
          <div className="ai-chat-disclaimer">AI có thể đưa ra thông tin chưa chính xác. Hãy kiểm tra nguồn chứng từ.</div>
        </section>
      ) : (
        <button className="ai-chat-launcher" type="button" onClick={() => setIsOpen(true)} aria-label="Mở trợ lý AI" title="Hỏi AI Agent">
          <span className="ai-chat-pulse" />
          <AppIcon name="Bot" size={27} />
        </button>
      )}
    </div>
  );
}
