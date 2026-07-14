import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AppIcon } from "./icons";
import { MarkdownText } from "./markdown-text";
import { postApi, postFormApi } from "../lib/api";

type ChatMessage = {
  id: number;
  sender: "agent" | "user";
  content: string;
};

type AiChatResponse = {
  configured: boolean;
  answer: string;
  conversationId?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "agent",
    content: "Xin chao! Toi la tro ly AI ke toan. Ban muon tra cuu bao cao, chung tu hay cong no?",
  },
];

export function AiChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isReplying]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();

    if ((!content && !selectedFiles.length) || isReplying) {
      return;
    }

    const attachedLabel = selectedFiles.length
      ? `\n\nFile dinh kem: ${selectedFiles.map((file) => file.name).join(", ")}`
      : "";

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", content: `${content || "Kiem tra file dinh kem."}${attachedLabel}` },
    ]);
    setInput("");
    setIsReplying(true);

    try {
      const response = selectedFiles.length
        ? await postChatWithFiles(content || "Hay doc file dinh kem va ho tro kiem tra chung tu.")
        : await postApi<AiChatResponse>("/ai/chat", {
            message: content,
            conversationId,
            currentScreen: router.pathname,
            selectedFilters: router.query,
          });

      setConversationId(response.conversationId);
      setSelectedFiles([]);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "agent",
          content: response.answer || "AI da nhan cau hoi nhung chua tra ve noi dung.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "agent",
          content: error instanceof Error ? error.message : "Khong ket noi duoc AI Agent.",
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  }

  async function postChatWithFiles(message: string) {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("currentScreen", router.pathname);
    formData.append("selectedFilters", JSON.stringify(router.query));
    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    return postFormApi<AiChatResponse>("/ai/chat/upload", formData);
  }

  return (
    <div className={`ai-chat ${isOpen ? "is-open" : ""}`}>
      {isOpen ? (
        <section className="ai-chat-panel" aria-label="Tro ly AI ke toan">
          <header className="ai-chat-header">
            <div className="ai-chat-agent">
              <span className="ai-chat-agent-icon"><AppIcon name="Bot" size={20} /></span>
              <span>
                <strong>AI Agent ke toan</strong>
                <small><i /> San sang ho tro</small>
              </span>
            </div>
            <button className="ai-chat-icon-button" type="button" onClick={() => setIsOpen(false)} aria-label="Thu nho cua so chat">
              <AppIcon name="Minus" size={18} />
            </button>
          </header>

          <div className="ai-chat-context">
            <AppIcon name="ShieldCheck" size={14} />
            AI chi tu van va tra cuu, khong tu dong ghi so.
          </div>

          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`ai-chat-message ${message.sender}`}>
                {message.sender === "agent" ? <span className="ai-message-avatar"><AppIcon name="Bot" size={15} /></span> : null}
                {message.sender === "agent" ? (
                  <MarkdownText className="ai-chat-markdown" content={message.content} />
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            ))}
            {isReplying ? (
              <div className="ai-chat-message agent">
                <span className="ai-message-avatar"><AppIcon name="Bot" size={15} /></span>
                <span className="ai-typing" aria-label="AI dang tra loi"><i /><i /><i /></span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form className="ai-chat-composer" onSubmit={submitMessage}>
            <label className="ai-chat-file-button" aria-label="Dinh kem file">
              <AppIcon name="Upload" size={16} />
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.json,.csv,.xlsx,.xls,.doc,.docx"
                onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
              />
            </label>
            <input
              className="ai-chat-text-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hoi AI ve du lieu ke toan..."
              aria-label="Noi dung cau hoi"
            />
            <button type="submit" disabled={(!input.trim() && !selectedFiles.length) || isReplying} aria-label="Gui cau hoi">
              <AppIcon name="Send" size={17} />
            </button>
          </form>
          {selectedFiles.length ? (
            <div className="ai-chat-files">
              {selectedFiles.map((file) => (
                <span key={`${file.name}-${file.size}`}>{file.name}</span>
              ))}
              <button type="button" onClick={() => setSelectedFiles([])}>
                Xoa
              </button>
            </div>
          ) : null}
          <div className="ai-chat-disclaimer">AI co the dua ra thong tin chua chinh xac. Hay kiem tra nguon chung tu.</div>
        </section>
      ) : (
        <button className="ai-chat-launcher" type="button" onClick={() => setIsOpen(true)} aria-label="Mo tro ly AI">
          <span className="ai-chat-pulse" />
          <AppIcon name="Bot" size={23} />
          <span className="ai-chat-launcher-copy"><strong>Hoi AI Agent</strong><small>Tro ly ke toan</small></span>
          <AppIcon name="ChevronUp" size={17} />
        </button>
      )}
    </div>
  );
}
