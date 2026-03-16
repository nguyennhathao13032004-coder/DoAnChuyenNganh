import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartPulse, ShoppingCart, ArrowLeft, ShieldCheck, Star, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Dữ liệu giả cho một sản phẩm (Sau này Hào sẽ dùng useParams để fetch dữ liệu thật)
  const product = {
    name: "Vitamin C 1000mg Nature Made - Tăng đề kháng",
    price: 350000,
    oldPrice: 400000,
    category: "Vitamin",
    description: "Sản phẩm cung cấp hàm lượng Vitamin C cao giúp tăng cường hệ miễn dịch, chống oxy hóa và hỗ trợ làm đẹp da từ bên trong.",
    specs: "Hộp 100 viên",
    origin: "Mỹ (USA)",
    usage: "Uống 1 viên mỗi ngày sau bữa ăn sáng.",
    img: 'https://placehold.co/600x600/fff7ed/ea580c?text=Vitamin+C&font=Montserrat'
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Header đơn giản */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <HeartPulse size={28} className="text-brand" />
            <span className="text-2xl font-black">SaHa</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors text-sm font-bold">
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* BÊN TRÁI: Ảnh sản phẩm */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 group">
              <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>

          {/* BÊN PHẢI: Thông tin đặt hàng */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest mb-3">
              <ShieldCheck size={16} /> Chính hãng {product.origin}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span className="text-slate-400 text-sm border-l pl-4 font-medium">Đã bán 1.2k</span>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl mb-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-brand">{product.price.toLocaleString()}đ</span>
                {product.oldPrice && (
                  <span className="text-lg text-slate-400 line-through font-medium">{product.oldPrice.toLocaleString()}đ</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium italic">* Giá đã bao gồm thuế VAT</p>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Chọn số lượng */}
            <div className="space-y-4 mb-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Số lượng</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-slate-400 text-sm">Còn 45 sản phẩm tại cửa hàng</span>
              </div>
            </div>

            {/* Nút mua hàng */}
            <div className="flex gap-4">
              <button className="flex-1 bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <ShoppingCart size={22} /> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI: Thông tin chi tiết (Tabs) */}
        <div className="mt-20 border-t border-slate-100 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm leading-relaxed">
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 text-lg uppercase">Công dụng</h4>
              <p className="text-slate-500">{product.description}</p>
            </div>
            <div className="space-y-4 border-x border-slate-100 md:px-12">
              <h4 className="font-black text-slate-900 text-lg uppercase">Thông số</h4>
              <ul className="space-y-3">
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Quy cách</span>
                  <span className="font-bold text-slate-700">{product.specs}</span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Xuất xứ</span>
                  <span className="font-bold text-slate-700">{product.origin}</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 text-lg uppercase">Cách dùng</h4>
              <p className="text-slate-500">{product.usage}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;