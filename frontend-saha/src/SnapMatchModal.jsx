import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Loader2, Sparkles, AlertTriangle, ShoppingCart, X, ScanSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const SnapMatchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result); 
                const base64String = reader.result.split(',')[1];
                setResult(null); 
                handleSnapMatch(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSnapMatch = async (base64Data) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5246/api/Products/snap-and-match', { 
                ImageBase64: base64Data 
            });
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert("Mắt thần AI đang bận, vui lòng thử lại sau");
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-red-500 text-slate-500 hover:text-white rounded-full flex items-center justify-center transition-colors z-20 shadow-sm backdrop-blur-md">
                    <X size={20} />
                </button>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex items-center gap-4 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <ScanSearch size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">Mắt Thần AI SaHa</h2>
                        <p className="text-emerald-100 text-sm font-medium">Tìm thuốc nhanh bằng hình ảnh vỏ hộp</p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 bg-slate-50">
                    
                    <div className="w-full md:w-[300px] shrink-0">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
                            <div className="w-full h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-4 relative">
                                {imageBase64 ? (
                                    <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={40} className="text-slate-300" />
                                )}
                            </div>
                            <input type="file" accept="image/jpeg, image/png" id="imageInputModal" onChange={handleImageChange} className="hidden" />
                            <label htmlFor="imageInputModal" className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95">
                                {loading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={16} />}
                                {loading ? "Đang quét..." : "Tải ảnh vỏ thuốc"}
                            </label>
                        </div>
                    </div>

                    <div className="flex-1">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3 py-10">
                                <Sparkles size={48} className="text-emerald-300 animate-pulse" />
                                <p className="font-bold text-slate-500 text-sm max-w-xs">Up ảnh vỏ hộp hoặc nhãn thuốc lên đây để AI tìm hàng giúp bạn nhé!</p>
                            </div>
                        ) : (
                            <div className="h-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                
                                {/* TRƯỜNG HỢP ẢNH LỖI */}
                                {result.status === 'error_not_medicine' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-4">
                                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-2 border-rose-100 mb-4 animate-bounce shadow-sm">
                                            <AlertTriangle size={40} className="text-rose-500" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-2">Ảnh không hợp lệ</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            Hình như bạn tải nhầm đơn thuốc khám bệnh, người hoặc đồ vật khác. <br/>
                                            Tính năng này chỉ nhận diện <span className="font-black text-rose-500">vỏ hộp thuốc</span> thôi nhé!
                                        </p>
                                    </div>
                                ) : (
                                    /* TRƯỜNG HỢP ẢNH CHUẨN */
                                    <>
                                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                            <h3 className="font-black text-emerald-800 text-[10px] uppercase tracking-widest mb-3">AI Nhận diện được:</h3>
                                            <div className="space-y-1 text-slate-700 text-sm font-medium">
                                                <p><span className="font-bold">Tên:</span> {result.recognizedInfo?.productName}</p>
                                                <p><span className="font-bold">Thành phần:</span> {result.recognizedInfo?.mainIngredients?.join(', ')}</p>
                                                <p><span className="font-bold">Công dụng:</span> {result.recognizedInfo?.medicalPurpose}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-3">Sản phẩm tại SaHa</h3>
                                            {(!result.matchedProducts || result.matchedProducts.length === 0) ? (
                                                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-600">
                                                    <AlertTriangle size={24} className="shrink-0"/>
                                                    <p className="font-bold text-xs">Chưa tìm thấy sản phẩm tương đương. Bạn chụp lại rõ thành phần hơn nhé!</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
                                                    {result.matchedProducts.map(product => (
                                                        <div key={product.id || product.Id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:border-emerald-300 hover:shadow-md transition-all group">
                                                            <div onClick={() => { onClose(); navigate(`/product/${product.id || product.Id}`); }} className="flex flex-1 items-center gap-3 cursor-pointer">
                                                                <div className="w-14 h-14 bg-slate-50 rounded-lg p-1 shrink-0">
                                                                    <img src={product.imageUrl || product.ImageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug">{product.name || product.Name}</h5>
                                                                    <p className="text-orange-600 font-black text-sm mt-0.5">{formatVND(product.price || product.Price)}</p>
                                                                </div>
                                                            </div>
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
                                                                    alert(`Đã thêm vào giỏ!`);
                                                                }}
                                                                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 hover:bg-emerald-500 hover:text-white transition-all z-10"
                                                            >
                                                                <ShoppingCart size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnapMatchModal;