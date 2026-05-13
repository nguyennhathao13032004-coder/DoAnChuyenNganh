import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, AlertCircle } from 'lucide-react'; // Nhớ import icon

const MyAppointmentHistory = () => {
    const [myAppointments, setMyAppointments] = useState([]);
    // Lấy thông tin user y chang như cách trang Profile đang làm
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Ưu tiên lấy fullName, nếu chưa có thì lấy username, không có nữa thì gán tạm tên Hào
    const currentUser = savedUser.fullName || savedUser.username || 'Nguyễn Nhật Hào';
    useEffect(() => {
        const fetchMyApts = async () => {
            try {
               // Đổi 'api/appointments/...' thành 'api/Admin/...'
const res = await axios.get(`http://localhost:5246/api/Admin/my-appointments?patientName=${currentUser}`);
                setMyAppointments(res.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử hẹn:", error);
            }
        };
        fetchMyApts();
    }, [currentUser]);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="space-y-4">
                {myAppointments.map((apt) => {
                    const statusLower = apt.status?.toLowerCase() || 'pending';
                    const dateObj = new Date(apt.appointmentDate);
                    
                    return (
                        <div key={apt.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            
                            {/* Thông tin giờ giấc */}
                            <div>
                                <div className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <Clock size={18} className="text-orange-500" />
                                    {dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-slate-500 font-medium">
                                    Ngày: {dateObj.toLocaleDateString('vi-VN')}
                                </div>
                            </div>

                            {/* Trạng thái & Link Google Meet */}
                            <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                                
                                {statusLower === 'pending' && (
                                    <span className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl text-sm font-bold flex items-center gap-2 w-fit">
                                        <AlertCircle size={16}/> Đang chờ Dược sĩ duyệt
                                    </span>
                                )}

                                {statusLower === 'cancelled' && (
                                    <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 w-fit">
                                        Lịch hẹn đã bị hủy
                                    </span>
                                )}

                                {/* NẾU ĐÃ DUYỆT VÀ CÓ LINK MEET THÌ HIỆN NÚT NÀY CHO KHÁCH BẤM */}
                                {statusLower === 'confirmed' && (
                                    <>
                                        <span className="text-emerald-500 text-sm font-bold mb-1">✓ Dược sĩ đã sẵn sàng</span>
                                        {apt.meetLink ? (
                                            <a 
                                                href={apt.meetLink} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 w-full md:w-auto justify-center"
                                            >
                                                <Video size={18} /> Tham gia Phòng khám Online
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">Đang cập nhật link...</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {myAppointments.length === 0 && (
                    <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-3xl">
                        Bạn chưa có lịch hẹn tư vấn nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointmentHistory;