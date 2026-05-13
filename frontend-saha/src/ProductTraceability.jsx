import React, { useState } from 'react';
import axios from 'axios';
import { ScanLine, X, MapPin, CheckCircle, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5246/api';

const ProductTraceability = ({ productId }) => {
  const [showModal, setShowModal] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenTraceability = async () => {
    setShowModal(true);
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/Products/${productId}/traceability`);
      setTraceData(response.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin truy xuất:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpenTraceability}
        className="mt-4 w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
      >
        <ScanLine size={20} className="text-emerald-400" /> 
        Truy xuất nguồn gốc (QR Code)
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl relative flex overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:text-red-500 transition-colors z-10">
              <X size={20} />
            </button>

            {/* CỘT TRÁI: MÃ QR (ĐÃ DÙNG API THAY VÌ THƯ VIỆN LỖI) */}
            <div className="w-1/3 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-slate-100">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`http://192.168.1.8:5173/product/${productId}`)}`} 
                   alt="QR Traceability" 
                   className="w-40 h-40 object-contain"
                 />
              </div>
              <h4 className="font-black text-slate-800 text-center mb-2">QUÉT MÃ QR</h4>
              <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
                Quét mã này bằng Zalo hoặc Camera để kiểm tra chứng nhận hàng chính hãng.
              </p>
            </div>

            {/* CỘT PHẢI: DÒNG THỜI GIAN (TIMELINE) */}
            <div className="w-2/3 p-8 overflow-y-auto">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Hành trình sản phẩm</h3>
              <p className="text-slate-500 font-medium mb-8">
                {loading ? 'Đang truy xuất dữ liệu Blockchain...' : traceData?.productName}
              </p>

              {loading ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl w-full"></div>)}
                </div>
              ) : (
                <div className="relative border-l-2 border-emerald-100 ml-3 space-y-8 pb-4">
                  {traceData?.timeline?.map((item, index) => (
                    <div key={index} className="relative pl-8">
                      <span className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${item.status === 'active' ? 'bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]' : 'bg-emerald-500'}`}></span>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1"><Clock size={12}/> {item.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                      <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 mt-1.5 mb-1.5"><MapPin size={14}/> {item.location}</p>
                      <p className="text-sm text-slate-500 font-medium">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductTraceability;