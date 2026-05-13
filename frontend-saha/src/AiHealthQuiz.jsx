import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ArrowRight, Loader2, ShoppingCart, Stethoscope, ChevronRight, ShieldCheck, Mic, MicOff, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const AiHealthQuiz = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [formData, setFormData] = useState({ name: '', age: '', goal: '', symptoms: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 🔥 STATE CHO GIỌNG NÓI
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🔥 1. CÀI ĐẶT BỘ NHẬN DIỆN GIỌNG NÓI (Speech-to-Text)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'vi-VN'; // Định dạng tiếng Việt
    recognition.interimResults = false;
  }

  const toggleListen = () => {
    if (!recognition) {
      alert("Trình duyệt của sếp không hỗ trợ nhận diện giọng nói (Hãy dùng Chrome hoặc Edge bản mới nhất nhé)!");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Tự động nối chữ vừa nói vào ô triệu chứng
        setFormData(prev => ({ 
          ...prev, 
          symptoms: prev.symptoms ? prev.symptoms + " " + transcript : transcript 
        }));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Lỗi Mic:", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => setIsListening(false);
    }
  };

  // 🔥 2. CÀI ĐẶT BỘ PHÁT ÂM (Text-to-Speech)
  const speakAdvice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Tắt giọng cũ nếu đang đọc dở
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN'; // Đọc tiếng Việt
      utterance.rate = 1.0; // Tốc độ đọc
      utterance.pitch = 1.0; // Cao độ
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tắt tiếng nếu người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goal) return alert("Sếp nhớ chọn Mục tiêu cải thiện nhé!");
    
    setLoading(true);
    setResult(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel(); // Ngừng đọc khi gửi form mới

    try {
      const res = await axios.post('http://localhost:5246/api/Products/ai-health-quiz', formData);
      setResult(res.data);
      
      // 🔥 TỰ ĐỘNG ĐỌC KẾT QUẢ KHI CÓ PHẢN HỒI TỪ AI
      speakAdvice(res.data.advice);

    } catch (error) {
      console.error(error);
      alert("Hệ thống AI đang bận, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id || product.Id,
      name: product.name || product.Name,
      price: product.price || product.Price,
      imageUrl: product.imageUrl || product.ImageUrl,
      quantity: 1
    });
    alert(`🎉 Đã thêm "${product.name || product.Name}" vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-600 pt-8 pb-24 px-8 relative overflow-hidden">
        {/* ... (Banner giữ nguyên như cũ để không làm dài code) ... */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 mt-8 leading-tight">
              Tư Vấn Cùng SaHa <br/> <span className="text-emerald-200 font-light italic">Voice AI - Lắng nghe & Thấu hiểu</span>
            </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: FORM ĐIỀN */}
          <div className="flex-1 w-full">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Khám bệnh qua giọng nói</h2>
                  <p className="text-slate-500 font-medium mt-1">Nói hoặc gõ triệu chứng của bạn</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</label>
                    <input required type="text" placeholder="Ví dụ: Nguyễn Nhật Hào" value={formData.name} className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium text-slate-700" onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tuổi của bạn</label>
                    <input required type="number" placeholder="Ví dụ: 22" value={formData.age} className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium text-slate-700" onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mục tiêu cải thiện</label>
                  <select required value={formData.goal} className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 cursor-pointer" onChange={e => setFormData({...formData, goal: e.target.value})}>
                    <option value="">-- Chọn mục tiêu mong muốn --</option>
                    <option value="Tăng cường sinh lý/bổ thận">Tăng cường sinh lý / Bổ thận</option>
                    <option value="Giảm đau xương khớp">Giảm đau nhức xương khớp</option>
                    <option value="Ngủ ngon, giảm stress">Cải thiện giấc ngủ / Giảm stress</option>
                    <option value="Bảo vệ dạ dày/tiêu hóa">Bảo vệ dạ dày / Hỗ trợ tiêu hóa</option>
                    <option value="Tăng sức đề kháng">Tăng sức đề kháng / Hệ miễn dịch</option>
                    <option value="Bổ mắt/Giảm mỏi mắt">Bổ mắt / Giảm nhức mỏi mắt</option>
                    <option value="Giải độc gan">Giải độc gan / Thanh nhiệt</option>
                  </select>
                </div>

                {/* 🔥 KHU VỰC TÍCH HỢP VOICE AI */}
                <div>
                  <div className="flex items-center justify-between ml-1 mb-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mô tả triệu chứng</label>
                    
                    {/* NÚT BẤM ĐỂ NÓI */}
                    <button 
                      type="button"
                      onClick={toggleListen}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isListening 
                        ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                      }`}
                    >
                      {isListening ? <><MicOff size={14} /> Đang nghe...</> : <><Mic size={14} /> Bấm để nói</>}
                    </button>
                  </div>
                  
                  <textarea 
                    required 
                    rows="4" 
                    value={formData.symptoms}
                    placeholder="Sếp có thể gõ hoặc bấm nút Mic ở trên để đọc triệu chứng..." 
                    className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none resize-none transition-all font-medium text-slate-700 leading-relaxed ${isListening ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:border-emerald-500'}`} 
                    onChange={e => setFormData({...formData, symptoms: e.target.value})}
                  ></textarea>
                </div>
                
                <button disabled={loading} className="w-full bg-slate-900 text-white font-black text-lg py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 className="animate-spin" size={24}/> Đang phân tích dữ liệu...</> : <>NHẬN PHÁC ĐỒ TỪ DƯỢC SĨ <ArrowRight size={20} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ KÊ ĐƠN */}
          <div className="w-full lg:w-[450px] sticky top-24">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col relative">
              <div className="bg-emerald-50 p-6 border-b border-emerald-100/50 flex items-center justify-between">
                <h3 className="font-black text-emerald-800 flex items-center gap-2">
                  <Activity size={20} /> KẾT QUẢ CHẨN ĐOÁN
                </h3>
                
                {/* HIỆU ỨNG SÓNG ÂM KHI AI ĐANG ĐỌC */}
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-[bounce_1s_infinite]"></span>
                    <span className="w-1 h-4 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
                    <span className="w-1 h-2 bg-emerald-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {!result ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 my-10">
                    <Activity size={48} className="text-slate-200" />
                    <p className="font-medium text-center text-sm px-8">Hãy điền thông tin hoặc đọc triệu chứng để AI phân tích.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500 pb-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đánh giá cho: {formData.name}</p>
                        
                        {/* NÚT PHÁT LẠI GIỌNG NÓI */}
                        <button 
                          onClick={() => speakAdvice(result.advice)}
                          className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-2 rounded-full"
                          title="Nghe lại chẩn đoán"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                      
                      <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Dược sĩ AI</div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium mt-2">
                          {result.advice}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Sản phẩm đề xuất</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {result.products?.map(product => (
                          <div key={product.id || product.Id} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all items-center cursor-pointer" onClick={() => navigate(`/product/${product.id || product.Id}`)}>
                            <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 p-1">
                              <img src={product.imageUrl || product.ImageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex-1">
                               <h5 className="font-bold text-slate-800 text-sm line-clamp-2">{product.name || product.Name}</h5>
                               <p className="text-orange-600 font-black text-sm mt-1">{(product.price || product.Price).toLocaleString()}đ</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                              className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 hover:bg-orange-500 hover:text-white"
                            >
                               <ShoppingCart size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiHealthQuiz;