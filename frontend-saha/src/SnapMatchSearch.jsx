import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Loader2, Sparkles, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext'; // Sửa link context của sếp

const SnapMatchSearch = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [imageBase64, setImageBase64] = useState(null); // Lưu ảnh để hiện preview
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // Lưu kết quả trả về từ C#

    // XỬ LÝ KHI USER CHỌN ẢNH
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // frontend hiện preview
                setImageBase64(reader.result); 
                // Cắt bỏ phần đầu 'data:image/jpeg;base64,' để chỉ lấy chuỗi base64 thuần gửi cho C#
                const base64String = reader.result.split(',')[1];
                setResult(null); // Xóa kết quả cũ
                
                // TỰ ĐỘNG GỌI API LUÔN CHO MƯỢT
                handleSnapMatch(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // GỌI API C# BACKEND
    const handleSnapMatch = async (base64Data) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5246/api/Products/snap-and-match', { 
                ImageBase64: base64Data 
            });
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert("Lỗi mạng, Mắt thần đang bận rồi!");
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* BANNER HEADER */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 text-white flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
                        <Sparkles size={16} className="text-blue-200" /> Công nghệ Snap & Match
                    </div>
                    <h1 className="text-4xl font-black mb-2">Mắt Thần AI - Tìm Thuốc Bằng Ảnh</h1>
                    <p className="text-blue-100 max-w-xl font-medium">Khách hàng chỉ cần chụp vỏ hộp hoặc nhãn thuốc, SaHa AI sẽ tự động đọc, phân tích và tìm kiếm sản phẩm tương đương đang có sẵn trong kho.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* CỘT TRÁI: CHỤP/UP ẢNH */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-100 border border-slate-100 flex flex-col items-center">
                            
                            {/* Khu vực hiện Preview Ảnh */}
                            <div className="w-full h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-6 relative">
                                {imageBase64 ? (
                                    <img src={imageBase64} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={48} className="text-slate-300" />
                                )}
                            </div>

                            {/* Nút Upload Ảnh thật (ẩn) */}
                            <input type="file" accept="image/jpeg, image/png" id="imageInput" onChange={handleImageChange} className="hidden" />
                            
                            {/* Nút bấm để kích hoạt Upload */}
                            <label htmlFor="imageInput" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[13px] uppercase tracking-widest p-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95">
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <Camera size={18} />}
                                {loading ? "Mắt thần đang quét..." : "CHỤP HOẶC TẢI ẢNH VỎ THUỐC"}
                            </label>
                        </div>
                    </div>

                    {/* CỘT PHẢI: KẾT QUẢ TÌM KIẾM */}
                    <div className="flex-1 w-full">
                        <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-100 border border-slate-100 min-h-[400px]">
                            
                            {!result ? (
                                // TRẠNG THÁI TRỐNG
                                <div className="flex flex-col items-center justify-center text-center opacity-50 space-y-4 my-20">
                                    <Sparkles size={64} className="text-blue-300 animate-pulse" />
                                    <p className="font-bold text-slate-500 max-w-sm">Dược sĩ AI SaHa đang sẵn sàng. Hãy tải ảnh vỏ thuốc bên trái để em bắt đầu nhận diện nhé!</p>
                                </div>
                            ) : (
                                // TRẠNG THÁI CÓ KẾT QUẢ
                                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                    
                                    {/* Khối 1: AI Nhận diện */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-4">Mắt thần AI nhận diện được:</h3>
                                        <div className="space-y-2 text-slate-700 font-medium">
                                            <p><span className="font-bold text-slate-800">Tên thuốc:</span> {result.recognizedInfo.productName}</p>
                                            <p><span className="font-bold text-slate-800">Thành phần:</span> {result.recognizedInfo.mainIngredients.join(', ')}</p>
                                            <p><span className="font-bold text-slate-800">Công dụng:</span> {result.recognizedInfo.medicalPurpose}</p>
                                        </div>
                                    </div>

                                    {/* Khối 2: Sản phẩm tương đương ở SaHa */}
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-5 pl-1">Sản phẩm tương đương đang có tại SaHa</h3>
                                        
                                        {result.matchedProducts.length === 0 ? (
                                            // Không tìm thấy hàng
                                            <div className="flex flex-col items-center justify-center text-center p-8 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600 gap-3">
                                                <AlertTriangle size={32} />
                                                <p className="font-bold text-sm">Rất tiếc! SaHa hiện chưa có sản phẩm này hoặc tương đương. Sếp thử chụp rõ thành phần hơn em tìm lại nhé!</p>
                                            </div>
                                        ) : (
                                            // Có hàng
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {result.matchedProducts.map(product => (
                                                    <div key={product.id || product.Id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate(`/product/${product.id || product.Id}`)}>
                                                        <div className="w-20 h-20 bg-slate-50 rounded-lg p-1 shrinkage-0">
                                                            <img src={product.imageUrl || product.ImageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <h5 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{product.name || product.Name}</h5>
                                                            <p className="text-orange-600 font-black text-lg">{formatVND(product.price || product.Price)}</p>
                                                        </div>
                                                        {/* Nút giỏ hàng mini */}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation(); 
                                                                addToCart({
                                                                    id: product.id || product.Id,
                                                                    name: product.name || product.Name,
                                                                    price: product.price || product.Price,
                                                                    imageUrl: product.imageUrl || product.ImageUrl,
                                                                    quantity: 1
                                                                });
                                                                alert(`🎉 Đã thêm vào giỏ!`);
                                                            }}
                                                            className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrinkage-0 hover:bg-orange-500 hover:text-white transition-all z-10"
                                                        >
                                                            <ShoppingCart size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SnapMatchSearch;