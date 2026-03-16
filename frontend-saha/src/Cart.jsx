import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Trash2, Minus, Plus, ArrowLeft, CreditCard } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  
  // Dữ liệu giả để làm giao diện (Sau này sẽ lấy từ State chung)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Vitamin C 1000mg Nature Made", price: 350000, quantity: 2, img: 'https://placehold.co/100x100/fff7ed/ea580c?text=C' },
    { id: 2, name: "Khẩu trang 3D Mask Nhật Bản", price: 50000, quantity: 5, img: 'https://placehold.co/100x100/fff7ed/ea580c?text=Mask' },
  ]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 30000;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <HeartPulse size={28} className="text-brand" />
            <span className="text-2xl font-black">SaHa</span>
          </div>
          <h2 className="text-lg font-bold text-slate-600">Giỏ hàng của bạn</h2>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors mb-8 text-sm font-bold"
        >
          <ArrowLeft size={18} /> Tiếp tục mua sắm
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* DANH SÁCH SẢN PHẨM (Bên trái) */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-6">
                <img src={item.img} className="w-20 h-20 rounded-2xl object-cover bg-slate-50" />
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h4>
                  <p className="text-brand font-black text-base">{item.price.toLocaleString()}đ</p>
                </div>

                <div className="flex items-center border border-slate-100 rounded-xl p-1 bg-slate-50">
                  <button className="p-1.5 hover:text-brand transition-colors"><Minus size={16} /></button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button className="p-1.5 hover:text-brand transition-colors"><Plus size={16} /></button>
                </div>

                <button className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* TỔNG TIỀN & THANH TOÁN (Bên phải) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 sticky top-28">
              <h3 className="text-xl font-black mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính</span>
                  <span className="font-bold text-slate-800">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-slate-800">{shipping.toLocaleString()}đ</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Tổng cộng</span>
                  <span className="text-2xl font-black text-brand">{(subtotal + shipping).toLocaleString()}đ</span>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <CreditCard size={20} /> Thanh toán ngay
              </button>

              <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed">
                Bằng cách bấm thanh toán, bạn đồng ý với các chính sách mua hàng của hệ thống nhà thuốc SaHa.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Cart;