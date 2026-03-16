import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User, Minus } from 'lucide-react';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Chào Hào! Mình là Dược sĩ AI của SaHa. Bạn cần mình tư vấn về loại thuốc hay cách chăm sóc sức khỏe nào không?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Thêm tin nhắn của người dùng
    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages([...messages, userMsg]);
    setInput("");

    // Giả lập AI đang trả lời (Tuần 9 sẽ thay bằng Gemini thật)
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: "Cảm ơn bạn, mình đang nghiên cứu câu hỏi này...", isBot: true };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* 1. NÚT BẤM NỔI (Floating Button) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand text-white p-4 rounded-full shadow-2xl shadow-brand/40 hover:scale-110 transition-all flex items-center gap-3 group animate-bounce-slow"
        >
          <Sparkles size={28} className="animate-pulse" />
          <span className="font-bold pr-2">Hỏi Dược Sĩ AI</span>
        </button>
      )}

      {/* 2. KHUNG CHAT (Chat Window) */}
      {isOpen && (
        <div className="bg-white w-[380px] h-[550px] rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header Khung Chat */}
          <div className="bg-brand p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Dược Sĩ AI SaHa</h4>
                <div className="flex items-center gap-1.5 text-[10px] opacity-80 uppercase tracking-widest font-bold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> Đang trực tuyến
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Nội dung tin nhắn (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                  msg.isBot 
                    ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                    : 'bg-brand text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập liệu */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về sức khỏe..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-brand text-white p-3 rounded-xl hover:bg-brand-hover transition-all disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAI;