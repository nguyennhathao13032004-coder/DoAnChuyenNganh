import React, { useState, useEffect } from 'react';
// 🔥 Đã thêm: BrainCircuit, Sparkles, Volume2, Play cho phần AI
import { Package, Truck, Clock, Home, ChevronRight, Eye, X, ReceiptText, ShoppingBag, BrainCircuit, Sparkles, Volume2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ==========================================
  // 🔥 THÊM MỚI: STATE DÀNH CHO TRỢ LÝ AI
  // ==========================================
  const [aiData, setAiData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5246/api/Orders/${currentUser.id}`);
        // 🔥 IN RA CONSOLE ĐỂ SẾP KIỂM TRA TẬN MẮT
        console.log("👉 DATA TỪ C# GỬI SANG ĐÂY SẾP:", response.data); 
        setOrders(response.data);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // ==========================================
  // 🔥 THÊM MỚI: EFFECT GỌI API PHÂN TÍCH AI KHI MỞ MODAL
  // ==========================================
  useEffect(() => {
    if (selectedOrder) {
      const fetchAiAnalysis = async () => {
        setIsAiLoading(true);
        try {
          const res = await axios.get(`http://localhost:5246/api/Orders/${selectedOrder.id}/ai-analysis`);
          setAiData(res.data);
        } catch (err) {
          console.error("Lỗi AI Analysis:", err);
          setAiData({ isSafe: true, advice: "Không thể kết nối đến Trợ lý AI lúc này." });
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchAiAnalysis();
    } else {
      window.speechSynthesis?.cancel();
      setAiData(null);
      setIsSpeaking(false);
    }
  }, [selectedOrder]);

  // ==========================================
  // 🔥 THÊM MỚI: HÀM PHÁT GIỌNG NÓI AI
  // ==========================================
  const speakAI = (text) => {
    if (!window.speechSynthesis) {
      alert("Trình duyệt không hỗ trợ giọng nói!");
      return;
    }
    
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'vi-VN';
    msg.rate = 0.9;
    
    msg.onstart = () => setIsSpeaking(true);
    msg.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(msg);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  // ==========================================
  // HÀM "BẮT" DỮ LIỆU CHỐNG ĐẠN (QUÉT MỌI TRƯỜNG HỢP TÊN BIẾN)
  // ==========================================
  const getItemsList = (order) => {
    return order.orderItems || order.OrderItems || order.items || [];
  };

  const parseItem = (rawItem) => {
    return {
      name: rawItem.productName || rawItem.ProductName || "Sản phẩm",
      qty: rawItem.quantity || rawItem.qty || rawItem.Qty || 1,
      price: rawItem.price || rawItem.priceAtPurchase || rawItem.PriceAtPurchase || 0,
      image: rawItem.imageUrl || rawItem.ImageUrl || "" // Dòng này cực kỳ quan trọng!
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto mt-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-sm font-semibold mb-8">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-orange-500 transition">
            <Home size={18} /> Trang chủ
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <div onClick={() => navigate('/profile')} className="cursor-pointer text-slate-500 hover:text-orange-500 transition">
            Hồ sơ cá nhân
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-orange-500">Lịch sử đơn hàng</span>
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Package className="text-orange-500" size={32} /> Lịch sử đơn hàng
        </h2>

        {loading ? (
          <div className="text-center text-slate-500 py-10 font-bold flex justify-center items-center gap-2">
             <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             Đang tải dữ liệu...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-slate-100">
            <p className="text-slate-500 font-medium mb-4">Bạn chưa có đơn hàng nào.</p>
            <button onClick={() => navigate('/')} className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-colors">
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const currentItems = getItemsList(order); // Lấy danh sách sản phẩm chống đạn

              return (
                <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  
                  {/* Header: Đơn hàng & Trạng thái */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg text-sm">
                        Đơn #{String(order.id).substring(0, 8)}
                      </span>
                      <span className="text-slate-400 text-sm flex items-center gap-1 hidden sm:flex">
                        <Clock size={14}/> {new Date(order.createdAt || order.CreatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="bg-orange-50 text-orange-600 font-bold px-4 py-1.5 rounded-full text-[11px] flex items-center gap-2 uppercase tracking-wider">
                      <Truck size={14} /> {(order.status || order.Status) === 'pending' ? 'Đang xử lý' : (order.status || order.Status)}
                    </span>
                  </div>
                  
                  {/* Body: HIỂN THỊ DANH SÁCH SẢN PHẨM TRÊN THẺ */}
                  <div className="mb-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                    {currentItems.length > 0 ? (
                      <>
                        {currentItems.slice(0, 2).map((rawItem, idx) => {
                          const item = parseItem(rawItem); 
                          return (
                            <div key={idx} className="flex items-center gap-4 mb-3 border-b border-slate-200/50 pb-3 last:border-0 last:mb-0 last:pb-0">
                              
                              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm overflow-hidden">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover p-1" 
                                  />
                                ) : (
                                  <span className="text-slate-300 font-black uppercase text-xs">
                                    {item.name.charAt(0)}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1">
                                <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h5>
                                <p className="text-slate-500 text-xs font-medium mt-1">Số lượng: <span className="font-bold text-slate-700">x{item.qty}</span></p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900 text-sm">{formatVND(item.price)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-400 text-sm font-medium italic justify-center py-2">
                        <ShoppingBag size={16} /> Backend đang không đính kèm danh sách chi tiết sản phẩm.
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium text-sm">Thành tiền:</span>
                      <span className="text-2xl font-black text-orange-500">{formatVND(order.totalAmount || order.TotalAmount)}</span>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
                    >
                      <Eye size={16} className="group-hover:scale-110 transition-transform" /> Xem hóa đơn đầy đủ
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )} 
      </div>

      {/* ================= MODAL CỬA SỔ CHI TIẾT ĐƠN HÀNG ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ReceiptText className="text-orange-500" size={20} /> Chi tiết Đơn #{String(selectedOrder.id).substring(0, 8)}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              <div className="mb-6">
                 <p className="font-bold text-slate-800 mb-2 text-sm">Thông tin nhận hàng:</p>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    <p>{selectedOrder.shippingAddress || selectedOrder.ShippingAddress || 'Chưa cập nhật địa chỉ'}</p>
                 </div>
              </div>

              {/* ==========================================
                  🔥 THÊM MỚI: KHỐI TRỢ LÝ SAHA AI
                  ========================================== */}
              <div className={`mb-6 p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden ${aiData?.isSafe === false ? 'bg-red-50 border-red-200' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'}`}>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${aiData?.isSafe === false ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <Sparkles size={16} />
                    </div>
                    <h4 className={`font-black text-sm uppercase tracking-wider ${aiData?.isSafe === false ? 'text-red-900' : 'text-emerald-900'}`}>
                      SaHa AI Phân tích
                    </h4>
                  </div>
                  
                  {/* Nút Play Giọng Nói */}
                  <button 
                    onClick={() => speakAI(aiData?.advice)}
                    disabled={isAiLoading}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-orange-500 text-white shadow-lg animate-pulse' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'} ${isAiLoading && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {isSpeaking ? <Volume2 size={20} /> : <Play size={20} fill="currentColor" />}
                  </button>
                </div>

                <div className="relative z-10">
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 italic">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Đang phân tích tương tác thuốc...
                    </div>
                  ) : (
                    <p className={`text-sm font-medium leading-relaxed ${aiData?.isSafe === false ? 'text-red-700' : 'text-emerald-700'}`}>
                      {aiData?.advice}
                    </p>
                  )}
                </div>
              </div>
              {/* === END KHỐI TRỢ LÝ AI === */}

              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Toàn bộ sản phẩm</h4>
              <div className="space-y-3 mb-6">
                {getItemsList(selectedOrder).length > 0 ? (
                  getItemsList(selectedOrder).map((rawItem, idx) => {
                    const item = parseItem(rawItem);
                    return (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-orange-200 transition-colors">
    
                      {/* KHUNG ẢNH NHỎ TRONG MODAL */}
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm">
                        {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover p-1" 
                        />
                    ) : (
        <span className="text-slate-300 font-black uppercase text-xs">
          {item.name.charAt(0)}
        </span>
      )}
    </div>

    <div className="flex-1">
      <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h5>
      <p className="text-slate-500 text-[11px] font-medium">Đơn giá: {formatVND(item.price)}</p>
    </div>

    <div className="text-right">
      <p className="text-[10px] text-slate-400 font-bold mb-0.5">x{item.qty}</p>
      <p className="font-black text-slate-900 text-sm">{formatVND(item.price * item.qty)}</p>
    </div>
  </div>
);
                  })
                ) : (
                  <div className="text-center p-4 text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-xl">
                    Chưa có dữ liệu chi tiết sản phẩm.
                  </div>
                )}
              </div>

              <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Tổng cộng:</span>
                  <span className="text-xl font-black text-orange-600">{formatVND(selectedOrder.totalAmount || selectedOrder.TotalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;