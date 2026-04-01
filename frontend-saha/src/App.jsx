import React, { useState } from 'react';
import ChatAI from './ChatAI.jsx';
import { 
  Search, ShoppingCart, User, Phone, ShieldCheck, 
  ChevronRight, HeartPulse, Sparkles, MapPin, Mail, 
  Facebook, Instagram, Youtube, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// // === DỮ LIỆU GIẢ (MOCK DATA) ===
// const mockCategories = [
//   { id: 1, name: 'Vitamin & Khoáng chất', icon: '💊' },
//   { id: 2, name: 'Hỗ trợ tiêu hóa', icon: '🌿' },
//   { id: 3, name: 'Xương khớp', icon: '🦴' },
//   { id: 4, name: 'Đề kháng', icon: '🛡️' },
//   { id: 5, name: 'Làm đẹp', icon: '✨' },
// ];

// const mockProducts = [
  
//   { id: '1', name: 'Vitamin C 1000mg Nature Made - Tăng đề kháng', price: 350000, oldPrice: 400000, category: 'Vitamin', img: 'https://placehold.co/400x400/fff7ed/ea580c?text=Vitamin+C&font=Montserrat' },
//   { id: '2', name: 'Omega 3 Fish Oil Cao Cấp Nhập Khẩu Mỹ', price: 420000, oldPrice: 500000, category: 'Tim mạch', img: 'https://placehold.co/400x400/fff7ed/ea580c?text=Omega+3&font=Montserrat' },
//   { id: '3', name: 'Viên Uống Bổ Não Ginkgo Biloba 120mg', price: 280000, oldPrice: null, category: 'Thần kinh', img: 'https://placehold.co/400x400/fff7ed/ea580c?text=Ginkgo&font=Montserrat' },
//   { id: '4', name: 'Canxi & D3 Hỗ Trợ Xương Khớp Chắc Khỏe', price: 310000, oldPrice: 350000, category: 'Xương khớp', img: 'https://placehold.co/400x400/fff7ed/ea580c?text=Canxi+D3&font=Montserrat' },
//   { id: '5', name: 'Kẽm (Zinc) 50mg Giảm Mụn, Đẹp Da', price: 180000, oldPrice: 200000, category: 'Làm đẹp', img: 'https://placehold.co/400x400/fff7ed/ea580c?text=Zinc+50mg&font=Montserrat' },
// ];

// const mockBlogs = [
//   { id: 1, title: '5 Loại Vitamin Cần Thiết Cho Mùa Bệnh Dịch', date: '12/10/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+1' },
//   { id: 2, title: 'Cách Phân Biệt Omega 3 Thật Giả Chuẩn Nhất', date: '05/10/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+2' },
//   { id: 3, title: 'Bí Quyết Tăng Sức Đề Kháng Tự Nhiên Cho Bé', date: '28/09/2026', img: 'https://placehold.co/600x400/e2e8f0/64748b?text=Health+Tips+3' },
// ];

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  // === 4. TẠO STATE ĐỂ CHỨA DỮ LIỆU THẬT ===
  const [products, setProducts] = useState([]);

  // === 5. GỌI DỮ LIỆU TỪ SUPABASE KHI TRANG VỪA MỞ ===
  useEffect(() => {
    const fetchProducts = async () => {
      // Lệnh SQL tương đương: SELECT * FROM products LIMIT 5;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5); 

      if (error) {
        console.error("Lỗi khi kéo dữ liệu:", error);
      } else {
        setProducts(data); // Đổ dữ liệu thật vào State
      }
    };

    fetchProducts();
  }, []); // Dấu [] giúp lệnh này chỉ chạy đúng 1 lần khi load trang
  return (
    <div className="min-h-screen bg-surface font-sans text-slate-800 selection:bg-brand selection:text-white relative">
      
      {/* 1. TOP BAR */}
      <div className="bg-brand text-white text-xs py-2 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14}/> SaHa cam kết 100% hàng chính hãng</span>
          <span className="flex items-center gap-1.5"><Phone size={14}/> Hotline: 0858.433.409</span>
        </div>
      </div>

      {/* 2. HEADER CẢI TIẾN (MEGA MENU) */}
<header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
  {/* Hàng 1: Logo, Tìm kiếm & Tiện ích */}
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
    <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
      <div className="bg-brand-light p-2 rounded-xl">
        <HeartPulse size={32} className="text-brand" />
      </div>
      <span className="text-3xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
    </div>
    
    <div className="flex-1 max-w-2xl relative group">
      <input 
        type="text" 
        placeholder="Tìm sản phẩm..." 
        className="w-full pl-5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all text-sm" 
      />
      <button className="absolute right-1.5 top-1.5 bg-brand text-white p-1.5 rounded-full hover:bg-brand-hover transition-colors">
        <Search size={18} />
      </button>
    </div>

    <div className="flex gap-6 items-center shrink-0">
      <div onClick={() => navigate('/login')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors">
        <User size={22} className="mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Tài khoản</span>
      </div>
      <div onClick={() => navigate('/cart')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors relative">
        <div className="relative">
          <ShoppingCart size={22} className="mb-0.5" />
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">0</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Giỏ hàng</span>
      </div>
    </div>
  </div>

  {/* Hàng 2: Navigation Links (Giống ảnh Vitamin S) */}
  <div className="border-t border-slate-50 bg-white">
    <div className="max-w-7xl mx-auto px-4 flex items-center relative">
      
      {/* Nút Danh Mục (Menu Sidebar xổ xuống) */}
      <div 
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
        className="relative"
      >
        <button className="bg-brand text-white px-8 py-3 flex items-center gap-3 font-bold text-sm rounded-t-lg">
          <ChevronRight size={18} className={`transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} /> Danh mục
        </button>

        {/* MEGA MENU TRÀN VIỀN */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-[1000px] bg-white shadow-2xl rounded-b-3xl border border-slate-100 p-8 flex gap-10 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Cột 1: Thực phẩm bổ sung */}
            <div className="flex-1">
              <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Thực phẩm bổ sung</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="hover:text-brand cursor-pointer">Vitamins & Khoáng chất</li>
                <li className="hover:text-brand cursor-pointer">Bổ Gan / Thải độc</li>
                <li className="hover:text-brand cursor-pointer">Bổ Mắt</li>
                <li className="hover:text-brand cursor-pointer">Bổ Não / Giảm Stress</li>
                <li className="hover:text-brand cursor-pointer">Hỗ trợ giảm cân</li>
                <li className="hover:text-brand cursor-pointer">Xương khớp & Sụn</li>
              </ul>
            </div>

            {/* Cột 2: Chăm sóc sắc đẹp */}
            <div className="flex-1">
              <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Chăm sóc sắc đẹp</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="hover:text-brand cursor-pointer">Collagen</li>
                <li className="hover:text-brand cursor-pointer">Kem chống nắng</li>
                <li className="hover:text-brand cursor-pointer">Kem dưỡng da</li>
                <li className="hover:text-brand cursor-pointer">Nước Hoa Hồng</li>
                <li className="hover:text-brand cursor-pointer">Sữa rửa mặt</li>
              </ul>
            </div>

            {/* Cột 3: Mẹ & Bé */}
            <div className="flex-1">
              <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Mẹ & Bé</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="hover:text-brand cursor-pointer">DHA cho bé</li>
                <li className="hover:text-brand cursor-pointer">Canxi cho bé</li>
                <li className="hover:text-brand cursor-pointer">Vitamin tổng hợp</li>
              </ul>
            </div>

            {/* Cột 4: Sản phẩm mới (Có ảnh nhỏ) */}
            <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
              <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Sản phẩm mới</h4>
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-white rounded-lg shrink-0 overflow-hidden">
                    <img src="https://placehold.co/100x100/ea580c/white?text=DHC" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-bold leading-snug line-clamp-2">Viên uống DHC Multi Vitamins gói 90 ngày</p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-white rounded-lg shrink-0 overflow-hidden">
                    <img src="https://placehold.co/100x100/ea580c/white?text=Omega" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-bold leading-snug line-clamp-2">Omega 3-6-9 Dầu cá hồi Na-uy</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Các Link Menu Ngang */}
      <nav className="flex items-center ml-10 gap-8">
        {['Sản phẩm', 'Thương hiệu', 'Xuất xứ', 'Bài viết'].map((item) => (
          <div key={item} className="group relative py-3 cursor-pointer">
            
            <span className="text-sm font-bold text-slate-600 group-hover:text-brand transition-colors flex items-center gap-1">
              {item} <ChevronRight size={14} className="rotate-90 opacity-40" />
            </span>
            {/* Thanh gạch chân khi hover */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand group-hover:w-full transition-all duration-300"></div>
          </div>
        ))}
      </nav>

    </div>
  </div>
</header>

      {/* 3. HERO BANNER */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-brand-light rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-brand text-xs font-bold rounded-full mb-6 shadow-sm">
              <Sparkles size={14} /> Trợ lý AI tư vấn 24/7
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
              Sức khỏe vững vàng, <br/><span className="text-brand">An tâm mỗi ngày.</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Nhà thuốc SaHa cung cấp hàng ngàn sản phẩm TPCN chính hãng. Trải nghiệm tính năng hỏi đáp cùng Dược Sĩ AI thông minh nhất.
            </p>
            <button className="bg-brand text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-hover shadow-lg hover:shadow-brand/40 transition-all flex items-center gap-2">
              Mua sắm ngay <ChevronRight size={18} />
            </button>
          </div>
          <div className="hidden md:block relative z-10 w-72 h-72 rounded-[3rem] rotate-3 shadow-2xl overflow-hidden border-4 border-white">
            <img src="https://placehold.co/600x600/ea580c/white?text=SaHa" alt="Banner" className="w-full h-full object-cover" />
          </div>
          <HeartPulse size={300} className="absolute -right-20 -bottom-20 text-orange-200 opacity-30" />
        </div>
      </div>

      {/* 4. DANH MỤC */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Danh Mục Chăm Sóc</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {mockCategories.map(cat => (
            <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center cursor-pointer hover:border-brand/50 hover:shadow-md transition-all">
              <div className="text-4xl mb-3 bg-slate-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center">{cat.icon}</div>
              <p className="font-semibold text-slate-700 text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SẢN PHẨM NỔI BẬT */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black text-slate-900">Sản Phẩm Khuyên Dùng</h3>
          <button className="text-brand font-semibold text-sm hover:underline">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {mockProducts.map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col cursor-pointer">
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                {product.oldPrice && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full z-10">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
                <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                
              </div>
              <p className="text-[10px] font-bold text-brand uppercase mb-1">{product.category}</p>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex-1 line-clamp-2">{product.name}</h4>
              <div className="flex items-end justify-between pt-3 border-t border-slate-50">
                <div>
                  <div className="text-lg font-black text-brand">{product.price.toLocaleString()}đ</div>
                  {product.oldPrice && <div className="text-xs text-slate-400 line-through">{product.oldPrice.toLocaleString()}đ</div>}
                </div>
                <button className="bg-brand-light text-brand p-2 rounded-lg hover:bg-brand hover:text-white transition-colors">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. GÓC SỨC KHỎE (BLOG) */}
      <div className="max-w-7xl mx-auto px-4 mt-20 mb-20">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Góc Sức Khỏe SaHa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockBlogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group">
              <div className="overflow-hidden h-48">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                  <Clock size={14} /> {blog.date}
                </div>
                <h4 className="font-bold text-slate-800 text-lg line-clamp-2 group-hover:text-brand transition-colors">{blog.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. FOOTER CHUYÊN NGHIỆP */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <HeartPulse size={32} className="text-brand" />
              <span className="text-3xl font-black text-white tracking-tight">Sa<span className="text-brand">Ha</span></span>
            </div>
            <p className="text-sm mb-6 leading-relaxed">Hệ thống nhà thuốc SaHa chuyên cung cấp dược phẩm, thực phẩm chức năng chính hãng với công nghệ AI hỗ trợ tư vấn thông minh.</p>
            <div className="flex gap-4">
              <Facebook className="hover:text-brand cursor-pointer transition-colors" />
              <Instagram className="hover:text-brand cursor-pointer transition-colors" />
              <Youtube className="hover:text-brand cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Danh mục</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-brand cursor-pointer transition-colors">Thực phẩm chức năng</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Dược mỹ phẩm</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Chăm sóc cá nhân</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Thiết bị y tế</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-brand cursor-pointer transition-colors">Chính sách đổi trả</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Chính sách bảo mật</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Câu hỏi thường gặp (FAQ)</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Hướng dẫn mua hàng</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand shrink-0" />
                <span>Số 06 Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand shrink-0" />
                <span>0858.433.409</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand shrink-0" />
                <span>hotro@saha.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          <p>© 2026 Nhà thuốc SaHa. Đồ án chuyên ngành.</p>
        </div>
      </footer>

      {/* 8. NÚT FLOATING (Gọi, Zalo, AI Chatbot) */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-end">
        {/* Nút Gọi */}
        <button className="bg-green-500 text-white p-3.5 rounded-full shadow-lg hover:scale-110 hover:bg-green-600 transition-all">
          <Phone size={24} />
        </button>
        {/* Nút Chat AI (Lớn hơn, nổi bật hơn) */}
        <button className="bg-brand text-white p-4 rounded-full shadow-xl shadow-brand/30 hover:scale-110 hover:bg-brand-hover transition-all flex items-center gap-3 group">
          <Sparkles size={26} className="animate-pulse" />
          <span className="font-bold hidden group-hover:block whitespace-nowrap overflow-hidden origin-right transition-all">Hỏi AI SaHa</span>
        </button>
      </div>
          <ChatAI />
    </div>
  );
};

export default App;