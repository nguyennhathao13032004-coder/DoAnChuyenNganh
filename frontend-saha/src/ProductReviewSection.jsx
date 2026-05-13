import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); // State mới để làm hiệu ứng di chuột sáng sao
  const [comment, setComment] = useState('');

  // Tạm fix cứng thông tin User đang đăng nhập
  const currentUser = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "nguyen nhat hao"
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5246/api/Review/product/${productId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi lấy review:", error);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newReview = {
      productId: productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating: parseInt(rating),
      comment: comment
    };

    try {
      const res = await axios.post('http://localhost:5246/api/Review/add', newReview);
      if(res.data.isVerified) {
          alert("Tuyệt vời! Đánh giá của bạn đã được gắn mác 'Đã mua hàng' vì hệ thống xác nhận bạn từng đặt đơn này!");
      } else {
          alert("Đã gửi đánh giá thành công! (Chưa có tích xanh vì hệ thống không tìm thấy lịch sử mua hàng của bạn với sản phẩm này)");
      }
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      alert("Lỗi gửi đánh giá, sếp check lại C# Backend nhé!");
    }
  };

  // UI Styles
  const styles = {
    container: { marginTop: '40px', padding: '20px 0', borderTop: '2px solid #f1f5f9', fontFamily: '"Inter", sans-serif' },
    title: { color: '#0f766e', fontSize: '22px', borderBottom: '2px solid #0d9488', display: 'inline-block', paddingBottom: '8px', marginBottom: '20px' },
    formBox: { backgroundColor: '#f8fafc', padding: '25px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' },
    textarea: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '100px', boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' },
    submitBtn: { padding: '12px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' },
    reviewCard: { padding: '20px 0', borderBottom: '1px solid #e2e8f0' },
    reviewerName: { fontWeight: 'bold', fontSize: '16px', color: '#334155', marginRight: '10px' },
    badgeVerified: { backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px' },
    badgeMedical: { backgroundColor: '#fef08a', color: '#854d0e', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' },
    starsDisplay: { color: '#fbbf24', fontSize: '16px', margin: '8px 0', letterSpacing: '2px' },
    commentText: { color: '#475569', fontSize: '15px', lineHeight: '1.6', marginTop: '5px' },
    date: { fontSize: '13px', color: '#94a3b8', display: 'block', marginTop: '8px' }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Đánh Giá & Nhận Xét Từ Khách Hàng</h3>

      {/* FORM VIẾT ĐÁNH GIÁ */}
      <div style={styles.formBox}>
        <form onSubmit={handleSubmit}>
          
          {/* RATING STARS TƯƠNG TÁC CHUẨN SHOPEE/TIKI */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '15px', color: '#334155', fontSize: '15px' }}>
              Đánh giá của bạn:
            </label>
            <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    fontSize: '32px',
                    lineHeight: '1',
                    // Logic màu sắc: Nếu sao hiện tại nhỏ hơn hoặc bằng (sao đang hover HOẶC sao đã click) thì tô Vàng đậm, ngược lại tô Xám nhạt
                    color: star <= (hoverRating || rating) ? '#fbbf24' : '#e2e8f0', 
                    transition: 'color 0.2s',
                    userSelect: 'none' // Chống bôi đen text khi click click nhanh
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            
            {/* Chữ hiển thị cảm xúc tương ứng với số sao */}
            <span style={{ marginLeft: '20px', fontSize: '14px', fontWeight: 'bold', color: '#0d9488', minWidth: '100px' }}>
              {rating === 5 ? 'Tuyệt vời 😍' : 
               rating === 4 ? 'Rất tốt 😁' : 
               rating === 3 ? 'Bình thường 🙂' : 
               rating === 2 ? 'Tạm được 😕' : 'Rất tệ 😞'}
            </span>
          </div>

          <textarea 
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này nhé..." 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            required 
            style={styles.textarea}
            onFocus={(e) => e.target.style.borderColor = '#0d9488'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          <button 
            type="submit" 
            style={styles.submitBtn}
            onMouseOver={(e) => e.target.style.background = '#0f766e'}
            onMouseOut={(e) => e.target.style.background = '#0d9488'}
          >
            Gửi Đánh Giá
          </button>
        </form>
      </div>

      {/* DANH SÁCH REVIEW */}
      <div>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>💬</span>
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét sản phẩm này!</p>
          </div>
        ) : (
          reviews.map((r, index) => (
            <div key={index} style={styles.reviewCard}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span style={styles.reviewerName}>{r.userName}</span>
                
                {r.isVerifiedPurchase && (
                  <span style={styles.badgeVerified}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Đã mua hàng
                  </span>
                )}

                {r.isPharmacistApproved && (
                  <span style={styles.badgeMedical}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    Dược sĩ khuyên dùng
                  </span>
                )}
              </div>
              
              <div style={styles.starsDisplay}>
                {"★".repeat(r.rating)}<span style={{ color: '#e2e8f0' }}>{"★".repeat(5 - r.rating)}</span>
              </div>
              <p style={styles.commentText}>{r.comment}</p>
              <span style={styles.date}>{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;