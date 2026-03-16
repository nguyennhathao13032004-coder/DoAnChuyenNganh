import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, Search, ShoppingCart, User, 
  ChevronRight, Filter, SlidersHorizontal, Check 
} from 'lucide-react';

const ProductPage = () => {
  const navigate = useNavigate();
  
  // Dữ liệu giả cho bộ lọc
  const filters = {
    categories: ['Vitamins', 'Dược mỹ phẩm', 'Thiết bị y tế', 'Mẹ & Bé', 'Chăm sóc cá nhân'],
    brands: ['DHC Nhật Bản', 'Nature Made', 'Blackmores', 'La Roche-Posay'],
    prices: ['Dưới 200.000đ', '200.000đ - 500.000đ', 'Trên 500.000đ']
  };

  // Tận dụng lại dữ liệu mock cũ (Hào có thể copy từ App.jsx qua)
  const products = [
    { id: '1', name: 'Vitamin C 1000mg Nature Made - Tăng đề kháng', price: 350000, category: 'Vitamin', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=Vitamin+C' },
    { id: '2', name: 'Omega 3 Fish Oil Cao Cấp Nhập Khẩu Mỹ', price: 420000, category: 'Tim mạch', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=Omega+3' },
    { id: '3', name: 'Viên Uống Bổ Não Ginkgo Biloba 120mg', price: 280000, category: 'Thần kinh', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=Ginkgo' },
    { id: '4', name: 'Canxi & D3 Hỗ Trợ Xương Khớp Chắc Khỏe', price: 310000, category: 'Xương khớp', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=Canxi+D3' },
    { id: '5', name: 'Kẽm (Zinc) 50mg Giảm Mụn, Đẹp Da', price: 180000, category: 'Làm đẹp', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=Zinc' },
    { id: '6', name: 'Viên uống DHC Multi Vitamins Nhật Bản', price: 270000, category: 'Vitamin', img: 'https://placehold.co/400x400/fff7ed/1e293b?text=DHC' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* 1. BREADCRUMB (Đường dẫn) */}
      <div className="bg-slate-50 py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span onClick={() => navigate('/')} className="cursor-pointer hover:text-slate-900">Trang chủ</span>
          <ChevronRight size={12} />
          <span className="text-slate-900">Tất cả sản phẩm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        
        {/* 2. SIDEBAR BỘ LỌC (Minimalist Sidebar) */}
        <aside className="w-full md:w-64 shrink-0 space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Filter size={18} className="text-slate-900" />
              <h3 className="font-black text-sm uppercase tracking-widest">Bộ lọc</h3>
            </div>
            
            {/* Lọc theo danh mục */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Danh mục</h4>
                <div className="space-y-3">
                  {filters.categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center group-hover:border-slate-900 transition-colors">
                        <Check size={10} className="text-white bg-slate-900 w-full h-full p-0.5 rounded-sm opacity-0 group-hover:opacity-100" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Lọc theo giá */}
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Khoảng giá</h4>
                <div className="space-y-3">
                  {filters.prices.map(price => (
                    <label key={price} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border-2 border-slate-200 rounded-full flex items-center justify-center group-hover:border-slate-900 transition-colors">
                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full opacity-0 group-hover:opacity-100" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. DANH SÁCH SẢN PHẨM */}
        <main className="flex-1">
          {/* Top Bar sản phẩm */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
            <p className="text-xs font-bold text-slate-400">Hiển thị <span className="text-slate-900">1-12</span> của 45 sản phẩm</p>
            <div className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <SlidersHorizontal size={16} />
              <span>Sắp xếp: Mới nhất</span>
            </div>
          </div>

          {/* Grid sản phẩm */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden mb-5 relative border border-slate-50">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <button className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Xem chi tiết
                  </button>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{product.category}</p>
                <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-slate-900">{product.name}</h4>
                <div className="text-base font-black text-slate-900">{product.price.toLocaleString()}đ</div>
              </div>
            ))}
          </div>

          {/* Nút xem thêm tối giản */}
          <div className="mt-20 flex justify-center">
            <button className="px-12 py-4 border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300">
              Tải thêm sản phẩm
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductPage;