import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from './CartContext';

const AiInteractionChecker = () => {
    const { cart } = useCart(); // Lấy danh sách thuốc từ giỏ hàng
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Chỉ chạy AI kiểm tra nếu trong giỏ có từ 2 món trở lên
        if (cart && cart.length >= 2) {
            checkInteractions();
        } else {
            setStatus(null); // Ít hơn 2 món thì không cần kiểm tra
        }
    }, [cart]);

    const checkInteractions = async () => {
        setLoading(true);
        try {
            // Lấy tên các thuốc trong giỏ
            const productNames = cart.map(item => item.name || item.Name);
            
            const res = await axios.post('http://localhost:5246/api/Products/check-interactions', {
                ProductNames: productNames
            });
            setStatus(res.data);
        } catch (error) {
            console.error("Lỗi khi kiểm tra tương tác thuốc:", error);
        } finally {
            setLoading(false);
        }
    };

    if (cart?.length < 2) return null; // Không hiện gì nếu giỏ rỗng hoặc có 1 món

    if (loading) {
        return (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 animate-pulse mb-6">
                <Loader2 size={20} className="text-slate-400 animate-spin" />
                <p className="text-slate-500 text-sm font-medium">AI đang quét tương tác giữa các loại thuốc trong giỏ...</p>
            </div>
        );
    }

    if (!status) return null;

    // NẾU CÓ KỴ NHAU (NGUY HIỂM)
    if (status.hasInteraction) {
        return (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 mb-6 shadow-sm">
                <ShieldAlert size={24} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-red-800 font-black text-sm uppercase tracking-wider mb-1">Cảnh báo tương tác thuốc ({status.severity})</h4>
                    <p className="text-red-600 text-sm font-medium leading-relaxed">{status.warningMessage}</p>
                    <p className="text-red-500 text-xs mt-2 italic">* Vui lòng cân nhắc hoặc hỏi ý kiến bác sĩ trước khi thanh toán.</p>
                </div>
            </div>
        );
    }

    // NẾU AN TOÀN
    return (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
            <div>
                <h4 className="text-emerald-800 font-black text-sm">Liệu trình an toàn</h4>
                <p className="text-emerald-600 text-sm font-medium">Các sản phẩm trong giỏ không có tương tác gây hại khi dùng chung.</p>
            </div>
        </div>
    );
};

export default AiInteractionChecker;