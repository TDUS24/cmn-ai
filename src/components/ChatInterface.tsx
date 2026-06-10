"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, BrainCircuit, User, Loader2, Copy, Paperclip, X, Sparkles, Mic, MicOff, SquarePen, Search, Library, Folder, LayoutGrid, TerminalSquare, MoreHorizontal, MessageSquare, Trash2, Check, Menu, ClipboardCopy, Crown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";

type MediaMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
  attachments?: { id: string, name: string, content: string, isImage?: boolean }[];
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [savedChats, setSavedChats] = useState<{id: string, title: string, messages: MediaMessage[]}[]>([]);
  const [attachments, setAttachments] = useState<{ id: string, name: string, content: string, isImage?: boolean }[]>([]);
  
  const [mediaMessages, setMediaMessages] = useState<MediaMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Chào bạn! Mình là Trợ lý AI. Nhập tin nhắn để trò chuyện nhé!",
      type: "text"
    },
  ]);

  const mainRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loaded = localStorage.getItem("cmn_chats");
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        setSavedChats(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
          setMediaMessages(parsed[0].messages);
        } else {
          setCurrentChatId(Date.now().toString());
        }
      } catch (e) {}
    } else {
      setCurrentChatId(Date.now().toString());
    }
  }, []);

  useEffect(() => {
    if (!currentChatId || mediaMessages.length <= 1) return;
    setSavedChats(prev => {
      const existing = prev.find(c => c.id === currentChatId);
      const title = existing ? existing.title : (mediaMessages.find(m => m.role === 'user')?.content.substring(0, 30) || "Chat mới");
      const updatedChat = { id: currentChatId, title, messages: mediaMessages };
      const newChats = prev.filter(c => c.id !== currentChatId);
      const finalChats = [updatedChat, ...newChats];
      localStorage.setItem("cmn_chats", JSON.stringify(finalChats));
      return finalChats;
    });
  }, [mediaMessages, currentChatId]);

  const createNewChat = () => {
    setCurrentChatId(Date.now().toString());
    setMediaMessages([{ id: "welcome", role: "assistant", content: "Chào bạn! Mình là Trợ lý AI. Nhập tin nhắn để trò chuyện nhé!", type: "text" }]);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedChats = savedChats.filter(c => c.id !== id);
    setSavedChats(updatedChats);
    localStorage.setItem("cmn_chats", JSON.stringify(updatedChats));
    if (currentChatId === id) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
        setMediaMessages(updatedChats[0].messages);
      } else {
        createNewChat();
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN'; // Vietnamese

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setInput(finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bro không hỗ trợ nhận diện giọng nói! Đổi sang Chrome hoặc Edge nhé.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn! Vui lòng chọn file dưới 5MB.`);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachments(prev => [...prev, { id: Math.random().toString(), name: file.name, content, isImage }]);
      };
      
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    
    // Reset file input so user can select same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scrollToBottom = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: mainRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [mediaMessages, isMediaLoading]);

  const handleSend = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    
    // Unikey/EVKey often desyncs React state from the DOM. Use React ref to get the absolute source of truth.
    const inputElement = textareaRef.current;
    const currentInput = inputElement ? inputElement.value : input;

    if (!currentInput.trim() && attachments.length === 0) return;

    const finalUserText = currentInput.trim() || "Phân tích các file đính kèm này giúp tao.";

    const userMessage: MediaMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalUserText,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    const assistantMessage: MediaMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      type: "text",
    };

    setMediaMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setAttachments([]);
    if (inputElement) inputElement.value = ""; // Force clear DOM immediately
    setIsMediaLoading(true);

    try {
      if (finalUserText.trim().startsWith("/image ")) {
        const prompt = finalUserText.replace("/image ", "").trim();
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || "Lỗi tạo ảnh");
        
        setMediaMessages((prev) => 
          prev.map(m => m.id === assistantMessage.id 
            ? { ...m, content: "Đây là ảnh AI vẽ cho mày:", type: "image", imageUrl: data.imageUrl } 
            : m)
        );
        setIsMediaLoading(false);
        return;
      }
      
      if (finalUserText.trim().startsWith("/video ")) {
        const prompt = finalUserText.replace("/video ", "").trim();
        const response = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || "Lỗi tạo video");
        
        setMediaMessages((prev) => 
          prev.map(m => m.id === assistantMessage.id 
            ? { ...m, content: "Đây là video AI quay cho mày:", type: "video", videoUrl: data.videoUrl } 
            : m)
        );
        setIsMediaLoading(false);
        return;
      }

      const chatContext = mediaMessages
        .filter(m => m.id !== "welcome" && m.type !== "image" && m.type !== "video")
        .map(m => {
          if (m.attachments && m.attachments.length > 0) {
            const parts: any[] = [];
            let textContent = `Yêu cầu của tao: ${m.content}\n\n`;
            m.attachments.forEach(att => {
              if (att.isImage) {
                parts.push({ type: 'image', image: att.content });
              } else {
                textContent += `[Nội dung file đính kèm: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\`\n\n`;
              }
            });
            parts.unshift({ type: 'text', text: textContent.trim() });
            return { role: m.role, content: parts.length > 1 ? parts : parts[0].text };
          }
          return { role: m.role, content: m.content };
        });
        
      if (attachments.length > 0) {
        const parts: any[] = [];
        let textContent = `Yêu cầu của tao: ${finalUserText}\n\n`;
        attachments.forEach(att => {
          if (att.isImage) {
            parts.push({ type: 'image', image: att.content });
          } else {
            textContent += `[Nội dung file đính kèm: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\`\n\n`;
          }
        });
        parts.unshift({ type: 'text', text: textContent.trim() });
        chatContext.push({ role: "user", content: parts.length > 1 ? parts : parts[0].text });
      } else {
        chatContext.push({ role: "user", content: finalUserText });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatContext })
      });

      if (!response.ok) {
         throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      while (!done) {
        const { value, done: doneReading } = await reader!.read();
        done = doneReading;
        if (value) {
          text += decoder.decode(value);
          setMediaMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: text } : msg
            )
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMediaMessages((prev) => 
        prev.map(m => m.id === assistantMessage.id 
          ? { ...m, content: `Lỗi kết nối Server: ${errorMessage}`, type: "text" } 
          : m)
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  const allMessages = mediaMessages;

  return (
    <div className="flex h-[100dvh] w-full bg-[#090A0F] text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-[260px] bg-[#000000] border-r border-gray-800/50 flex-col z-50 transition-transform duration-300 md:relative md:flex md:translate-x-0 ${isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden"}`}>
        <div className="p-3">
          <button 
            onClick={() => {
              createNewChat();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-white text-black"><BrainCircuit size={16} /></div>
              Đoạn chat mới
            </div>
            <SquarePen size={18} className="text-gray-400 group-hover:text-gray-200" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent space-y-0.5 pb-4">
          <button onClick={() => alert('Tính năng Tìm kiếm đang được rèn trong lò bát quái! 🔥')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <Search size={18} className="text-gray-400" /> Tìm kiếm đoạn chat
          </button>
          <div className="h-px bg-gray-800/50 my-2 mx-2" />
          <button onClick={() => alert('Tính năng Thư viện đang được rèn trong lò bát quái! 🔥')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <Library size={18} className="text-gray-400" /> Thư viện
          </button>
          <button onClick={() => alert('Tính năng Dự án đang được rèn trong lò bát quái! 🔥')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <Folder size={18} className="text-gray-400" /> Dự án
          </button>
          <button onClick={() => alert('Tính năng Ứng dụng đang được rèn trong lò bát quái! 🔥')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <LayoutGrid size={18} className="text-gray-400" /> Ứng dụng
          </button>
          <button onClick={() => alert('Codex Engine đang được upload lên mây! Đợi tý... ☁️')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <TerminalSquare size={18} className="text-gray-400" /> Codex
          </button>
          <button onClick={() => alert('Còn tính năng gì nữa đâu mà bấm? =))))')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-300">
            <MoreHorizontal size={18} className="text-gray-400" /> Thêm
          </button>
          {savedChats.length > 0 && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500">Gần đây</div>
              {savedChats.map(chat => (
                <div key={chat.id} className="relative group w-full">
                  <button 
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setMediaMessages(chat.messages);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium truncate pr-10 ${currentChatId === chat.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-gray-800/50 text-gray-300'}`}
                  >
                    <MessageSquare size={16} className={currentChatId === chat.id ? 'text-indigo-400' : 'text-gray-500 flex-shrink-0'} />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button 
                    onClick={(e) => deleteChat(e, chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <header className="flex-none sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-[#090A0F]/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 md:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <div className="relative group cursor-pointer mr-2">
            {/* Glowing Aura */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur-md opacity-40 group-hover:opacity-100 group-hover:blur-lg animate-pulse transition-all duration-500" />
            {/* Main Logo Box */}
            <div className="relative p-2.5 rounded-xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden">
              {/* Inner Gradient Tint */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 via-purple-500/40 to-pink-500/30" />
              {/* Auto sweep effect */}
              <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sweep" />
              <BrainCircuit size={26} className="text-white relative z-10 animate-brain-pulse" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              CMN AI
              <Sparkles size={18} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
            </h1>
            <span className="text-[10px] uppercase tracking-[0.25em] bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent font-bold -mt-0.5 hidden sm:block drop-shadow-sm">Neural Core Engine</span>
          </div>
        </div>
        <div className="w-8 md:hidden" /> {/* Spacer to balance header */}
      </header>

      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-32">
          <AnimatePresence initial={false}>
            {allMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[80%] gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "user" ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-[#090A0F]">
                        <User size={18} className="text-white drop-shadow-md" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-[#090A0F]">
                        <BrainCircuit size={18} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-full`}
                  >
                    {msg.role === "assistant" && msg.content === "" && isMediaLoading && index === allMessages.length - 1 ? (
                      <div className="relative px-6 py-4 text-[15px] leading-relaxed shadow-xl backdrop-blur-sm bg-[#151821]/90 text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700/50 shadow-black/40 flex items-center gap-3 mt-1 w-fit">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm font-medium text-indigo-300/80 animate-pulse">Đợi xíu, đang vắt óc suy nghĩ...</span>
                      </div>
                    ) : msg.content ? (
                      <div className={`relative flex flex-col group/msg ${msg.role === "user" ? "items-end" : "items-start"} w-full`}>
                      {msg.role === "assistant" && msg.content !== "..." && msg.type !== "image" && msg.type !== "video" && (msg.content.length > 80 || msg.content.includes('\n')) && (
                        <div className="flex items-center justify-end w-full mb-1.5 opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              setCopiedId(msg.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
                            title="Sao chép toàn bộ tin nhắn"
                          >
                            {copiedId === msg.id ? (
                              <><Check size={14} className="text-green-400" /> <span className="text-green-400">Đã chép</span></>
                            ) : (
                              <><Copy size={14} /> <span>Sao chép</span></>
                            )}
                          </button>
                        </div>
                      )}
                        <div 
                          className={`relative px-5 py-3.5 text-[15px] leading-relaxed shadow-xl backdrop-blur-sm w-fit max-w-full overflow-hidden break-words
                            ${msg.role === "user" 
                              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm border border-indigo-400/20" 
                              : "bg-[#151821]/90 text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700/50 shadow-black/40"
                            }
                          `}
                        >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {msg.attachments.map(att => (
                              <div key={att.id} className={`p-1.5 rounded-lg text-sm font-medium border ${msg.role === "user" ? "bg-black/20 border-white/10" : "bg-gray-800/50 border-gray-700"}`}>
                                {att.isImage ? (
                                  <img src={att.content} alt={att.name} className="max-w-[200px] h-auto max-h-[150px] rounded object-contain" />
                                ) : (
                                  <div className="flex items-center gap-2 px-2 py-1 text-indigo-200">
                                    <Paperclip size={14} />
                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = inline;
                            const language = match ? match[1] : "text";
                            const codeString = String(children).replace(/\n$/, "");
                            
                            return !isInline ? (
                              <div className="my-4 rounded-xl overflow-hidden border border-gray-700/50 bg-[#0E1117] shadow-lg max-w-full">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-[#2f2f2f] text-gray-300 border-b border-gray-700/50">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold">&lt;/&gt;</span>
                                    <span className="text-xs font-sans font-medium capitalize">{language}</span>
                                  </div>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(codeString)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Copy code"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                                <div className="p-4 overflow-x-auto text-sm max-w-full bg-[#0d0d0d]">
                                  <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={language}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: 0, background: "transparent" }}
                                    {...props}
                                  >
                                    {codeString}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            ) : (
                              <code className="px-1.5 py-0.5 rounded-md bg-gray-800 text-indigo-300 text-[13px] font-mono break-all whitespace-pre-wrap" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p({ node, children, ...props }: any) {
                            return <p className="leading-relaxed mb-3 text-gray-200 last:mb-0" {...props}>{children}</p>;
                          },
                          ul({ node, children, ...props }: any) {
                            return <ul className="list-none pl-2 mb-4 space-y-2" {...props}>{children}</ul>;
                          },
                          ol({ node, children, ...props }: any) {
                            return <ol className="list-decimal pl-6 mb-4 space-y-2 text-indigo-300 font-medium" {...props}>{children}</ol>;
                          },
                          li({ node, children, ...props }: any) {
                            const isOrdered = node?.parent?.tagName === 'ol';
                            return (
                              <li className={`relative ${!isOrdered ? "pl-6" : "pl-1 text-gray-200 font-normal"}`} {...props}>
                                {!isOrdered && (
                                  <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                )}
                                <span className={!isOrdered ? "text-gray-200" : ""}>{children}</span>
                              </li>
                            );
                          },
                          h1({ node, children, ...props }: any) {
                            return <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4 mt-6 drop-shadow-sm" {...props}>{children}</h1>;
                          },
                          h2({ node, children, ...props }: any) {
                            return <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3 mt-5" {...props}>{children}</h2>;
                          },
                          h3({ node, children, ...props }: any) {
                            return <h3 className="text-lg font-bold text-indigo-300 mb-2 mt-4" {...props}>{children}</h3>;
                          },
                          a({ node, children, href, ...props }: any) {
                            return <a href={href} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 underline underline-offset-4 decoration-pink-500/30 hover:decoration-pink-400 transition-colors" {...props}>{children}</a>;
                          },
                          strong({ node, children, ...props }: any) {
                            return <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 drop-shadow-sm" {...props}>{children}</strong>;
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      </div>
                      </div>
                    ) : null}
                    {msg.type === "image" && msg.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-700/50 bg-black/50 flex items-center justify-center relative group">
                        <img 
                          src={msg.imageUrl} 
                          alt="AI Generated" 
                          className="w-full max-w-sm h-auto object-cover rounded-xl shadow-lg"
                          onLoad={() => scrollToBottom()}
                        />
                      </div>
                    )}
                    {msg.type === "video" && msg.videoUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-700/50 bg-black/50 flex items-center justify-center relative group">
                        <video 
                          src={msg.videoUrl} 
                          controls
                          autoPlay
                          loop
                          className="w-full max-w-sm h-auto object-cover rounded-xl shadow-lg"
                          onLoadedData={() => scrollToBottom()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <div className="p-4 sm:p-6 bg-gradient-to-t from-[#090A0F] via-[#090A0F] to-transparent sticky bottom-0 z-10">
        <div 
          className={`max-w-3xl mx-auto flex flex-col p-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-2xl bg-[#151821]/80 border-gray-700/60 shadow-black/40 focus-within:border-indigo-500/40 focus-within:shadow-indigo-500/10`}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-2 pb-2 text-sm text-indigo-300 font-medium border-b border-gray-800/50 mb-2">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-2 bg-gray-800/60 rounded-md p-1 border border-gray-700/50 pr-2">
                  {att.isImage ? (
                    <img src={att.content} alt="preview" className="w-8 h-8 rounded object-cover border border-gray-600" />
                  ) : (
                    <div className="p-1.5 bg-indigo-500/20 rounded-md"><Paperclip size={14} className="text-indigo-400" /></div>
                  )}
                  <span className="truncate max-w-[150px]">{att.name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-md transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mr-2 rounded-xl text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
              title="Đính kèm file văn bản"
            >
                <Paperclip size={20} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.py,.csv,.log,.html,.css,.jpg,.jpeg,.png,.webp,.gif" 
                multiple
              />
            </button>
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 mr-2 rounded-xl transition-all ${
                isRecording 
                  ? "text-red-400 bg-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.5)] animate-pulse" 
                  : "text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              }`}
              title="Nhập bằng giọng nói"
            >
              {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhắn gì đi bro..."
              className="flex-1 max-h-40 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none text-gray-100 placeholder-gray-500 py-2.5 px-2 text-base"
              rows={1}
            />

          <button
            type="button"
            onClick={(e) => handleSend(e)}
            disabled={isMediaLoading}
            className={`p-3 ml-2 rounded-xl transition-all duration-300 shadow-lg active:scale-95 ${
              isMediaLoading
                ? "bg-gray-800/50 text-gray-500 shadow-none cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white shadow-pink-500/25 hover:shadow-pink-500/40"
            }`}
          >
            {isMediaLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </button>
          </div>
        </div>
        <p className="hidden sm:block text-center text-xs text-gray-600 mt-3 font-medium tracking-wide">
          CMN AI Neural Engine • Built by Phạm Thành Tấn ( TDUS )
        </p>
        </div>
      </div>
    </div>
  );
}
