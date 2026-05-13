import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, FileText, Loader2, ShoppingCart, ArrowRight, 
  ShieldCheck, FileWarning, HeartPulse, Search, 
  ChevronRight, ScanLine, Sparkles, User,
  ArrowLeft, Activity, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const PrescriptionScanner = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- LOGIC QUÉT ---
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        const base64String = reader.result.split(',')[1];
        handleScan(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (base64Data) => {
    setLoading(true);
    setScanResult(null);
    try {
      const res = await axios.post('http://localhost:5246/api/Products/scan-prescription', {
        ImageBase64: base64Data
      });
      setScanResult(res.data);
    } catch (error) {
      console.error(error);
      alert("AI không đọc được đơn thuốc này, sếp chụp nét hơn xíu nhé!");
    } finally {
      setLoading(false);
    }
  };

  const addAllToCart = () => {
    let count = 0;
    scanResult.results.forEach(item => {
      if (item.productFound) {
        const p = item.productFound;
        addToCart({
          id: p.id || p.Id,
          name: p.name || p.Name,
          price: p.price || p.Price,
          imageUrl: p.imageUrl || p.ImageUrl,
          quantity: 1
        });
        count++;
      }
    });
    alert(`🎉 Đã nhặt thành công ${count} loại thuốc vào giỏ hàng!`);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* BANNER XANH EMERALD GIỐNG TRANG TƯ VẤN */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-600 pt-8 pb-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider mb-10 text-emerald-100">
            <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition-colors">Trang chủ</span>
            <ChevronRight size={16} className="opacity-50" />
            <span className="text-white">Mua thuốc theo đơn AI</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-bold tracking-widest uppercase mb-6 border border-white/20">
              <ShieldCheck size={16} className="text-emerald-300" /> TƯ VẤN BỞI SAHA AI
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Mua Thuốc Theo Đơn <br/> <span className="text-emerald-200 font-light italic text-3xl md:text-4xl">Giải mã chữ bác sĩ & Tự động nhặt hàng</span>
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-2xl font-medium">
              Chụp ảnh đơn thuốc của bạn để Dược sĩ AI phân tích, dịch tên thuốc và chuẩn bị sẵn giỏ hàng cho bạn.
            </p>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH - 2 CỘT */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: KHU VỰC QUÉT */}
          <div className="flex-1 w-full">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Bắt đầu quét đơn</h2>
                  <p className="text-slate-500 font-medium mt-1">Vui lòng tải ảnh đơn thuốc rõ nét</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative w-full h-80 bg-slate-900 rounded-[2rem] overflow-hidden flex items-center justify-center border-4 border-slate-800 group">
                    {imageBase64 ? (
                        <>
                            <img src={imageBase64} alt="Đơn thuốc" className={`w-full h-full object-cover transition-all ${loading ? 'opacity-40 grayscale' : 'opacity-80'}`} />
                            {loading && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-[bounce_2s_infinite]"></div>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-slate-600">
                            <ScanLine size={64} className="mx-auto mb-4 opacity-20 group-hover:scale-110 transition-transform" />
                            <p className="font-black text-xs uppercase tracking-widest opacity-40">Mắt thần AI đang chờ...</p>
                        </div>
                    )}
                    
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/40 backdrop-blur-sm">
                            <Loader2 size={48} className="text-white animate-spin mb-4" />
                            <p className="text-white font-black tracking-widest uppercase text-xs animate-pulse">Đang giải mã...</p>
                        </div>
                    )}
                </div>

                <input type="file" accept="image/*" id="p-input" onChange={handleImageUpload} className="hidden" />
                <label htmlFor="p-input" className="w-full bg-slate-900 text-white font-black text-lg py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group hover:-translate-y-1">
                  <Camera size={24} /> {imageBase64 ? "CHỤP LẠI ĐƠN THUỐC" : "CHỤP HOẶC TẢI ĐƠN THUỐC"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ */}
          <div className="w-full lg:w-[450px] sticky top-24">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col relative">
              <div className="bg-emerald-50 p-6 border-b border-emerald-100/50 flex items-center justify-between">
                <h3 className="font-black text-emerald-800 flex items-center gap-2 uppercase tracking-wider text-sm">
                  <Activity size={18} /> Kết quả chẩn đoán
                </h3>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {!scanResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 my-10">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
                      {loading ? (
                          <div className="w-20 h-20 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                      ) : (
                          <div className="w-20 h-20 border-4 border-emerald-200 rounded-full absolute top-0 left-0 border-dashed"></div>
                      )}
                      <Activity size={32} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${loading ? 'text-emerald-500 animate-pulse' : 'text-slate-200'}`} />
                    </div>
                    <p className="font-medium text-center text-sm px-8 text-slate-400 leading-relaxed">
                      {loading ? "Đang truy xuất CSDL Dược quốc gia để đối chiếu..." : "Hãy tải ảnh đơn thuốc lên để Dược sĩ bắt đầu phân tích nhé..."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500 pb-4">
                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Chẩn đoán dự kiến</div>
                        <p className="text-slate-800 text-sm leading-relaxed font-black mt-2">
                          {scanResult.diagnosis}
                        </p>
                    </div>
                    
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sản phẩm tìm thấy</p>
                        {scanResult.results.map((item, idx) => (
  <div key={idx} className="mb-6">
    {/* Tên thuốc gốc mà AI đọc được */}
    <div className="flex items-center gap-2 mb-3 ml-2">
      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
      <span className="font-bold text-slate-700 text-sm">{item.originalName}</span>
      {!item.productFound && (
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-black">HẾT HÀNG</span>
      )}
    </div>

    {/* TRƯỜNG HỢP 1: CÓ HÀNG CHÍNH XÁC */}
    {item.productFound ? (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <img src={item.productFound.imageUrl} className="w-14 h-14 object-contain rounded-lg border" />
        <div className="flex-1">
          <h5 className="font-black text-slate-800 text-sm">{item.productFound.name}</h5>
          <p className="text-orange-600 font-black text-xs">{item.productFound.price.toLocaleString()}đ</p>
        </div>
        <ShieldCheck size={20} className="text-emerald-500" />
      </div>
    ) : (
      /* TRƯỜNG HỢP 2: KHÔNG CÓ HÀNG -> HIỆN ĐỀ XUẤT TƯƠNG TỰ */
      <div className="space-y-3">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2 flex items-center gap-1">
          <Sparkles size={12} /> AI đề xuất sản phẩm tương tự:
        </p>
        
        {item.suggestions && item.suggestions.length > 0 ? (
          item.suggestions.map((sug) => (
            <div key={sug.id} className="flex items-center gap-3 p-3 rounded-2xl border border-blue-50 bg-blue-50/30 hover:border-blue-300 transition-all group">
              <img src={sug.imageUrl} className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
              <div className="flex-1">
                <h5 className="font-bold text-slate-800 text-[12px] line-clamp-1">{sug.name}</h5>
                <p className="text-blue-600 font-black text-[11px]">{sug.price.toLocaleString()}đ</p>
              </div>
              <button 
                onClick={() => addToCart({...sug, quantity: 1})}
                className="bg-white p-2 rounded-full text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-bold">
            Hiện tại chưa có sản phẩm tương tự trong kho
          </div>
        )}
      </div>
    )}
  </div>
))}
                    </div>

                    <button onClick={addAllToCart} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-xl group">
                        <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> THÊM TẤT CẢ VÀO GIỎ
                    </button>

                    <button onClick={() => { setScanResult(null); setImageBase64(null); }} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-800 underline transition-colors">
                      Quét đơn khác
                    </button>
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

export default PrescriptionScanner;